import request from '../request'

// 组列表
export function listGroups () {
  return request({
    method: 'get',
    url: 'ListGroups'
  })
}
// 添加组
export function addGroup (data) {
  return request({
    method: 'post',
    url: 'AddGroup',
    data
  })
}
// 删除组
export function deleteGroup (name) {
  return request({
    method: 'delete',
    url: 'DeleteGroup/' + name
  })
}
// 启用/禁用 组
export function enableGroup (name) {
  return request({
    method: 'put',
    url: 'EnableGroup/' + name
  })
}

export function disableGroup (name) {
  return request({
    method: 'put',
    url: 'DisableGroup/' + name
  })
}
// 获取组
export function getGroup (params) {
  return request({
    method: 'get',
    url: 'GetGroup',
    params
  })
}

// 用户添加到组
export function addUserToGroup (data) {
  return request({
    method: 'post',
    url: 'AddUserToGroup',
    data
  })
}

// 用户移除出组
export function removeUserFromGroup (data) {
  return request({
    method: 'put',
    url: 'RemoveUserFromGroup',
    data
  })
}
