import request from '../request'

// 创建策略
export function createPolicy({ data, params }) {
  return request({
    method: 'post',
    url: 'createPolicy',
    params,
    data
  })
}

// 删除策略
export function deletePolicy(params) {
  return request({
    method: 'post',
    url: 'deletePolicy',
    params
  })
}

// 获取策略
export function getPolicy() {
  return request({
    method: 'get',
    url: 'getPolicy'
  })
}

// 设置用户或组策略
export function setUserOrGroupPolicy(data) {
  return request({
    method: 'post',
    url: 'setUserOrGroupPolicy',
    data
  })
}

export function ActionList() {
  return request({
    method: 'get',
    url: 'ActionList'
  })
}

export function getPermission() {
  return request({
    method: 'get',
    url: 'GetPermission'
  })
}

export function listAllPermissionGroup() {
  return request({
    method: 'get',
    url: 'listAllPermissionGroup'
  })
}

export function updatePermissionGroup(data) {
  return request({
    method: 'post',
    url: 'updatePermissionGroup',
    data
  })
}

export function getPermissionGroup(params) {
  return request({
    method: 'get',
    url: 'getPermissionGroup',
    params
  })
}

export function deletePermissionGroup(params) {
  return request({
    method: 'post',
    url: 'deletePermissionGroup',
    params
  })
}

export function listUsersByUserPolicy(params) {
  return request({
    method: 'get',
    url: 'listUsersByUserPolicy',
    params
  })
}
