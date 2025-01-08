import request from '../request'

export function listStrategyDictionary(params) {
  return request({
    method: 'get',
    url: 'listStrategyDictionary',
    params
  })
}

export function createStrategyDictionary(data) {
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

export function createPolicyExpression(data) {
  return request({
    method: 'post',
    url: 'createPolicyExpression',
    data
  })
}

export function updatePolicyExpression(data) {
  return request({
    method: 'post',
    url: 'updatePolicyExpression',
    data
  })
}

export function deletePolicyExpression(params) {
  return request({
    method: 'delete',
    url: 'deletePolicyExpression',
    params
  })
}

export function createOrUpdateBucketExpression(data) {
  return request({
    method: 'post',
    url: 'createOrUpdateBucketExpression',
    data
  })
}

export function queryBucketExpression(params) {
  return request({
    method: 'get',
    url: 'queryBucketExpression',
    params
  })
}

export function listBucketExpression(params) {
  return request({
    method: 'get',
    url: 'listBucketExpression',
    params
  })
}

