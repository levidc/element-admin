import request from '../request'

export function queryPage(data) {
  return request({
    method: 'post',
    url: 'chart/auditLog/queryPage',
    data
  })
}
