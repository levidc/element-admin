import request from '../request'
// 域list
export function listDomain (params) {
  return request({
    method: 'get',
    url: 'listDomain',
    params
  })
}

// 创建域
export function createDomain (data) {
  return request({
    method: 'post',
    url: 'createDomain',
    data
  })
}

// 删除域
export function deleteDomain (data) {
  return request({
    method: 'delete',
    url: 'deleteDomain',
    data
  })
}

// 更新域
export function updateDomain (data) {
  return request({
    method: 'put',
    url: 'updateDomain',
    data
  })
}

// 已使用节点
export function listUsedInstanceById (params) {
  return request({
    method: 'get',
    url: 'listUsedInstanceById',
    params
  })
}

// 未使用节点
export function listUnusedInstanceById (params) {
  return request({
    method: 'get',
    url: 'listUnusedInstanceById',
    params
  })
}

// 移除节点
export function removeInstanceFromDomain (data) {
  return request({
    method: 'put',
    url: 'removeInstanceFromDomain',
    data
  })
}

// 磁盘list
export function listArchives (params) {
  return request({
    method: 'get',
    url: 'listArchives',
    params
  })
}

export function getArchive (params) {
  return request({
    method: 'post',
    url: 'getArchive',
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

// 服务器 list
export function listServerNodes (params) {
  return request({
    method: 'post',
    url: 'listServerNodes',
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

// 获取服务器维护详情
export function getInstanceMaintenance (params) {
  return request({
    method: 'post',
    url: 'getInstanceMaintenance',
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

// 取消维护
export function cancelInstanceMaintenance (params) {
  return request({
    method: 'post',
    url: 'cancelInstanceMaintenance',
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

// 延迟维护
export function markInstanceMaintenance (params) {
  return request({
    method: 'post',
    url: 'markInstanceMaintenance',
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

// 更新服务器
export function updateServernode (params) {
  return request({
    method: 'post',
    url: 'updateServernode',
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

// 删除服务器
export function deleteServerNodes (params) {
  return request({
    method: 'post',
    url: 'deleteServerNodes',
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

// 存储池list
export function listStoragePool (params) {
  return request({
    method: 'get',
    url: 'listStoragePool',
    params
  })
}

// 创建存储池

export function createStoragePool (data) {
  return request({
    method: 'post',
    url: 'createStoragePool',
    data
  })
}

// 更新存储池
export function updateStoragePool (data) {
  return request({
    method: 'put',
    url: 'updateStoragePool',
    data
  })
}

// 移除磁盘
export function removeArchiveFromStoragePool (data) {
  return request({
    method: 'put',
    url: 'removeArchiveFromStoragePool',
    data
  })
}

// 删除存储池
export function deleteStoragePool (data) {
  return request({
    method: 'delete',
    url: 'deleteStoragePool',
    data
  })
}

// 存储池容量
export function listStoragePoolCapacity (data) {
  return request({
    method: 'post',
    url: 'listStoragePoolCapacity',
    data
  })
}

export function IsPoolhasPerformanceData (data) {
  return request({
    method: 'post',
    url: 'IsPoolhasPerformanceData',
    data
  })
}

export function listUnusedArchive (params) {
  return request({
    method: 'get',
    url: 'listUnusedArchive',
    params
  })
}

export function listUsedArchive (params) {
  return request({
    method: 'get',
    url: 'listUsedArchive',
    params
  })
}

export function getServernodeById (params) {
  return request({
    method: 'post',
    url: 'getServernodeById',
    params
  })
}

export function changeDiskLightStatus (data) {
  return request({
    method: 'post',
    url: 'changeDiskLightStatus',
    data
  })
}

export function obtainDiskSmartInfo (data) {
  return request({
    method: 'post',
    url: 'obtainDiskSmartInfo',
    data
  })
}

export function listAllDisk () {
  return request({
    method: 'post',
    url: 'listAllDisk'
  })
}

export function deleteArchives (data) {
  return request({
    method: 'post',
    url: 'deleteArchives',
    data,
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
