import request from '../request'

export function getAllInstance(params) {
  return request({
    method: 'get',
    url: 'getAllInstance',
    params
  })
}

export function startInstance(data) {
  return request({
    method: 'put',
    url: 'startInstance',
    data
  })
}

export function stopInstance(data) {
  return request({
    method: 'put',
    url: 'stopInstance',
    data
  })
}

export function killInstance(data) {
  return request({
    method: 'put',
    url: 'killInstance',
    data
  })
}

export function checkRedisStatus() {
  return request({
    method: 'get',
    url: 'checkRedisStatus'
  })
}

export function checkTikvStatus() {
  return request({
    method: 'get',
    url: 'checkTikvStatus'
  })
}

export function addInstanceGroup(data) {
  return request({
    method: 'post',
    url: 'addInstanceGroup',
    data
  })
}

export function setInstanceGroup(data) {
  return request({
    method: 'post',
    url: 'setInstanceGroup',
    data
  })
}

export function listInstanceGroup() {
  return request({
    method: 'get',
    url: 'listInstanceGroup'
  })
}

export function getInstanceByServiceName() {
  return request({
    method: 'get',
    url: 'getInstanceByServiceName'
  })
}
