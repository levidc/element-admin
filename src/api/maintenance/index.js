import request from '../request'
export function addManualObjectCleanUp(data) {
  return request({
    method: 'post',
    url: 'addManualObjectCleanUp',
    data
  })
}

export function getTaskList(params) {
  return request({
    method: 'get',
    url: 'getTaskList',
    params
  })
}
