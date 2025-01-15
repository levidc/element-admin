import { asyncRoutes, constantRoutes } from '@/router'
import store from '@/store'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

function routeHasPermission(route, api) {
  if (!route.permission || route.permission.length === 0) {
    return true
  } else if (route.permission.length) {
    // 权限case 一种或多种
    return route.permission.some(x => {
      return api[x]
    })
  }
}

function handlePermissionRoute(route, api) {
  // 过滤无权限的路由、菜单不显示、如需路由过滤 还需额外处理路由拦截（通过异步路由渲染合并到常态）
  const res = []
  route.forEach(item => {
    const tmp = { ...item }
    if (routeHasPermission(item, api)) {
      if (tmp.children) {
        // permission 区分单权限及多权限渲染路由、
        tmp.children = handlePermissionRoute(tmp.children, api)
      }
      res.push(tmp)
    }
  })
  return res
}

/**
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    // routes 展示实际过滤展示的菜单
    const accessConstantRoutes = handlePermissionRoute(constantRoutes, store.state.user.api)
    if (routes.length > 1) {
      // 重定向路由为权限路由第一位
      const routeList = routes[1]
      // redirect配置登录首页及404和重定向
      // console.log(routeList, routeList.children, '333')
      routes[0].redirect = routeList?.children[0]?.path ? routeList.path + '/' + routeList?.children[0]?.path : routeList.path
    } else {
      //
    }
    state.routes = accessConstantRoutes.concat(routes)
    // sideBar 取routes
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      // const accessedRoutes = []

      let accessedRoutes
      // 默认根据权限渲染菜单、此处暂无角色控制、默认admin
      if (roles.includes('admin')) {
        // asyncRoutes
        accessedRoutes = handlePermissionRoute(asyncRoutes, store.state.user.api)
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
