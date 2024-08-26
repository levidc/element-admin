import request from '../request'

// 告警list
export function listDeletedObjects(data) {
  return request({
    method: 'post',
    url: 'listDeletedObjects',
    data
  })
}

export function listRestoreRecords(data) {
  return request({
    method: 'post',
    url: 'listRestoreRecords',
    data
  })
}
