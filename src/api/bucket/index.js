import request from '../request'

export function listBucketNames(bucketName) {
  return request({
    method: 'get',
    url: 'listBucketNames',
    params: {
      bucketName
    }
  })
}

export function createBucket(data) {
  return request({
    method: 'post',
    url: 'createBucket',
    data
  })
}

export function getBucket(params) {
  return request({
    method: 'get',
    url: 'getBucket',
    params
  })
}

export function listBucket() {
  return request({
    method: 'get',
    url: '?bucketWarp',
    headers: {
      'request-target': 'gateway'
    }
  })
}

export function listUserBuckets() {
  return request({
    method: 'get',
    url: 'listUserBuckets'
  })
}

export function updateBucket(data) {
  return request({
    method: 'put',
    url: 'updateBucket',
    data
  })
}

export function setBucketOwner(params) {
  return request({
    method: 'put',
    url: 'setBucketOwner',
    params
  })
}

// 文件系统挂载
export function mountFS(data) {
  return request({
    method: 'post',
    url: 'fs/mount',
    data,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

// FS列表
export function getFsList(params) {
  return request({
    method: 'get',
    url: 'fs/list',
    params,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

export function getObjectMeta(params) {
  return request({
    method: 'get',
    url: 'getObjectMeta',
    params
  })
}
