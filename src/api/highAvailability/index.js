import request from '../request'

// list获取所有存储桶高可用策略
export function listAllHighBucketConfig() {
  return request({
    method: 'get',
    url: 'listAllHighBucketConfig'
  })
}

// 添加存储桶高可用策略
export function createHighBucketConfig(data) {
  return request({
    method: 'post',
    url: 'createHighBucketConfig',
    data
  })
}

// 获取存储桶高可用策略
export function getHighBucketConfig(params) {
  return request({
    method: 'get',
    url: 'getHighBucketConfig',
    params
  })
}

// 删除存储桶高可用策略
export function deleteHighBucketConfig(params) {
  return request({
    method: 'delete',
    url: 'deleteHighBucketConfig',
    params
  })
}

// 更新存储桶高可用策略

export function updateHighBucketConfig(data) {
  return request({
    method: 'post',
    url: 'updateHighBucketConfig',
    data
  })
}
