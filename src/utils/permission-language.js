export const permission = {
  // 磁盘
  // 'admin:ListArchivesController': { 'cn': '磁盘列表', sort: 1 },
  // 'admin:GetArchiveController': { 'cn': '访问磁盘详情', sort: 2, menu: 'm1' },
  // 域
  // 'admin:ListDomainController': { 'cn': '域列表', sort: 3 },
  // 'admin:CreateDomainController': { 'cn': '创建域', sort: 4, menu: 'm2' },
  // 'admin:DeleteDomainController': { 'cn': '删除域', sort: 5, menu: 'm2' },
  // 'admin:UpdateDomainController': { 'cn': '更新域', sort: 6, menu: 'm2' },
  // 'admin:ListUnusedInstanceController': { 'cn': '未使用存储节点列表', sort: 7 },
  // 'admin:ListUsedInstanceController': { 'cn': '已使用存储节点列表', sort: 8 },
  // 'admin:RemoveInstanceController': { 'cn': '移除存储节点', sort: 9, menu: 'm2' },
  // 存储池
  // 'admin:ListPoolController': { 'cn': '存储池列表', sort: 10 },
  // 'admin:CreatePoolController': { 'cn': '创建存储池', sort: 11, menu: 'm2' },
  // 'admin:UpdatePoolController': { 'cn': '更新存储池', sort: 12, menu: 'm2' },
  // 'admin:DeletePoolController': { 'cn': '删除存储池', sort: 13, menu: 'm2' },
  // 'admin:ListUnusedDiskController': { 'cn': '未使用磁盘', sort: 14 },
  // 'admin:ListUsedDiskController': { 'cn': '已使用磁盘', sort: 15 },
  // 'admin:RemoveDiskController': { 'cn': '移除磁盘', sort: 16, menu: 'm2' },
  // 服务器
  // 'admin:ListServernodesController': { 'cn': '服务器列表', sort: 17 },
  // 'admin:GetInstanceMaintenanceController': { 'cn': '获取服务器维护信息', sort: 18 },
  // 'admin:CancelInstanceMaintenanceController': { 'cn': '取消维护服务器', sort: 19, menu: 'm3' },
  // 'admin:MarkInstanceMaintenanceController': { 'cn': '开始维护服务器', sort: 20, menu: 'm3' },
  // 'admin:UpdateServernodeController': { 'cn': '更新服务器', sort: 21, menu: 'm3' },
  // 'admin:DeleteServerNodesController': { 'cn': '删除服务器', sort: 22, menu: 'm3' },
  // 'admin:GetServernodeByIdController': { 'cn': '服务器详情', sort: 23, menu: 'm3' },
  // container list
  // 'admin:ListContainerController': { 'cn': '容器列表', sort: 24 },
  // container配置
  // 'admin:ListContainerConfigController': { 'cn': '容器配置列表', sort: 25 },
  // 'admin:CreateOrUpdateContainerConfigController': { 'cn': '创建或更新容器配置', sort: 26, menu: 'm5' },
  // 告警
  // 'admin:ListAlertController': { 'cn': '告警列表', sort: 27 },
  // 'admin:AcknowledgeAlertController': { 'cn': '确认告警', sort: 28, menu: 'm6' },
  // 'admin:AlertsClearController': { 'cn': '清除告警', sort: 29, menu: 'm6' },
  // 'admin:ClearAlertsAcknowledgeController': { 'cn': '清除已确认告警', sort: 30, menu: 'm6' },
  // 'admin:DeleteAlertsController': { 'cn': '删除告警', sort: 31, menu: 'm6' },
  // 'admin:GetAlertDetailController': { 'cn': '告警详情', sort: 32, menu: 'm6' },

  // 告警转发配置
  // 'admin:ListEmailForwardItemController': { 'cn': '告警邮件转发列表', sort: 33 },
  // 'admin:SaveEmailForwardItemController': { 'cn': '创建告警邮件转发', sort: 34, menu: 'm7' },
  // 'admin:UpdateEmailForwardItemController': { 'cn': '更新告警邮件转发', sort: 35, menu: 'm7' },
  // 'admin:DeleteEmailForwardItemController': { 'cn': '删除告警邮件转发', sort: 36, menu: 'm7' },
  // 'admin:GetSmtpItemController': { 'cn': '获取smtp', sort: 37, menu: 'm7' },
  // 'admin:SaveOrUpdateSmtpItemController': { 'cn': '修改smtp', sort: 38, menu: 'm7' },
  // 'admin:ListSnmpForwardItemController': { 'cn': '获取snmp', sort: 39, menu: 'm7' },
  // 'admin:UpdateSnmpForwardItemController': { 'cn': '更新snmp', sort: 40, menu: 'm7' },

  // 告警模板
  // 'admin:GetAlertTemplateController': { 'cn': '告警模板列表', sort: 41 },
  // 'admin:ObtainPerformanceItemController': { 'cn': '性能项列表', sort: 42 },
  // 'admin:ObtainUnusedPerformanceItemController': { 'cn': '未使用性能项列表', sort: 43 },
  // 'admin:CreateRuleController': { 'cn': '创建告警规则', sort: 44, menu: 'm8' },
  // 'admin:DeleteAlertRuleController': { 'cn': '删除告警规则', sort: 45, menu: 'm8' },
  // 'admin:UpdateRuleController': { 'cn': '修改告警规则', sort: 46, menu: 'm8' },
  // 'admin:MergeRuleController': { 'cn': '合并告警规则', sort: 47, menu: 'm8' },
  // 'admin:EnableAlertRuleController': { 'cn': '启用告警规则', sort: 48, menu: 'm8' },
  // 'admin:DisableAlertRuleController': { 'cn': '禁用告警规则', sort: 49, menu: 'm8' },

  // 性能数据
  // 'admin:GetPerformanceDataTimeSpanController': { 'cn': '查询性能项时间跨度' },
  // 'admin:GetResourceController': { 'cn': '查询资源数据' },
  // 'admin:ListMultiCompressedPerformanceDataController': { 'cn': '查询性能项', sort: 50 },

  // 系统
  // 'admin:GetAllInstanceController': { 'cn': '系统列表' },
  // 'admin:StartInstanceController': { 'cn': '启用服务', sort: 51 },
  // 'admin:StopInstanceController': { 'cn': '停止服务', sort: 52 },
  // 'admin:KillInstanceController': { 'cn': '删除服务', sort: 53 },

  // 组件
  // 'admin:CheckTikvStatusController': { 'cn': '访问tikv', sort: 54 },
  // 'admin:CheckRedisStatusController': { 'cn': '访问redis', sort: 55 },

  // 用户
  'admin:ListUsers': { 'cn': '用户列表', sort: 56 },
  'admin:CreateUser': { 'cn': '创建用户', sort: 57, menu: 'm10' },
  'admin:DeleteUser': { 'cn': '删除用户', sort: 58, menu: 'm10' },
  'admin:UpdateUser': { 'cn': '更新用户', sort: 59, menu: 'm10' },
  'admin:EnableUser': { 'cn': '启用用户', sort: 60, menu: 'm10' },
  'admin:DisableUser': { 'cn': '禁用用户', sort: 61, menu: 'm10' },
  'admin:GetUser': { 'cn': '用户详情', sort: 62, menu: 'm10' },
  'admin:AddGroupToUser': { 'cn': '用户配置用户组', sort: 63, menu: 'm10' },
  // 'admin:RemoveGroupFromUser': { 'cn': '用户移除出用户组', sort: 64 },
  // 用户组
  'admin:ListGroups': { 'cn': '用户组列表', sort: 65 },
  'admin:AddGroup': { 'cn': '创建用户组', sort: 66, menu: 'm11' },
  'admin:DeleteGroup': { 'cn': '删除用户组', sort: 67, menu: 'm11' },
  'admin:EnableGroup': { 'cn': '启用用户组', sort: 68, menu: 'm11' },
  'admin:DisableGroup': { 'cn': '禁用用户组', sort: 69, menu: 'm11' },
  // 'admin:GetGroup': { 'cn': '用户组详情', sort: 70, menu: 'm11' },
  'admin:AddUserToGroup': { 'cn': '用户组分配用户', sort: 71, menu: 'm11' },
  // 'admin:RemoveUserFromGroup': { 'cn': '用户组移除用户', sort: 72 },
  // 访问凭证
  // 'admin:ListAccessCredentials': { 'cn': '访问凭证列表', sort: 73 },
  // 'admin:CreateAccessCredential': { 'cn': '创建访问凭证', sort: 74, menu: 'm12' },
  // 'admin:RemoveAccessCredential': { 'cn': '删除访问凭证', sort: 75, menu: 'm12' },
  // 权限策略
  'admin:GetPolicy': { 'cn': '策略列表', sort: 76 },
  'admin:CreatePolicy': { 'cn': '创建策略', sort: 77, menu: 'm13' },
  'admin:DeletePolicy': { 'cn': '删除策略', sort: 78, menu: 'm13' },
  'admin:SetUserOrGroupPolicy': { 'cn': '用户或用户组详情策略分配策略权限', sort: 79 },
  // 组件

  // 版本信息
  // 'admin:GetSystemInfoController': { 'cn': '访问版本信息', sort: 80 },
  // 生命周期执行任务规则
  // 'admin:LifecycleTaskCronController': { 'cn': 'dos内部控制生命周期规则接口', sort: 81 },
  'admin:GetPermission': { 'cn': '获取用户权限(默认)', sort: 82 },
  // 'admin:GetDashboardInfoController': { 'cn': '访问dashboard(默认)', sort: 83 },
  // 'admin:GetAllInstanceController': { 'cn': '服务列表(默认)', sort: 50 },
  'admin:UpdateBucketQuota': { 'cn': '更新桶配额', sort: 85 },
  // 'admin:ListObjectStorageResourceController': { 'cn': '访问存储资源', sort: 86 },
  'admin:ListStorageResourceController': { 'cn': '访问存储资源', sort: 86, menu: 'm14' },
  'admin:AddStorageResourceController': { 'cn': '创建存储资源', sort: 87, menu: 'm14' },
  'admin:GetResourceController': { 'cn': '查询存储资源', sort: 88, menu: 'm14' },
  'admin:DeleteResourceController': { 'cn': '删除存储资源', sort: 89, menu: 'm14' },
  'admin:UpdateStorageResourceController': { 'cn': '更新存储资源', sort: 90, menu: 'm14' },
  'admin:ListStorageDeviceController': { 'cn': '访问存储设备', sort: 91 },
  'admin:AddStorageDeviceController': { 'cn': '创建存储设备', sort: 92, menu: 'm14' },
  'admin:UpdateStorageDeviceController': { 'cn': '更新存储设备', sort: 93, menu: 'm14' },
  'admin:DeleteStorageDeviceController': { 'cn': '删除存储设备', sort: 94, menu: 'm14' },
  'admin:GetDefaultNextResourceController': { 'cn': '获取设备中的默认资源和下一个资源', sort: 94, menu: 'm14' },
  'admin:SetDefaultNextResourceController': { 'cn': '设置默认和下一个资源', sort: 95, menu: 'm14' },
  'admin:GetGlobalConfig': { 'cn': '访问全局配置', sort: 97, menu: 'm15' },
  'admin:SetGlobalConfig': { 'cn': '设置全局配置', sort: 98, menu: 'm15' },
  // 'admin:SysAuditLogController': { 'cn': '系统审计日志', sort: 99, menu: 'm15' },

  // 'admin:ListUsersByUserPolicy': { 'cn': '获取策略关联用户', sort: 99, menu: 'm15' },
  // 'admin:listCluster': { 'cn': '集群列表', sort: 96, menu: 'm15' },
  // 'admin:createCluster': { 'cn': '创建集群资源', sort: 96, menu: 'm15' },
  // 'admin:updateCluster': { 'cn': '修改集群资源', sort: 96, menu: 'm15' },
  // 'admin:deleteCluster': { 'cn': '删除集群资源', sort: 96, menu: 'm15' },
  // 'admin:ListBucket': { 'cn': '桶列表', sort: 97, menu: 'm16' },
  // 'admin:GetBucket': { 'cn': '获取桶', sort: 98, menu: 'm16' },
  'admin:ListPermissionGroupController': { 'cn': '查询S3权限组合', sort: 100 },
  // 'admin:BucketChartController': { 'cn': '桶用量分析', sort: 101 },
  // 'admin:ListDeletedObjects': { 'cn': '查看删除留痕', sort: 102 },
  'admin:ListUserBuckets': { 'cn': '列出用户所有的桶', sort: 103 },
  'admin:ListBucketQuota': { 'cn': '查询桶用量', sort: 104 },
  'admin:CreateBucket': { 'cn': '创建桶', sort: 97, menu: 'm16' },
  'admin:UpdateBucket': { 'cn': '修改桶', sort: 98, menu: 'm16' },
  'admin:PutBucketPolicy': { 'cn': '设置桶策略', sort: 105 },
  'admin:ListAllStorageResourceController': { 'cn': '获取所有底层资源', sort: 106 },
  'admin:GetBucketPolicy': { 'cn': '获取桶策略', sort: 107 },
  // 'admin:ListRestoreRecords': { 'cn': '列出恢复留痕历史', sort: 108 },
  // 'admin:GetDeleteRecord': { 'cn': ' 删除留痕对象快查', sort: 109 },
  // 'admin:HomepageReportController': { 'cn': '访问Dashboard', sort: 110 },
  // 'admin:LifeCycleBucketController': { 'cn': '访问Lifecycle桶列表', sort: 111 },
  // 'admin:LifeCycleTaskInfoController': { 'cn': '访问Lifecycle任务列表', sort: 113 },
  // 'admin:LifeCycleTaskRuleController': { 'cn': '访问Lifecycle任务配置', sort: 112 },
  'admin:GetFileList': { 'cn': '查询对象列表', sort: 114 },
  // 'admin:BucketCache': { 'cn': '热数据缓存配置', sort: 115 },
  // 'admin:BucketCache': { 'cn': '热数据缓存配置', sort: 115 },
  'admin:AssociateBucketAndResourceGroup': { 'cn': '桶关联和查看资源负载组', sort: 116 },
  'admin:QosController': { 'cn': '桶QoS' },
  'admin:BucketExtendInfoController': { 'cn': '负载路由管理' },
  's3:ListObjects': { 'cn': '查看桶下面所有的对象' },
  's3:GetBucketReplication': { 'cn': '获取桶复制配置' },
  's3:DeleteObjects': { 'cn': '批量删除对象' },
  's3:PutBucketLifecycleConfiguration': { 'cn': '设置生命周期配置' },
  's3:PutObjectTagging': { 'cn': '设置对象标签' },
  's3:DeleteObject': { 'cn': '删除对象' },
  's3:ListObjectVersions': { 'cn': '查看对象所有版本' },
  's3:GetBucketWebsite': { 'cn': '获取桶website' },
  's3:PutBucketEncryption': { 'cn': '设置桶加密' },
  's3:GetObjectLegalHold': { 'cn': '获取对象依法保留配置' },
  's3:DeleteBucketPolicy': { 'cn': '删除桶策略' },
  's3:UploadPart': { 'cn': '上传分段' },
  's3:ListMultipartUploads': { 'cn': '查询桶下所有分段上传任务' },
  's3:PutObject': { 'cn': '上传对象' },
  's3:GetObjectLockConfiguration': { 'cn': '获取对象锁配置' },
  's3:DeleteBucketTagging': { 'cn': '删除桶标识' },
  's3:GetBucketTagging': { 'cn': '获取桶标识' },
  's3:ListParts': { 'cn': '列出分段上传任务已经完成的分段' },
  's3:GetBucketLifecycleConfiguration': { 'cn': '获取桶生命周期配置' },
  's3:ListObjectsV2': { 'cn': '查看桶下面所有的对象版本2' },
  's3:AbortMultipartUpload': { 'cn': '终止分段上传' },
  's3:PutBucketTagging': { 'cn': '设置桶标签' },
  's3:DeleteBucket': { 'cn': '删除桶' },
  's3:PutBucketVersioning': { 'cn': '开启桶版本控制' },
  's3:DeleteBucketLifecycle': { 'cn': '删除桶生命周期' },
  's3:GetBucketVersioning': { 'cn': '获取桶版本控制状态' },
  's3:PutBucketWebsite': { 'cn': '设置桶website' },
  's3:PutObjectRetention': { 'cn': '设置桶监管模式的配置' },
  's3:CopyObject': { 'cn': '复制对象' },
  's3:CreateBucket': { 'cn': '创建桶' },
  's3:GetObjectAcl': { 'cn': '获取对象acl配置' },
  's3:DeleteBucketWebsite': { 'cn': '删除桶website配置' },
  's3:PutBucketAcl': { 'cn': '设置桶website配置' },
  's3:HeadBucket': { 'cn': '确认桶是否有访问权限' },
  's3:DeleteObjectTagging': { 'cn': '删除对象标签' },
  's3:GetObjectRetention': { 'cn': '获取对象监管模式配置' },
  's3:HeadObject': { 'cn': '确认对象是否有访问权限' },
  's3:PutObjectLegalHold': { 'cn': '设置对象合规模式配置' },
  's3:CompleteMultipartUpload': { 'cn': '完成分段上传' },
  's3:GetObject': { 'cn': '获取对象' },
  's3:UploadPartCopy': { 'cn': '分段复制' },
  's3:ListBuckets': { 'cn': '查询所有的桶' },
  's3:GetBucketLogging': { 'cn': '获取桶日志记录状态以及用户查看和修改该状态的权限' },
  's3:CreateMultipartUpload': { 'cn': '创建分段上传' },
  's3:PutBucketNotificationConfiguration': { 'cn': '设置桶启用指定事件的通知' },
  's3:GetBucketPolicy': { 'cn': '获取桶策略' },
  's3:GetBucketRequestPayment': { 'cn': '获取桶请求支付配置' },
  's3:GetBucketAccelerateConfiguration': { 'cn': '使用accelerate子资源返回存储桶的传输加速状态' },
  's3:GetObjectTagging': { 'cn': '获取对象标签' },
  's3:PutObjectAcl': { 'cn': '设置桶acl' },
  's3:PutObjectLockConfiguration': { 'cn': '设置对象锁配置' },
  's3:GetBucketAcl': { 'cn': '获取桶acl' },
  's3:PutBucketPolicy': { 'cn': '获取桶策略' },
  's3:GetBucketLocation': { 'cn': '获取桶位置' }
}
// to do 权限按菜单显示、s3权限无分组支持查询权限

