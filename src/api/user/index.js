import request from '../request'

// 用户列表
export function listUsers() {
  return request({
    method: 'get',
    url: 'ListUsers'
  })
}
// 用户列表
export function listUserNames(userName) {
  return request({
    method: 'get',
    url: 'ListUserNames',
    params: {
      userName
    }
  })
}
// 创建用户
export function createUser(data) {
  return request({
    method: 'post',
    url: 'CreateUser',
    data
  })
}

// 删除用户
export function deleteUser(name) {
  return request({
    method: 'delete',
    url: 'DeleteUser/' + name
  })
}

// 启用、禁用用户
export function enableUser(name) {
  return request({
    method: 'put',
    url: 'EnableUser/' + name
  })
}

export function disableUser(name) {
  return request({
    method: 'put',
    url: 'DisableUser/' + name
  })
}

// 获取用户
export function getUser(params) {
  return request({
    method: 'get',
    url: 'GetUser',
    params
  })
}

// 组添加到用户
export function addGroupToUser(data) {
  return request({
    method: 'put',
    url: 'AddGroupToUser',
    data
  })
}

// 移除组
export function RemoveGroupFromUser(data) {
  return request({
    method: 'put',
    url: 'RemoveGroupFromUser',
    data
  })
}

// 更新用户
export function updateUser(data) {
  return request({
    method: 'put',
    url: 'UpdateUser',
    data
  })
}

export const throttle = function(fn, delay = 2000) {
  let timer
  return function() {
    const self = this
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(self, arguments)
        timer = null
      }, delay)
    }
  }
}

export const debounce = function(fn, delay = 2000) {
  let timer
  return function() {
    const self = this
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(self, arguments)
    }, delay)
  }
}

// 获取用户桶策略
export function listBucketPoliciesByUser(params) {
  return request({
    method: 'get',
    url: 'listBucketPoliciesByUser',
    params
  })
}
