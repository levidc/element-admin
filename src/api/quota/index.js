import request from '../request'

// 更新桶配额
export function updateBucketQuota(data) {
  return request({
    method: 'put',
    url: 'UpdateBucketQuota',
    data
  })
}

// 更新用户配额
export function updateUserQuota(data) {
  return request({
    method: 'put',
    url: 'UpdateUserQuota',
    data
  })
}

export function getRank(params) {
  return request({
    method: 'get',
    url: 'homepage/report/ranking',
    params
  })
}

export function getTotal() {
  return request({
    method: 'get',
    url: 'homepage/report/total'
  })
}

export function getTrend(params) {
  return request({
    method: 'get',
    url: 'homepage/report/trend',
    params
  })
}