export const systemPermission = [
  {
    key: 'Dashboard',
    label: 'Dashboard',
    children:
      [
        {
          key: 'admin:HomepageReportController', label: '访问Dashboard'
        }
      ]
  },
  {
    key: 'resource',
    label: '资源管理',
    children: [
      { key: 'admin:ListStorageResourceController', label: '访问存储资源' },
      { key: 'admin:AddStorageResourceController', label: '创建存储资源' },
      { key: 'admin:GetResourceController', label: '查询存储资源' },
      { key: 'admin:DeleteResourceController', label: '删除存储资源' },
      { key: 'admin:UpdateStorageResourceController', label: '更新存储资源' },
      { key: 'admin:ListStorageDeviceController', label: '访问存储设备' },
      { key: 'admin:AddStorageDeviceController', label: '创建存储设备' },
      { key: 'admin:UpdateStorageDeviceController', label: '更新存储设备' },
      { key: 'admin:DeleteStorageDeviceController', label: '删除存储设备' },
      { key: 'admin:GetDefaultNextResourceController', label: '获取设备中的默认资源和下一个资源' },
      { key: 'admin:SetDefaultNextResourceController', label: '设置默认和下一个资源' },
      { key: 'admin:ListAllStorageResourceController', label: '获取所有底层资源' },
      { key: 'admin:AssociateBucketAndResourceGroup', label: '桶关联和查看资源负载组' },
      { key: 'admin:BucketExtendInfoController', label: '负载路由管理' }
    ]
  },
  {
    key: 'user',
    label: '用户',
    children: [
      {
        key: 'admin:ListUsers',
        label: '用户列表'
      },
      {
        key: 'admin:CreateUser',
        label: '创建用户'
      },
      { key: 'admin:DeleteUser', label: '删除用户' },
      { key: 'admin:UpdateUser', label: '更新用户' },
      { key: 'admin:EnableUser', label: '启用用户' },
      { key: 'admin:DisableUser', label: '禁用用户' },
      { key: 'admin:GetUser', label: '用户详情' },
      { key: 'admin:AddGroupToUser', label: '用户配置用户组' },
      { key: 'admin:ListGroups', label: '用户组列表' },
      { key: 'admin:AddGroup', label: '创建用户组' },
      { key: 'admin:DeleteGroup', label: '删除用户组' },
      { key: 'admin:EnableGroup', label: '启用用户组' },
      { key: 'admin:DisableGroup', label: '禁用用户组' },
      { key: 'admin:AddUserToGroup', label: '用户组分配用户' }
    ]
  },
  {
    key: 'policy',
    label: '权限管理',
    children: [
      { key: 'admin:GetPolicy', label: '策略列表' },
      { key: 'admin:CreatePolicy', label: '创建策略' },
      { key: 'admin:DeletePolicy', label: '删除策略,' },
      { key: 'admin:SetUserOrGroupPolicy', label: '用户或用户组详情策略分配策略权限' },
      { key: 'admin:ListPermissionGroupController', label: '查询S3权限组合' }
    ]
  },
  {
    key: 'operation',
    label: '操作管理',
    children: [
      {
        key: 'admin:SysAuditLogController',
        label: '系统审计日志'
      }
    ]
  },
  {
    key: 'lifecycle',
    label: 'lifecycle管理',
    children: [
      { key: 'admin:LifeCycleBucketController', label: '访问Lifecycle桶列表' },
      { key: 'admin:LifeCycleTaskInfoController', label: '访问Lifecycle任务列表' },
      { key: 'admin:LifeCycleTaskRuleController', label: '访问Lifecycle任务配置' }
    ]
  },
  {
    key: 'bucketCache',
    label: '冷热数据分层管理',
    children: [
      { key: 'admin:BucketCache', label: '冷热数据分层' }
    ]
  },
  {
    key: 'dataRecycle',
    label: '数据回收站',
    children: [
      { key: 'admin:ListDeletedObjects', label: '查看删除留痕' },
      { key: 'admin:GetDeleteRecord', label: ' 删除留痕对象快查' },
      { key: 'admin:ListRestoreRecords', label: '列出恢复留痕历史' },
      { key: 'admin:ListUserBuckets', label: '列出用户所有的桶' }
    ]
  },
  {
    key: 'qosControl',
    label: '集群',
    children: [
      {
        key: 'admin:QosController',
        label: '访问集群资源'
      }
    ]
  },
  {
    key: 'globalConfig',
    label: '全局配置',
    children: [
      { key: 'admin:GetGlobalConfig', label: '访问全局配置' },
      { key: 'admin:SetGlobalConfig', label: '设置全局配置' }
    ]
  },
  {
    key: 'other',
    label: '其他功能',
    children: [
      { key: 'admin:UpdateBucketQuota', label: '更新桶配额' },
      { key: 'admin:BucketChartController', label: '桶用量分析' },
      { key: 'admin:ListBucketQuota', label: '查询桶用量' },
      { key: 'admin:CreateBucket', label: '创建桶' },
      { key: 'admin:UpdateBucket', label: '修改桶' },
      { key: 'admin:PutBucketPolicy', label: '设置桶策略' },
      { key: 'admin:GetBucketPolicy', label: '获取桶策略' },
      { key: 'admin:QosController', label: '桶QoS' }
    ]
  }
]
