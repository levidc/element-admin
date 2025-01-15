<template>
  <div v-loading="!judgeType" class="policies">
    <div class="policyContainer">
      <div class="left">
        <svg class="svgicon icon" aria-hidden="true">
          <use xlink:href="#icon-policy" />
        </svg>
        <span class="mr_20">
          {{ $ts('policies.IAM') }}
          <el-popover placement="right" width="700" trigger="hover">
            <p style="line-height:1.6;">{{ $ts('policies.templateNameTip') }}</p>
            <div class="templateN">
              <p v-for="item in templatePolicy" :key="item">
                <span>{{ item }}</span>
              </p>
            </div>
            <svg slot="reference" class="icon icon-question" aria-hidden="true">
              <use xlink:href="#icon-question" />
            </svg>
          </el-popover>
        </span>
        <span v-if="showMenuItem">{{ currentName }}</span>
        <el-input v-else v-model="policyName" :placeholder="$ts('policies.policyNameReg')" size="small" class="mt_10"
          clearable style="width: 400px;margin-left: 20px;" :disabled="!editable" />
      </div>
      <div class="right">
        <el-tooltip :content="$ts('page.return')" placement="top" effect="dark">
          <svg class="icon backicon" aria-hidden="true" @click="onBack">
            <use xlink:href="#icon-fanhui" />
          </svg>
        </el-tooltip>
        <!-- showUpNoMenu -->
        <el-button v-if="showUpNoMenu || showCteatePolicyUp && upShowPolicy" type="warning" class="blue medium"
          size="mini" @click="editable = true; upPolicy()">{{ $ts('page.modify') }}</el-button>
        <el-button v-if="restShow" class="right ml_10 medium" size="mini" @click="cancelMod">{{ $ts('page.reset')
          }}</el-button>
        <el-button v-show="editable || showCteatePolicyUp && saveShow" v-access="'admin:CreatePolicy'" type="primary"
          class="golden medium" size="mini" @click="onSave">{{ $ts('policies.save') }}</el-button>
        <el-button v-if="showMenu" v-access="'admin:DeletePolicy'" type="danger" class="red medium"
          @click="deleteFlag = true">{{ $ts('page.delete') }}</el-button>
      </div>
    </div>
    <Strategy v-if="judgeType" ref="strategy" v-model="strategy" :editable="editable" :action-config="actionConfig"
      height="100%" statement-action-merge-group statement-hide-principal :statement-action-label-width="'150px'"
      :statement-action-item-width="'300px'" :statement-condition-symbols="conditionSymbols"
      :statement-condition-keys="conditionKeys" show-all-permissiion-to-star />
    <el-dialog
      :title="(currentName == 'create' ? $ts('policies.createPolicy') : $ts('policies.modifyPolicy')) + policyName"
      :visible.sync="flag" width="40%">
      <div style="width: 100%">
        <json-viewer :value="jsonTxt" preview-mode boxed :show-array-index="false"
          :copyable="{ 'copyText': $ts('page.copy'), 'copiedText': $ts('page.copied') }"
          theme="my-awesome-json-theme" />
      </div>
      <div slot="footer">
        <el-button class="blue" @click="flag = false">{{ $ts("page.cancel") }}</el-button>
        <el-button class="golden" @click="submitCreate">{{ $ts("page.confirm") }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="$ts('policies.deletePolicy')" :visible.sync="deleteFlag" width="650px">
      <p>{{ $ts('policies.deleteFollowPolicy') }}:
        <span style="color:#ff8746">
          {{ policyName }}
        </span>
      </p>
      <div slot="footer">
        <el-button @click="deleteFlag = false">{{ $ts('page.cancel') }}</el-button>
        <el-button class="golden" @click="deletePolicy">{{ $ts('page.delete') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import Strategy from '@/components/strategy/Strategy.vue'
import {
  deletePolicy,
  getPolicy,
  createPolicy,
  ActionList
} from '@/api/policy'
export default {
  components: {
    Strategy
  },
  data () {
    return {
      saveShow: false,
      restShow: false,
      upShowPolicy: true,
      conditionSymbols: [
        { value: 'IpAddress', label: this.$ts('policies.IpAddress') },
        { value: 'NotIpAddress', label: this.$ts('policies.NotIpAddress') }
      ],
      conditionKeys: [{ value: 'aws:SourceIp', label: this.$ts('policies.awsSourceIp') }],
      strategy: {
        name: '',
        Statement: []
      },
      actionConfig: [],
      templatePolicy: [
        'FullPolicy', // 不能修改 不能删除
        'BasePolicy', // 不能修改 不能删除
        'AdminFull', // 不能修改 不能删除
        'AdminUserAndPolicy',
        'S3ReadOnlyWithOutListObject',
        'S3ReadOnlyWithListObject',
        'S3ReadWrite',
        'S3ReadWriteDelete',
        'S3Full', // 不能修改 不能删除
        'S3Deny', // 不能修改 不能删除
        'PaaSAdminPolicy',
        'RestorePolicy'
      ], // 默认权限、禁用删除、修改
      templateUpPolicy: [
        'AdminUserAndPolicy',
        'S3ReadOnlyWithOutListObject',
        'S3ReadOnlyWithListObject',
        'S3ReadWrite',
        'S3ReadWriteDelete',
        'PaaSAdminPolicy',
        'RestorePolicy'
      ],
      deleteFlag: false,
      judgeType: false,
      editable: false,
      flag: false,
      form: {},
      paramsPolicy: {},
      modFlag: true, // 开启修改按钮、创建不展示
      copystrategy: {}, // 重置修改的数据
      policyName: '',
      menuMap: {
        m1: 'admin:ListArchivesController;admin:GetArchiveController',
        m2: 'admin:ListDomainController',
        m3: 'admin:ListServernodesController;admin:GetServernodeByIdController',
        m4: 'admin:ListContainerController',
        m5: 'admin:ListContainerConfigController',
        m6: 'admin:ListAlertController;admin:GetAlertDetailController',
        m7: 'admin:ListEmailForwardItemController',
        m8: 'admin:GetAlertTemplateController',
        m9: 'admin:ListMultiCompressedPerformanceDataController',
        m10: 'admin:ListUsers;admin:GetUser',
        m11: 'admin:ListGroups;admin:GetGroup',
        m12: 'admin:ListAccessCredentials',
        m13: 'admin:GetPolicy',
        m14: 'admin:ListStorageDeviceController',
        m15: 'admin:listCluster'
        // m16: 'admin:ListBucket'
        //  m13: 'admin:GetPolicy;admin:ListPermissionGroupController',
      },
      connectedPermission: [
        {
          key: 'admin:UpdateDomainController',
          value: [
            'admin:ListUnusedInstanceController',
            'admin:ListUsedInstanceController'
          ]
        }, // 域列表绑定存储节点列表
        {
          key: 'admin:RemoveInstanceController',
          value: [
            'admin:ListUnusedInstanceController',
            'admin:ListUsedInstanceController'
          ]
        },
        {
          key: 'admin:UpdatePoolController',
          value: [
            'admin:ListUnusedDiskController',
            'admin:ListUsedDiskController'
          ]
        }, // 存储池绑定磁盘列表
        {
          key: 'admin:RemoveDiskController',
          value: [
            'admin:ListUnusedDiskController',
            'admin:ListUsedDiskController'
          ]
        },
        {
          key: 'admin:ListContainerController',
          value: ['admin:ListDomainController', 'admin:ListPoolController']
        }, // 访问listcontainer、
        {
          key: 'admin:ListMultiCompressedPerformanceDataController',
          value: [
            'admin:GetResourceController',
            'admin:GetPerformanceDataTimeSpanController'
          ]
        }, // 访问性能数据
        {
          key: 'admin:CreateRuleController',
          value: ['admin:ObtainUnusedPerformanceItemController']
        }, // 添加告警模板
        {
          key: 'admin:GetAlertTemplateController',
          value: ['admin:ObtainPerformanceItemController']
        }, // 告警模板list、添加性能项的countkey的翻译
        {
          key: 'admin:ListServernodesController',
          value: ['admin:GetInstanceMaintenanceController']
        }, // 服务器列表绑定 节点维护信息
        {
          key: 'admin:AddGroupToUser',
          value: ['admin:RemoveGroupFromUser', 'admin:GetUser']
        }, // 添加、移除绑定到addGroup 控制用户组
        {
          key: 'admin:AddUserToGroup',
          value: ['admin:RemoveUserFromGroup', 'admin:GetGroup']
        }, // 用户组分配用户 绑定AddUserToGroup
        {
          key: 'admin:ListUsers',
          value: ['admin:ListPermissionGroupController', 'admin:ListBucketPoliciesByUser', 'admin:GetPolicy', 'admin:GetUser']
        },
        {
          key: 'admin:ListGroups',
          value: ['admin:GetGroup']
        },
        {
          key: 'admin:SetUserOrGroupPolicy',
          value: ['admin:GetPolicy']
        },
        {
          key: 'admin:GetPolicy',
          value: ['admin:ListUsersByUserPolicy']
        }
        // 查看策略列表关联查看策略所在的用户
        // 单个权限访问、需联合其他权限生效

      ]

    }
  },
  computed: {
    showMenu () {
      // 系统权限禁用修改、删除
      return (
        this.$route.params.name !== 'create' &&
        !this.templatePolicy.includes(this.$route.params.name)
      )
    },
    showCteatePolicyUp () {
      return (
        !this.templatePolicy.includes(this.$route.params.name)
      )
    },
    showUpNoMenu () {
      return this.templateUpPolicy.includes(this.$route.params.name) && this.upShowPolicy
    },
    // 'FullPolicy', // 不能修改 删除
    //   'BasePolicy', // 不能修改 删除
    //   'AdminFull', // 不能修改 删除
    //   'AdminUserAndPolicy',
    //   'S3ReadOnlyWithOutListObject',
    //   'S3ReadOnlyWithListObject',
    //   'S3ReadWrite',
    //   'S3ReadWriteDelete',
    //   'S3Full', // 不能修改 删除
    //   'S3Deny', // 不能修改 删除
    //   'PaaSAdminPolicy'
    showMenuItem () {
      return this.templatePolicy.includes(this.$route.params.name)
    },
    currentName () {
      return this.$route.params.name
    },
    jsonTxt () {
      return JSON.parse(JSON.stringify(this.paramsPolicy))
    }
  },
  watch: {
    // strategy(val) {
    //   console.log(val, 'val')
    // }
  },
  mounted () {
    this.getRoute()
    // policy 策略相关字段
    // 版本号 Version
    // 授权语句 Statement
    // 授权效力 Effect Deny || Allow
    // 操作 Action ["admin:*"]
    // 资源 Resource
    // 限制条件 Condition 可选项
    // 授权用户
    this.getAction()
  },
  methods: {
    getRoute () {
      // 完全匹配create 展示edit
      const lastArr = this.$route.path.split('/')
      if (lastArr[lastArr.length - 1] === 'create') {
        this.upShowPolicy = false
      }
    },
    upPolicy () {
      this.restShow = true
      this.upShowPolicy = false
    },
    onBack () {
      this.$router.push({ name: 'GeneralStrategy' })
    },
    getAction () {
      ActionList()
        .then(res => {
          const arr = [
            {
              key: 'admin',
              label: this.$ts('policies.admin'),
              children: []
            }
            // {
            //   key: 's3',
            //   label: 's3权限',
            //   children: []
            // }
          ]
          const systemPermission = this.$store.state.user.systemPermission
          const s3Permission = [{
            key: 's3',
            label: this.$ts('policies.s3'),
            children: []
          }]
          for (let i = 0; i < res.data.length; i++) {
            // 针对页面配置 可访问关联权限、
            // 菜单
            // dashboard、存储桶、文件系统、资源管理、迁移管理、用户管理、lifecycle、冷热数据、
            // 数据回收站、操作管理、全局配置
            if (res.data[i].indexOf('admin:') > -1) {
              // admin权限且有cn、添加到选项中、以此过滤多绑定权限及list
              // if (permission[res.data[i]]) {
              //   arr[0].children.push({
              //     key: res.data[i],
              //     label: permission[res.data[i]]['cn'],
              //     sort: permission[res.data[i]]['sort'] || 99999
              //   })
              // }
              continue
            } else {
              s3Permission[0].children.push(res.data[i])
            }
          }
          // arr[0].children = arr[0].children.sort((a, b) => {
          //   return a.sort - b.sort
          // })
          arr.splice(0, 1, ...systemPermission)
          // console.log(arr, '123')
          s3Permission[0].children = s3Permission[0]
            .children
            .map(item => {
              return {
                key: item,
                label: item
              }
            })
          arr.push(...s3Permission)
          this.actionConfig = arr
          this.getNewPolicy()
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    refreshPage () {
      this.getNewPolicy()
    },
    getNewPolicy () {
      getPolicy()
        .then(res => {
          if (this.$route.params.name !== 'create') {
            const policyDetail = res.data.filter(
              item => item.name === this.$route.params.name
            )[0]
            if (!policyDetail) {
              this.$router.push({ name: 'GeneralStrategy' })
              return this.$msg({
                type: 'error',
                text: this.$ts('error.policiesNotExist')
              })
            }
            this.strategy = policyDetail
            this.policyName = this.currentName
            this.copystrategy = JSON.parse(JSON.stringify(policyDetail))
            this.judgeType = true
            this.$nextTick(() => {
              this.$refs['strategy'].openAll()
            })
            sessionStorage.setItem(
              'policyDetail',
              JSON.stringify(policyDetail)
            )
          } else if (this.$route.params.name === 'create') {
            this.strategy = {
              name: '',
              Statement: []
            }
            this.judgeType = true
            this.editable = true
            this.$nextTick(() => {
              this.$refs['strategy'].onAddNewStatement()
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.judgeType = true
        })
    },
    getPolicy () {
      const policyDetail = JSON.parse(
        sessionStorage.getItem('policyDetail') || null
      )
      // 权限详情页无缓存的数据或者从其他页面跳转、需要匹配当前页面路由参数的策略
      if (!this.$route.params.name) {
        return
      } else if (
        !policyDetail ||
        policyDetail.name !== this.$route.params.name
      ) {
        this.getNewPolicy()
      } else {
        // console.log('%c policy', 'color:blue')
        // console.log(policyDetail)
        this.strategy = policyDetail
        this.policyName = this.currentName
        this.copystrategy = JSON.parse(JSON.stringify(policyDetail))
        this.judgeType = true
        this.$nextTick(() => {
          this.$refs['strategy'].openAll()
        })
      }
    },
    cancelMod () {
      this.$refs['strategy'].openAll()
      this.restShow = false
      this.upShowPolicy = true
      this.editable = false
      this.strategy = this.copystrategy
      this.policyName = this.copystrategy.name
    },
    deletePolicy () {
      deletePolicy({
        policyName: this.currentName
      })
        .then(res => {
          this.$msg({
            type: 'success',
            text: this.$ts('page.responseSuccess')
          })
          sessionStorage.setItem('policyDetail', null)
          this.$router.push({ name: 'GeneralStrategy' })
        })
        .catch(err => {
          console.error(err)
        })
    },
    submitCreate () {
      // this.connectedPermission.length
      // this.paramsPolicy.Statement.forEach(item => {
      //   // 传递还是list
      //   if (typeof item.Action === 'string') { item.Action = [item.Action] }
      // })
      this.flag = false
      for (let i = 0; i < this.paramsPolicy.Statement.length; i++) {
        for (let j = 0; j < this.paramsPolicy.Statement[i].Action.length; j++) {
          for (const item of this.connectedPermission) {
            if (item.key === this.paramsPolicy.Statement[i].Action[j]) {
              this.paramsPolicy.Statement[i].Action.push(...item.value)
              break
            }
          }
        }
      }

      // 关联权限整合
      for (let i = 0; i < this.paramsPolicy.Statement.length; i++) {
        const acts = [...this.paramsPolicy.Statement[i].Action]
        for (let j = 0; j < acts.length; j++) {
          const api = acts[j]
          // 非user.api
          if (
            this.$store.state.user.api[api] &&
            this.$store.state.user.api[api]['menu']
          ) {
            const action = this.menuMap[
              this.$store.state.user.api[api].menu
            ]?.split(';')
            if (action) {
              this.paramsPolicy.Statement[i].Action.push(...action)
            }
          }
        }
      }

      for (let i = 0; i < this.paramsPolicy.Statement.length; i++) {
        this.paramsPolicy.Statement[i].Action = [
          ...new Set(this.paramsPolicy.Statement[i].Action)
        ]
      }
      // 判断每个statement里面的action是否有了menu,有了就添加对应的list\
      // console.log("%c policy", "color:blue;font-size:20px");
      // console.log(this.paramsPolicy.Statement);
      const name = this.copystrategy.name === this.policyName ? '' : this.copystrategy.name
      createPolicy({
        data: this.paramsPolicy,
        params: { policyName: this.policyName, oldPolicyName: name || '' }
      })
        .then(res => {
          this.$msg({
            type: 'success',
            text: this.$ts('page.responseSuccess')
          })
          this.$router.push({
            name: 'GeneralStrategy'
          })
        })
        .catch(err => {
          console.error(err)
        })
    },
    onSave () {
      const nameReg = /^[0-9a-zA-Z]{8,40}$/.test(this.policyName)
      if (!nameReg) {
        return this.$message.error(
          this.$ts('policies.policyNameReg')
        )
      }
      // else if (this.templatePolicy.includes(this.policyName)) {
      //   return this.$message.error(`策略名和模板策略名称${this.policyName}重复请更改`)
      // }
      for (let i = 0; i < this.strategy.Statement.length; i++) {
        // 用户 Principal参数去除
        delete this.strategy.Statement[i].Principal
        if (!this.strategy.Statement[i].Resource.length) {
          return this.$message.error(this.$ts('policies.resourceTip'))
        }
        if (!this.strategy.Statement[i].Action.length) {
          return this.$message.error(this.$ts('policies.actionTip'))
        }
      }
      // console.log("pass");
      // principle 单个传递str
      // 传参前展示bug、不能展示字符串
      // this.strategy.Statement.forEach(item => {
      //   if (item.Resource && item.Resource.length == 1) {
      //     item.Resource = item.Resource.join('')
      //   }
      //   if (item.Action && item.Action.length == 1) {
      //     item.Action = item.Action.join('')
      //   }
      // })
      this.paramsPolicy = {
        Version: '2012-10-17',
        Statement: this.strategy.Statement
      }
      this.flag = true
    }
  }
}
</script>
<style scoped lang="scss">
.templateN {
  display: flex;
  flex-wrap: wrap;

  p {
    width: 33%;
    padding: 5px 0;
  }

  span {
    color: #e39606;
  }
}

::v-deep .jv-container {
  box-sizing: border-box;
  position: relative;
  overflow-y: scroll;

  .jv-code.boxed {
    max-height: 550px !important;
  }
}

.policies {
  height: 93%;
  display: flex;
  flex-direction: column;
  margin: 10px;
  padding: 20px 10px;

  .breadEval {
    margin: -20px 0 0 -20px;
  }
}

.policyContainer {
  padding: 10px 0px;
  flex-grow: 1;

  .left {
    display: flex;
    align-items: center;

    .svgicon {
      font-size: 50px;
      color: #d3d6d8;
    }

    span {
      font-size: 20px;
    }
  }
}

.backicon {
  margin-right: 15px !important;
}
</style>
