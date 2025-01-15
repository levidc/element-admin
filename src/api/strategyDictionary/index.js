import request from '../request'

export function listStrategyDictionary (params) {
  return request({
    method: 'get',
    url: 'listStrategyDictionary',
    params
  })
}

export function createStrategyDictionary (data) {
  return request({
    method: 'post',
    url: 'createStrategyDictionary',
    data
  })
}

export const listPolicyExpression = (params) => {
  return request({
    method: 'get',
    url: 'listPolicyExpression',
    params
  })
}

export function createPolicyExpression (data) {
  return request({
    method: 'post',
    url: 'createPolicyExpression',
    data
  })
}

export function updatePolicyExpression (data) {
  return request({
    method: 'post',
    url: 'updatePolicyExpression',
    data
  })
}

export function deletePolicyExpression (params) {
  return request({
    method: 'delete',
    url: 'deletePolicyExpression',
    params
  })
}

export function createOrUpdateBucketExpression (data) {
  return request({
    method: 'post',
    url: 'createOrUpdateBucketExpression',
    data
  })
}

export function queryBucketExpression (params) {
  return request({
    method: 'get',
    url: 'queryBucketExpression',
    params
  })
}

export function listBucketExpression (params) {
  return request({
    method: 'get',
    url: 'listBucketExpression',
    params
  })
}

export function getGlacier (params) {
  return request({
    method: 'get',
    url: 'glacier/content/get',
    params
  })
}

export function listGlacier (params) {
  return request({
    method: 'get',
    url: 'glacier/content/list',
    params
  })
}

export function deleteGlacier (params) {
  return request({
    method: 'delete',
    url: 'glacier/content/delete',
    params
  })
}

export function addGlacier (data) {
  return request({
    method: 'post',
    url: 'glacier/content/add',
    data
  })
}

export function updateGlacier (data) {
  return request({
    method: 'post',
    url: 'glacier/content/update',
    data
  })
}

export function downLoadGlacier (params) {
  return request({
    method: 'get',
    url: 'glacier/content/download',
    params,
    responseType: 'arraybuffer'
  })
}

