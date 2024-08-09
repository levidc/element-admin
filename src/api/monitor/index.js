import request from '../request'

// 告警list
export function listAlerts (params) {
  return request({
    method: 'get',
    url: 'listAlerts',
    params
  })
}

// 告警确认
export function acknowledgeAlert (params) {
  return request({
    method: 'post',
    url: 'acknowledgeAlert',
    params
  })
}

// 取消确认
export function clearAlertsAcknowledge (params) {
  return request({
    method: 'post',
    url: 'clearAlertsAcknowledge',
    params
  })
}

// 清除告警
export function alertsClear (params) {
  return request({
    method: 'post',
    url: 'alertsClear',
    params
  })
}
// 删除告警
export function deleteAlerts (params) {
  return request({
    method: 'post',
    url: 'deleteAlerts',
    params
  })
}

// 告警详情
export function getAlertDetail (params) {
  return request({
    method: 'get',
    url: 'getAlertDetail',
    params
  })
}

//  获取性能数据时间粒度
export function getPerformanceDataTimeSpan () {
  return request({
    method: 'get',
    url: 'getPerformanceDataTimeSpan'
  })
}

// 查询对象
export function getResource (params) {
  return request({
    method: 'get',
    url: 'getResource',
    params
  })
}

export function listMultiCompressedPerformanceData (params) {
  return request({
    method: 'get',
    url: 'listMultiCompressedPerformanceData',
    params
  })
}

// 告警模板
export function getAlertTemplate () {
  return request({
    method: 'get',
    url: 'getAlertTemplate'
  })
}

export function obtainPerformanceItem (params) {
  return request({
    method: 'get',
    url: 'obtainPerformanceItem',
    params
  })
}

export function obtainUnusedPerformanceItem () {
  return request({
    method: 'get',
    url: 'obtainUnusedPerformanceItem'
  })
}

export function deleteAlertRule (params) {
  return request({
    method: 'post',
    url: 'deleteAlertRule',
    params
  })
}

export function createRule (data) {
  return request({
    method: 'post',
    url: 'createRule',
    data
  })
}

export function enableAlertRule (params) {
  return request({
    method: 'post',
    url: 'enableAlertRule',
    params
  })
}

export function disableAlertRule (params) {
  return request({
    method: 'post',
    url: 'disableAlertRule',
    params
  })
}

export function mergeRule (data) {
  return request({
    method: 'post',
    url: 'mergeRule',
    data
  })
}

export function updateRule (data) {
  return request({
    method: 'post',
    url: 'updateRule',
    data
  })
}

// 告警转发配置

export function listEmailForwardItem () {
  return request({
    method: 'get',
    url: 'listEmailForwardItem'
  })
}

export function deleteEmailForwardItem (params) {
  return request({
    method: 'post',
    url: 'deleteEmailForwardItem',
    params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    transformRequest (data) {
      var str = []
      for (var s in data) {
        str.push(encodeURIComponent(s) + '=' + encodeURIComponent(data[s]))
      }
      return str.join('&')
    }
  })
}

export function updateEmailForwardItem (data) {
  return request({
    method: 'post',
    url: 'updateEmailForwardItem',
    data
  })
}

export function listSnmpForwardItem () {
  return request({
    method: 'get',
    url: 'listSnmpForwardItem'
  })
}

export function updateSnmpForwardItem (data) {
  return request({
    method: 'post',
    url: 'updateSnmpForwardItem',
    data
  })
}

export function getSmtpItem (data) {
  return request({
    method: 'get',
    url: 'getSmtpItem'
  })
}

export function saveOrUpdateSmtpItem (data) {
  return request({
    method: 'post',
    url: 'saveOrUpdateSmtpItem',
    data
  })
}

export function saveEmailForwardItem (data) {
  return request({
    method: 'post',
    url: 'saveEmailForwardItem',
    data
  })
}

