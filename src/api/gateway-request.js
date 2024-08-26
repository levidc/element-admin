import Vue from 'vue'
import axios from 'axios'
import AWS from 'aws-sdk'
export const temp = new Vue()
import store from '@/store/index'
import router from '@/router'
axios.withCredentials = false

const emptySHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
const AmzContentSha256 = 'x-amz-content-sha256'
const SignedHeaders = `${AmzContentSha256};x-amz-date;x-amz-user-agent`

const getGatewayHeaders = ({ path, param = '', region = '', httpMethod = 'GET', accessKeyId = undefined, secretAccessKey = undefined }) => {
  accessKeyId = accessKeyId || ''
  secretAccessKey = secretAccessKey || ''
  const timeStr = (new Date()).toISOString().replace(/\-|:|\.\d\d\d/g, '')

  const getSignatureKey = (credentialMap) => {
    var kDate = AWS.util.crypto.hmac('AWS4' + secretAccessKey, credentialMap.date, 'buffer')
    var kRegion = AWS.util.crypto.hmac(kDate, credentialMap.region, 'buffer')
    var kService = AWS.util.crypto.hmac(kRegion, credentialMap.service, 'buffer')
    var signingKey = AWS.util.crypto.hmac(kService, credentialMap.requestType, 'buffer')
    return signingKey
  }

  const generateCanonicalRequest = (headers, httpParam) => {
    httpParam = httpParam || ''

    const canonicalHeaders = SignedHeaders.split(';').reduce((prev, ele) => {
      prev += ele + ':' + (headers[ele] || '') + '\n'
      return prev
    }, '')

    const requestPayload = headers[AmzContentSha256] || emptySHA256

    return [
      headers.method,
      headers.url,
      httpParam,
      canonicalHeaders,
      SignedHeaders,
      requestPayload
    ].join('\n')
  }

  const stringToSign = (signMap, httpParam) => {
    var parts = []
    parts.push('AWS4-HMAC-SHA256')
    parts.push(signMap['x-amz-date'])
    parts.push(signMap.date + '/' + signMap.region + '/' + signMap.service + '/' + signMap.requestType)
    parts.push(AWS.util.crypto.sha256(generateCanonicalRequest(signMap, httpParam), 'hex'))
    return parts.join('\n')
  }

  const generateSignature = (signMap, httpParam) => {
    const signingKey = getSignatureKey(signMap)
    return AWS.util.crypto.hmac(signingKey, stringToSign(signMap, httpParam), 'hex')
  }

  const calcAuthorization = (headers) => {
    const signMap = { ...headers,
      date: headers['x-amz-date'].substring(0, 8),
      region,
      service: 's3',
      requestType: 'aws4_request',
      method: httpMethod,
      url: path
    }

    const sign = generateSignature(signMap, param)
    const credential = [
      accessKeyId,
      signMap.date,
      signMap.region,
      signMap.service,
      signMap.requestType
    ].join('/')

    return `AWS4-HMAC-SHA256 Credential=${credential}, SignedHeaders=${SignedHeaders}, Signature=${sign}`
  }

  const getHeaders = () => {
    const headers = {
      'amz-sdk-invocation-id': AWS.util.uuid.v4(),
      'amz-sdk-request': 'ttl=' + timeStr + ';attempt=1;max=1',
      'amz-sdk-retry': '0/0/500',
      'x-amz-user-agent': 'aws-sdk-js/2.1166.0 callback',
      [`${AmzContentSha256}`]: emptySHA256,
      'x-amz-date': timeStr
    }
    const authorization = calcAuthorization(headers)
    headers['Authorization'] = authorization
    return headers
  }

  return getHeaders()
}

const request = axios.create({ timeout: 30000 })
request.interceptors.response.use(res => {
  return Promise.resolve(res)
}, error => {
  if (error.request.readyState == 4 && error.request.status == 0) {
    !error.config.ignoreNotice && temp.$ts({
      type: 'error',
      text: temp.$ts('timeoutexception')
    })
    return Promise.reject({ message: temp.$ts('timeoutexception') })
  } else if (!error.request.response) {
    !error.config.ignoreNotice && temp.$ts({
      type: 'error',
      text: '错误：' + temp.$ts(error.request.statusText)
    })
    return Promise.reject({ message: '错误：' + temp.$ts(error.request.statusText) })
  } else if (typeof error.request.response === 'string' && error.request.response.substring(0, 5) == '<?xml') {
    const err = new AWS.XML.Parser().parse(error.request.response)
    const errText = temp.$ts(err.Code) + '：' + temp.$ts(err.Message)
    !error.config.ignoreNotice && temp.$ts({
      type: 'error',
      text: errText
    })
    return Promise.reject({ code: err.Code, message: errText })
  } else if (error.response.data.message.indexOf('auth-error') > -1 || error.response.data.message.indexOf('token timeout') > -1) {
    // s3 bucketList调用登出、若eip环境、路由拦截处理跳转eipInfo
    setTimeout(async() => {
      temp.$ts({
        type: 'error',
        text: 'token已失效，请重新登录'
      })
      await store.dispatch('user/logout')
      router.push(`/login}`)
    }, 200)
    return
  }
  !error.config.ignoreNotice && temp.$ts({
    type: 'error',
    text: temp.$ts(error.message)
  })
  return Promise.reject(error)
})

const GatewayImpl = (config) => {
  const accessKeyId = config.accessKeyId
  const secretAccessKey = config.secretAccessKey
  const endpoint = config.endpoint
  const region = config.region

  const call = (cfg) => {
    cfg = { ...{
      path: '',
      param: {},
      method: 'GET'
    }, ...cfg, ...{
      baseURL: endpoint,
      accessKeyId,
      secretAccessKey,
      region
    }}
    cfg.param = cfg.param ? AWS.util.queryParamsToString(cfg.param) : ''

    const headers = getGatewayHeaders({ ...cfg, httpMethod: cfg.method })
    cfg.url = cfg.path + (cfg.param ? ('?' + cfg.param) : '')
    cfg.headers = headers
    cfg.headers['request-target'] = 'gateway'
    cfg.headers['Authentication'] = localStorage.getItem('token')
    return request(cfg)
  }

  return {
    call
  }
}

export const Gateway = {
  S3: GatewayImpl
}

