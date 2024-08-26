import { getInfo } from '@/api/users'
import { login, refreshToken, checkUserRole } from '@/api/dashboard'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { getPermission } from '@/api/policy'
import config from '../../../proxy.config'
import { Gateway } from '@/api/gateway-request'
const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: ['admin'],
  role: 'user',
  _S3: '',
  _gatewayS3: '',
  port: '',
  user: '',
  activeRoute: false
}

const mutations = {
  SET_ACTIVEROUTE: (state, payload) => {
    state.activeRoute = payload
  },
  SET_TOKEN: (state, token) => {
    state.token = token
    localStorage.setItem('token', token)
  },
  SET_EXPIRE_TOKEN: (state, token) => {
    state.refreshToken = token
    localStorage.setItem('refreshToken', token)
    localStorage.setItem('expireTime', new Date() * 1 + 540 * 1000)
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ACTION: (state, payload) => {
    state.api = payload
    localStorage.setItem('api', JSON.stringify(payload))
  },
  SET_ROLE: (state, payload) => {
    state.role = payload
    localStorage.setItem('role', payload)
  },
  getS3(state, payload) {
    state._S3 = payload
  },
  gatewayS3(state, payload) {
    state._gatewayS3 = payload
  },
  getPort(state, payload) {
    state.port = payload
  },
  SET_USER(state, payload) {
    state.user = payload
    localStorage.setItem('user', payload)
  }
}

const actions = {
  // user login
  setS3EndPoint({ commit, state, dispatch }) {
    const AWS = require('aws-sdk')
    return new Promise((resolve, reject) => {
      let port = ''
      const htLocation = [
        'eipsit.htsc.com.cn',
        'eip.htsc.com.cn',
        'eipnew.htsc.com.cn',
        'eipuat.htsc.com.cn'
      ]
      const isHtEnv = htLocation.some(x => window.location.href.indexOf(x) > -1)
      if (window.location.host.indexOf('localhost') > -1) {
        port = config['devServerProxy']['/api/']['target'] + '/dos'
      } else if (isHtEnv) {
        port = window.location.origin + '/s3sg/dos'
      } else {
        port = window.location.origin + '/dos'
      }
      localStorage.setItem('port', port)
      commit('getPort', port)
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
      var gatewayS3 = Gateway.S3({
        accessKeyId: 'test',
        secretAccessKey: 'test',
        endpoint: port,
        region: 'EastChain-1'
      })
      commit('getS3', S3)
      commit('gatewayS3', gatewayS3)
      resolve(port)
    })
  },
  getAccessPermission({ dispatch, commit, state }) {
    return new Promise((resolve, rej) => {
      const p1 = dispatch('setS3EndPoint')
      const p2 = getPermission().then(res => {
        const obj = {}
        for (let i = 0; i < res.data.actionList.length; i++) {
          obj[res.data.actionList[i]] = true
        }
        commit('SET_ACTION', obj)
      }).catch((err) => {
        rej(err)
      })
      const p3 = checkUserRole().then((res) => {
        commit('SET_ROLE', res.data)
      })
      Promise.allSettled([p1, p2, p3])
        .then(res => {
          const api = state.api || {}
          console.log(api, state.role)
          api['isAdmin'] = ['superAdmin', 'fullPolicyAdmin'].includes(state.role)
          commit('SET_ACTION', api)
          resolve(res)
        }).catch(err => {
          rej(err)
        })
    })
  },
  login({ commit, dispatch }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ userName: username.trim(), password: password }).then(response => {
        // console.log(response, 'response')
        const { data } = response
        commit('SET_USER', username)
        commit('SET_TOKEN', data.accessToken)
        commit('SET_EXPIRE_TOKEN', data.refreshToken)
        setToken(data.token)
        dispatch('getAccessPermission').then(() => {
          resolve()
        })
      }).catch(error => {
        reject(error)
      })
    })
  },
  getToken({ commit }) {
    const token = localStorage.getItem('refreshToken')
    return new Promise(resolve => {
      refreshToken(token)
        .then((res) => {
          commit('SET_TOKEN', res.data.accessToken)
          commit('SET_EXPIRE_TOKEN', res.data.refreshToken)
          resolve()
        })
        .catch(error => {
          console.error(error)
        })
    })
  },
  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { roles, name, avatar, introduction } = data

        // roles must be a non-empty array
        if (!roles || roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
        }

        commit('SET_ROLES', roles)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_INTRODUCTION', introduction)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resetRouter()
      dispatch('tagsView/delAllViews', null, { root: true })
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
