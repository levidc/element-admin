import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
var AWS = require('aws-sdk')
NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)
  await presistStoreState()

  // determine whether the user has logged in
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const activeRoute = store.state.user.activeRoute
      if (activeRoute) {
        next()
      } else {
        store.commit('user/SET_ACTIVEROUTE', true)
        const accessRoutes = await store.dispatch('permission/generateRoutes', ['admin'])
        // dynamically add accessible routes
        // router.reloadRouter()
        router.addRoutes(accessRoutes)
        // 重定向移除 accessRoutes 第一项redirect路由、accessRoutes为异步权限路由
        judgeDirect(accessRoutes.length > 1 ? accessRoutes.slice(1) : accessRoutes, to).then((res) => {
          if (res) {
            next({ ...to, replace: true })
          } else {
            next({ path: '/', replace: true })
          }
        })
      }
      return
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
const presistStoreState = () => {
  return new Promise((resolve) => {
    const user = localStorage.getItem('user')
    const api = localStorage.getItem('api')
    const role = localStorage.getItem('role')
    store.commit('user/SET_ACTION', JSON.parse(api))
    store.commit('user/SET_USER', user)
    store.commit('user/SET_ROLE', role)
    const port = localStorage.getItem('port')
    const s3 = store.state.user._S3
    if (!s3 && port !== 'null') {
      var S3 = new AWS.S3({
        accessKeyId: 'test',
        secretAccessKey: 'test',
        endpoint: port,
        region: 'EastChain-1',
        s3ForcePathStyle: true
      })
      AWS.events.on('send', (req) => {
        req.request.httpRequest.headers['Authentication'] = localStorage.getItem('token')
        req.request.httpRequest.headers['request-target'] = 'gateway'
      })
      store.commit('user/getS3', S3)
    }
    resolve()
  })

  // 需要同步username、user信息
  // 接口权限信息、关联页面访问
  // s3服务
}

// 递归处理redirect路径是否有访问权限、要求路径依次根据/解析，驼峰命名（特殊含有路由参数还需判断）
const judgeDirect = (routes, to) => {
  const path = to.path
  // path为全路径 /xxx/xxx/xxx
  const getPath = (routes, path) => {
    // x.path需格式'/',刷新重定向特殊情况还需要判断-1位（路由参数）是否已经满足
    // 1)递归处理、但处理path会有问题、routes、当前通过path拼接处理
    // 2)所有路由列出、模糊匹配path算拥有权限
    // path从外层 父级路由匹配、仅匹配一级、随后将path移除、剩余递归匹配
    // 详情detail匹配、桶详情detail参数在path中、需要特殊处理
    if (path.indexOf('BucketDetail') > -1) return true
    const isExist = routes.find(x =>
      path.indexOf(x.path) > -1
    )
    // console.log(isExist, path, 'path', routes)
    // isExist 匹配外层path，
    const rootDir = isExist && isExist.path
    if (isExist) {
      if (isExist.children) {
        return getPath(isExist.children, path.slice(rootDir.length + 1))
      } else {
        // 没有children停止匹配
        return true
      }
    } else {
      return false
    }
  }
  return new Promise((resolve) => {
    const res = getPath(routes, path)
    resolve(res)
  })
}
