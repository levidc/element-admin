import request from '../request'

// 获取桶缓存配置
export function getBucketCacheConfig (params) {
  return request({
    method: 'get',
    url: 'getBucketCacheConfig',
    params
  })
}

// 获取全局缓存配置
export function getGlobalCacheConfig () {
  return request({
    method: 'get',
    url: 'getGlobalCacheConfig'
  })
}

// 设置的缓存配置
export function saveBucketCacheConfig (data) {
  return request({
    method: 'post',
    url: 'saveBucketCacheConfig',
    data
  })
}

// 设置全局缓存配置
export function saveGlobalCacheConfig (data) {
  return request({
    method: 'post',
    url: 'saveGlobalCacheConfig',
    data
  })
}

// 获取桶列表缓存
export function listBucketCache () {
  return request({
    method: 'get',
    url: 'listBucketCache'
  })
}

