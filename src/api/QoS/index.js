import request from '../request'

export function updateBucketQos (params) {
  return request({
    method: 'post',
    url: 'qos/saveOrUpdate',
    params
  })
}
export function getBucketQos (params) {
  return request({
    method: 'get',
    url: 'qos/list',
    params
  })
}
