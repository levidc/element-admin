import request from '../request'
// 获取物理/生命周期规则

export function getBucketRule (params) {
  return request({
    method: 'get',
    url: 'lifecycle/bucket/search',
    params
  })
}

// 配置开关
export function setRuleOpen (params) {
  return request({
    method: 'post',
    url: 'lifecycle/rule/open',
    params
  })
}

export function getRule (data) {
  return request({
    method: 'post',
    url: 'lifecycle/rule/search',
    data
  })
}

export function updateRule (data) {
  return request({
    method: 'post',
    url: 'lifecycle/rule/update',
    data
  })
}

// 获取任务详情
export function getTaskDetail (data) {
  return request({
    method: 'post',
    url: 'lifecycle/task/detail',
    data
  })
}

// 获取任务列表
export function getTaskList (params, data) {
  return request({
    method: 'post',
    url: 'lifecycle/task/search',
    data,
    params
  })
}

// 更新任务
export function updateTaskStatus (data) {
  return request({
    method: 'post',
    url: 'lifecycle/task/statusChange',
    data
  })
}
