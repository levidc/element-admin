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
  // 过滤无权限的路由
  const res = []
  route.forEach(item => {
    const tmp = { ...item }
    if (routeHasPermission(item, api)) {
      if (tmp.children) {
        tmp.children = handlePermissionRoute(tmp.children, api)
      }
      res.push(tmp)
    }
  })
  return res
}

/**
 * Filter asynchronous routing tables by recursion
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
    //
    const accessConstantRoutes = handlePermissionRoute(constantRoutes, store.state.user.api)
    state.routes = accessConstantRoutes.concat(routes)
    // sideBar 取routes
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      // const accessedRoutes = []

      let accessedRoutes
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
