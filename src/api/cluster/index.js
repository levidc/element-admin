import request from '../request'
// 获取集群
export function listCluster (params) {
  return request({
    method: 'get',
    url: 'qos/get',
    params
  })
}

