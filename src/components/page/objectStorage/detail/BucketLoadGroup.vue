<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div
            id="openCache-info-field"
            class="param-box"
          >
            <div class="param-hd">
              <h3 id="openCache">负载路由</h3>
              <el-button
                v-show="!editVersionControl&&!loading"
                class="modBtn"
                type="text"
                @click="editVersionControl=!editVersionControl"
              >
                <span style="color: #ff8746;position: relative;top:3px">编辑</span>
              </el-button>
            </div>
            <div
              v-loading="loading"
              class="param-bd"
            >
              <el-form
                label-position="left"
                :model="editForm"
              >
                <el-form-item>
                  <span slot="label">
                    当前配置
                  </span>
                  <span
                    v-show="!editVersionControl&&!loading"
                    style="color:#ff8746"
                    class="item-descr-txt"
                  >
                    <el-tag v-if="loadGroupName">
                      {{ loadGroupName }}
                    </el-tag>
                    <span v-else>无</span>
                  </span>
                  <el-select
                    v-if="editVersionControl"
                    v-model="editForm.editLoadGroup"
                    value-key="value"
                    style="width:22%"
                    filterable
                  >
                    <el-option-group
                      v-for="group in filterLoadGroupList"
                      :key="group.label"
                      :label="group.label"
                    >
                      <el-option
                        v-for="{label,value,groupTag} in group.options"
                        :key="label"
                        :label="label"
                        :value="{value,groupTag}"
                      />
                    </el-option-group>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="editVersionControl">
                  <span
                    slot="label"
                    style="opacity:0"
                  >#</span>
                  <el-button
                    type="default"
                    size="mini"
                    class="blue"
                    @click="editVersionControl=!editVersionControl;getConfig()"
                  >取消</el-button>
                  <el-button
                    type="primary"
                    class="golden"
                    size="mini"
                    @click="saveConfig();"
                  >应用更改</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { listUserBuckets } from '@/api/bucket'
import {
  getBucketExtend, getGroupList, putBucketExtend
} from '@/api/storage'
export default {
  name: 'BucketList',
  components: {},
  filters: {},
  data () {
    return {
      disableDefault: true,
      bucketId: '',
      loading: false,
      noVersionControl: true,
      editVersionControl: false,
      chargeLoadGroup: false,
      editForm: {
        editLoadGroup: ''
      },
      loadGroupName: '',
      defaultGroupName: '',
      defaultGroupId: ''
    }
  },
  computed: {
    bucketName () {
      return this.$route.params.id
    },
    filterLoadGroupList () {
      return this.loadGroupList.filter(x => x.options.length)
    }
  },
  mounted () {
    this.getConfig()
  },
  destroyed () { },
  methods: {
    getConfig () {
      this.loading = true
      listUserBuckets().then((res) => {
        this.buckets = res.data.list || []
        // const bucketId = '127827857484759040'
        this.bucketId = this.buckets.find(x => x.name === this.bucketName).id.toString()
        Promise.allSettled([
          getBucketExtend({
            bucketId: this.bucketId
          }), getGroupList()
        ])
          .then(all => {
            const config = all[0].value.data || []
            const {
              cacheLoadGroupId,
              dataLoadGroupId
            } = config
            const configId = cacheLoadGroupId || dataLoadGroupId
            // configId = 10
            // 添加校验若设置的负载组变成默认负载组、校验当前默认负载组是否与dataLoadGroupId一致按默认展示
            // todo 获取负载组 回显已配置的负载路由配置
            const group = all[1].value.data || []
            let selectGroup = ''
            this.loadGroupList = [
              { label: 'S3负载组', options: [] },
              { label: 'NAS负载组', options: [] },
              { label: 'AWS负载组', options: [] },
              { label: '冰资源负载组', options: [] }
            ]
            group.forEach(x => {
              if (x.id === configId) {
                selectGroup = x
              }
              //
              if (x.groupTag !== 'CACHE') {
                const item = {
                  label: x.loadGroupName,
                  value: x.id,
                  groupTag: x.groupTag
                }
                // 缓存负载组及默认存储的负载组不放在候选负载中
                if (x.storageType === 'S3') {
                  this.loadGroupList[0].options.push(item)
                } else if (x.storageType === 'NAS') {
                  this.loadGroupList[1].options.push(item)
                } else if (x.storageType === 'IAM') {
                  this.loadGroupList[2].options.push(item)
                } else if (x.storageType === 'GLACIER') {
                  this.loadGroupList[3].options.push(item)
                }
              }
            })
            // this.chargeLoadGroup = !!(configId) && configId !== this.defaultGroupId
            // 处理空负载组
            if (selectGroup) {
              this.editForm.editLoadGroup = {
                value: selectGroup.id,
                groupTag: selectGroup.groupTag
              }
              // loadGroupName
              this.loadGroupName = selectGroup.storageType + ' - ' + selectGroup.loadGroupName
            } else {
              // 空负载组 不作校验、可以取一个有效的负载组作为默认
              this.editForm.editLoadGroup = {}
            }
          }).finally(() => {
            this.loading = false
          })
      })
    },
    saveConfig () {
      this.loading = true
      const loadGroupConfig = {}
      if (this.editForm.editLoadGroup.groupTag === 'DATA') {
        loadGroupConfig.dataLoadGroupId = this.editForm.editLoadGroup.value
        loadGroupConfig.cacheLoadGroupId = null
      } else {
        loadGroupConfig.cacheLoadGroupId = this.editForm.editLoadGroup.value
        loadGroupConfig.dataLoadGroupId = null
      }
      putBucketExtend({
        bucketIds: [this.bucketId.toString()],
        ...loadGroupConfig
      }).then(res => {
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
        this.openModal = false
      }).finally(() => {
        this.loading = false
        this.editVersionControl = false
        this.getConfig()
      })
    }
  }
}
</script>
<style scoped lang="scss">
.versionControlBtnWrap {
  margin: 20px 0;
}
:deep(.el-form) {
  label.el-form-item__label {
    margin-left: 0 !important;
    width: 85px !important;
  }
  .el-radio-group {
    position: relative;
    display: flex;
    flex-direction: column;
    .el-radio {
      margin-bottom: 10px;
    }
  }
  .el-tag {
    color: #e39606;
    background-color: #2a3841;
    border-color: transparent;
    height: 23px;
    line-height: 22px;
  }
}
</style>
