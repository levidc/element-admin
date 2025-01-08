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

// 获取客户端list
export const getNfsClientList = (params) => {
  return request({
    method: 'get',
    url: 'fs/share/nfs/client/list',
    params,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

// 创建nfs客户端
export const createNfsClient = (data) => {
  return request({
    method: 'post',
    url: 'fs/share/nfs/client/create',
    data,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

export const getNfsClient = (params) => {
  return request({
    method: 'get',
    url: 'fs/share/nfs/client/get',
    params,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

// 删除客户端
export const deleteNfsClient = (params) => {
  return request({
    method: 'delete',
    url: 'fs/share/nfs/client/delete',
    params,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

export const shareApply = (data) => {
  return request({
    method: 'post',
    url: 'fs/share/apply',
    data,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

export const shareUnapply = (data) => {
  return request({
    method: 'post',
    url: 'fs/share/unapply',
    data,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

// list all applied fs about share client
export const listClientFS = (params) => {
  return request({
    method: 'get',
    url: 'fs/share/fs/about/client/list',
    params,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

// list all share client about fs
export const listFSClient = (params) => {
  return request({
    method: 'get',
    url: 'fs/share/client/about/fs/list',
    params,
    headers: {
      'Request-Target': 'fs'
    }
  })
}

export const getUnusedClient = (params) => {
  return request({
    method: 'get',
    url: 'fs/share/client/about/fs/list/no',
    params,
    headers: {
      'Request-Target': 'fs'
    }
  })
}
