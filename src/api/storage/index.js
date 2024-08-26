import request from '../request'

export function listContainerConfig(params) {
  return request({
    method: 'get',
    url: 'listContainerConfig',
    params
  })
}

export const deleteContainer = (params) => {
  return request({
    method: 'Delete',
    url: 'deleteContainer',
    params
  })
}

export function createOrUpdateContainerConfig(data) {
  return request({
    method: 'put',
    url: 'createOrUpdateContainerConfig',
    data
  })
}

export function listContainer(params) {
  return request({
    method: 'get',
    url: 'listContainer',
    params
  })
}

// 生命周期任务 执行周期
// /putLifecycleTaskCron配置 /getLifecycleTaskCron查找

export function putLifecycleTaskCron({ data, params }) {
  return request({
    method: 'post',
    url: 'putLifecycleTaskCron',
    params,
    data
  })
}

export function getLifecycleTaskCron(params) {
  return request({
    method: 'get',
    url: 'getLifecycleTaskCron',
    params
  })
}

export function getBucketStatic(params) {
  return request({
    method: 'put',
    url: 'getBucketStatic',
    params
  })
}

export function UpdateBucketQuota(data) {
  return request({
    method: 'put',
    url: 'UpdateBucketQuota',
    data
  })
}

export function SetBucketQuota(data) {
  return request({
    method: 'put',
    url: 'SetBucketQuota',
    data
  })
}

export function listObjectStorageResource() {
  return request({
    method: 'get',
    url: 'listObjectStorageResource'
  })
}

export function addObjectStorageResource(data) {
  return request({
    method: 'post',
    url: 'addStorageResource',
    data
  })
}

export function updateObjectStorageResource(data) {
  return request({
    method: 'post',
    url: 'updateStorageResource',
    data
  })
}

export function removeObjectStorageResource(params) {
  return request({
    method: 'delete',
    url: 'deleteStorageResource',
    params
  })
}

export function addStorageDevice(data) {
  return request({
    method: 'post',
    url: 'addStorageDevice',
    data
  })
}

export function deleteStorageDevice(params) {
  return request({
    method: 'delete',
    url: 'deleteStorageDevice',
    params
  })
}

export function listStorageDevice() {
  return request({
    method: 'post',
    url: 'listStorageDevice'
  })
}

export function updateStorageDevice(data) {
  return request({
    method: 'post',
    url: 'updateStorageDevice',
    data
  })
}

export function getStorageDevice(params) {
  return request({
    method: 'get',
    url: 'getStorageDevice',
    params
  })
}

export function getStorageResource(params) {
  return request({
    method: 'get',
    url: 'getStorageResource',
    params
  })
}

export function getDefaultNextResource(params) {
  return request({
    method: 'get',
    url: 'getDefaultNextResource',
    params
  })
}

export function setDefaultNextResource(params) {
  return request({
    method: 'get',
    url: 'setDefaultNextResource',
    params
  })
}

export function getResourceStatus(params) {
  return request({
    method: 'get',
    url: 'getResourceStatus',
    params
  })
}

export function listAllStorageResource() {
  return request({
    method: 'get',
    url: 'listAllStorageResource'
  })
}

// 添加或更新负载
export function putLoadGroup(data) {
  return request({
    method: 'post',
    url: 'loadGroup/change',
    data
  })
}

export function getGroupList(data) {
  return request({
    method: 'post',
    url: 'loadGroup/list',
    data
  })
}

// 切换负载组开关
export function putSwitch(params) {
  return request({
    method: 'put',
    url: 'loadGroup/switch',
    params
  })
}

// 切换负载组项 开关
export function putSwitchItem(params) {
  return request({
    method: 'put',
    url: 'loadGroupItem/switch',
    params
  })
}

export function deleteLoadGroup(params) {
  return request({
    method: 'delete',
    url: 'loadGroup',
    params
  })
}

// 切换默认负载组
export function switchDefaultGroup(params) {
  return request({
    method: 'post',
    url: 'loadGroup/default/switch',
    params
  })
}

// 负载路由list
export function getBucketExtendList() {
  return request({
    method: 'get',
    url: 'bucketExtend/list'
  })
}

// 查询桶负载路由
export function getBucketExtend(params) {
  return request({
    method: 'get',
    url: 'bucketExtend/query',
    params
  })
}

// 创建桶负载
export function putBucketExtend(data) {
  return request({
    method: 'post',
    url: 'bucketExtend/save',
    data
  })
}

// ===融合===
export function listStorageResource(params) {
  return request({
    method: 'get',
    url: 'listStorageResource',
    params
  })
}

export function queryTasks({ data, params }) {
  return request({
    method: 'post',
    url: 'queryTasks',
    data: data || {},
    params
  })
}

export function createTask(data) {
  return request({
    method: 'post',
    url: 'createTask',
    data
  })
}

export function queryOperationLogs({ data, params }) {
  return request({
    method: 'post',
    url: 'queryOperationLogs',
    data: data || {},
    params
  })
}

export function retryTask(params) {
  return request({
    method: 'put',
    url: 'retryTask',
    params
  })
}

export function queryMoveBackTasks({ data, params }) {
  return request({
    method: 'post',
    url: '/moveback/queryTasks',
    data: data || {},
    params
  })
}

export function createMoveBackTasks(data) {
  return request({
    method: 'post',
    url: '/moveback/createTask',
    data
  })
}

export function getEsIndices(params) {
  return request({
    method: 'get',
    url: 'getEsIndices',
    params
  })
}

export function getDatabaseTable(params) {
  return request({
    method: 'get',
    url: 'getDatabaseTable',
    params
  })
}

export function retryTaskMove(params) {
  return request({
    method: 'put',
    url: '/moveback/retryTask',
    params
  })
}

export function cloneTask(data) {
  return request({
    method: 'post',
    url: 'cloneTask',
    data
  })
}

// 删除任务
export const deleteTask = (params) => {
  return request({
    url: 'deleteTask',
    method: 'DELETE',
    params
  })
}

export const deleteMoveBackTask = (params) => {
  return request({
    url: 'moveback/deleteTask',
    method: 'DELETE',
    params
  })
}
