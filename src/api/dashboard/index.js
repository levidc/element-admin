import request from '../request'
import axios from 'axios'
const htLocation = [
  'eipsit.htsc.com.cn',
  'eip.htsc.com.cn',
  'eipnew.htsc.com.cn',
  'eipuat.htsc.com.cn'
  // 'localhost'
]
const isHtEnv = htLocation.some(x => window.location.href.indexOf(x) > -1)
if (isHtEnv) {
  axios.defaults.baseURL = process.env.NODE_ENV === 'development'
    ? 's3sg/api/' : window.location.origin + '/s3sg/'
} else {
  axios.defaults.baseURL = process.env.NODE_ENV === 'development' ? '/api/' : ''
}
export function getDashboardInfo(params) {
  return request({
    method: 'get',
    url: 'getDashboardInfo',
    params
  })
}
// login
export function login(data) {
  return request({
    method: 'post',
    url: 'login',
    data
  })
}

export function eipLogin() {
  return request({
    method: 'post',
    url: 'eipLogin'
  })
}

export function refreshToken(token) {
  return request({
    method: 'post',
    url: 'RefreshToken/' + token
  })
}

// endPoint
export function getEndPoint() {
  return request({
    url: 'getEndpoint',
    type: 'get'
  })
}

// system info
export function getSystemInfo() {
  return request({
    method: 'get',
    url: 'getSystemInfo'
  })
}

export function getMoniorServer() {
  return request({
    method: 'post',
    url: 'getMoniorServer'
  })
}

export function getGlobalConfig() {
  return request({
    method: 'get',
    url: 'globalConfig'
  })
}

export function setGlobalConfig(data) {
  return request({
    method: 'post',
    url: 'globalConfig',
    data
  })
}

export function getDIH() {
  return axios.get('/sys/isSwitch', {
  })
}

export function getRank(params) {
  return request({
    method: 'get',
    url: '/homepage/report/ranking',
    params
  })
}

export function getRankPage(params) {
  return request({
    method: 'get',
    url: '/homepage/report/ranking/page',
    params
  })
}

export function getTotal() {
  return request({
    method: 'get',
    url: '/homepage/report/total'
  })
}

export function getTrend(params) {
  return request({
    method: 'get',
    url: '/homepage/report/trend',
    params
  })
}

// todo judge admin Policy
export function checkUserRole() {
  return request({
    method: 'post',
    url: 'CheckUserRole'
  })
}
