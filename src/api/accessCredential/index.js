import request from '../request'

// 创建凭证
export function createAccessCredential(data) {
  return request({
    method: 'post',
    url: 'CreateAccessCredential',
    data
  })
}

// 凭证列表
export function listAccessCredentials(data) {
  return request({
    method: 'get',
    url: 'ListAccessCredentials',
    data
  })
}

// 删除凭证
export function removeAccessCredential(data) {
  return request({
    method: 'delete',
    url: 'RemoveAccessCredential',
    data
  })
}
