<template>
  <div class="bucket-detail">
    <div class="bucket-panel">
      <div id="openCache-info-field" class="param-box">
        <div class="param-hd">
          <h3 id="openCache">高可用管理 </h3>
        </div>
      </div>
      <div class="mv_20">
        <div class="clearfix">
          <el-button class="golden" @click="showCreate()">创建</el-button>
          <div class="right">
            <el-tooltip content="刷新" placement="top" effect="dark">
              <i class="el-icon-refresh" @click="init()" />
            </el-tooltip>
          </div>
        </div>
      </div>
      <div v-loading="innerFormLoading" class="treeContent">
        <div v-if="hasConfig" class="content">
          <div v-for="item in fillSourceForm" :key="item.id" class="expandDeviceForm">
            <el-form label-position="left" inline>
              <el-row>
                <el-col :span="12">
                  <el-form-item label="关联负载组：">
                    <span> {{ mapSelectLoadGroup(item.loadGroupId) }}</span>
                  </el-form-item>
                </el-col>
                <el-col v-if="item.designMasterStorage&&item.designMasterStorage.length&&JSON.stringify(item.designMasterStorage)!=='[]'" :span="12">
                  <el-form-item label="副本一/副本二:">
                    <span> {{ mapResource(JSON.parse(item.designMasterStorage)[0]) }}
                      <span>
                        {{ '/ ' + mapResource(JSON.parse(item.designMasterStorage)[1]) }}
                      </span>
                    </span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="副本数量：">
                    <span>{{ item.replicaNumber }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="重构优先级：">
                    <span> {{ mapSelectLabel(item.rebuildLevel,RebuildLevelEnum) }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="重构起止时间：">
                    <span> {{ item.rebuildStartTime ? item.rebuildStartTime.split(',').join('~') :'-' }}</span>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="同步方式：">
                    <span> {{ mapSelectLabel(item.aSync,AsyncType) }}</span>
                  </el-form-item>
                </el-col>
                <el-col v-if="item.aSync!=='SYNC'" :span="12">
                  <el-form-item label="异步写进度：">
                    <span> {{ item.rebuildRate === 'FINISH_EQUALIZER'?'完成追平':'未追平' }}</span>
                  </el-form-item>
                </el-col>
              </el-row>

              <div class="btn">
                <el-button
                  v-access="'admin:UpdateStorageResourceController'"
                  class="blue"
                  @click="updateForm(item, true)"
                >{{
                  $ts('modify') }}</el-button>
                <el-button
                  v-access="'admin:DeleteStorageDeviceController'"
                  type="danger"
                  class="red"
                  @click="handleDel(item)"
                >{{ $ts('delete') }}</el-button>
              </div>
            </el-form>
          </div>
        </div>
        <div v-else style="width:100%">
          <el-empty image="" description="请先创建高可用策略" />
        </div>
      </div>
      <el-dialog
        :visible.sync="fromModal"
        width="900px"
        :title="isAdd ? '创建高可用策略' : '修改高可用策略'"
      >
        <el-form ref="form" :model="form" :rules="rules" label-width="150px">
          <el-row>
            <!-- <el-col :span="12">
              <el-form-item prop="replicaRedundancyType" label="副本冗余类型">
                <el-select v-model="form.replicaRedundancyType" style="width:100%">
                  <el-option v-for="item in ReplicaRedundancyTypeEnum" :key="item.label" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col> -->
            <el-col :span="12">
              <el-form-item prop="loadGroupId" label="选择负载组">
                <el-select
                  v-model="form.loadGroupId"
                  value-key="value"
                  @change="clearResource"
                >
                  <el-option-group
                    v-for="group in filterLoadGroupSelect"
                    :key="group.label"
                    :label="group.label"
                  >
                    <el-option
                      v-for="{label,value} in group.options"
                      :key="label"
                      :label="label"
                      :value="value"
                    />
                  </el-option-group>
                </el-select>
              <!-- <el-select v-model="form.designType" style="width:100%" @change="handleLoadSel">
                  <el-option v-for="item in designTypeEnum" :key="item.label" :label="item.label" :value="item.value" />
                </el-select> -->
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="designType" label="指定资源">
                <el-select v-model="form.designType" style="width:100%" @change="clearResource">
                  <el-option v-for="item in designTypeEnum" :key="item.label" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="form.loadGroupId&&form.designType==='DesignResource'">
            <el-col :span="12">
              <el-form-item prop="designListFst" label="选择副本一">
                <el-select v-model="form.designListFst" v-loading="loadingSel" placeholder="选择副本一" style="width:100%" clearable>
                  <el-option v-for="item in filterDesignLists(form.designListSec)" :key="item.label" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="designListSec" label="选择副本二">
                <el-select v-model="form.designListSec" v-loading="loadingSel" placeholder="选择副本二" style="width:100%" clearable>
                  <el-option v-for="item in filterDesignLists(form.designListFst)" :key="item.label" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="replicaNumber" label="副本数量">
                <el-input
                  v-model.trim="form.replicaNumber"
                  placeholder="请输入2-64字符"
                  clearable
                  @input="val => inputPositiveNum(val, 'replicaNumber')"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="重构时间" required>
                <div style="width:100%;display:flex;justify-content:space-between;">
                  <el-form-item label="" prop="rebuildStartTime">
                    <el-time-picker
                      v-model="form.rebuildStartTime"
                      format="HH:mm"
                      value-format="HH:mm"
                      placeholder="开始时间"
                    />
                  </el-form-item>
                  <span style="margin:0 10px">-</span>
                  <el-form-item label="" prop="rebuildEndTime">
                    <el-time-picker
                      v-model="form.rebuildEndTime"
                      format="HH:mm"
                      value-format="HH:mm"
                      placeholder="结束时间"
                    />
                  </el-form-item>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="rebuildLevel" label="重构优先级">
                <el-select v-model="form.rebuildLevel" style="width:100%">
                  <el-option v-for="item in RebuildLevelEnum" :key="item.label" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="aSync" label="同步方式">
                <el-select v-model="form.aSync" style="width:100%">
                  <el-option v-for="item in AsyncType" :key="item.label" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button class="blue" @click="fromModal = false">{{ $ts('button.cancel') }}</el-button>
          <el-button class="golden" type="primary" @click="confirmSubmit">{{ $ts('button.confirm') }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import {
  getBucketExtend,
  getGroupList
} from '@/api/storage'
import { listUserBuckets } from '@/api/bucket'
import {
  listStorageDevice
} from '@/api/storage'
import {
  // listAllHighBucketConfig,listUserBuckets
  createHighBucketConfig,
  getHighBucketConfig,
  deleteHighBucketConfig,
  updateHighBucketConfig
} from '@/api/highAvailability'
import { validBucketName } from '@/utils/validate'
import moment from 'moment'
export default {
  name: 'HightAvailability',
  filters: {
  },
  data () {
    return {
      hasConfig: false,
      loadingSel: false,
      designTypeEnum: [
        { label: '不指定资源', value: 'NotDesign' },
        // { label: '指定设备', value: 'DesignStorage' },
        { label: '指定资源', value: 'DesignResource' }
        // { label: '指定设备标签', value: 'DesignStorageLabel' },
        // { label: '指定设备类型', value: 'DesignStorageType' }
      ],
      ReplicaRedundancyTypeEnum: [
        {
          label: '设备', value: 'Device'
        }
        // {
        //   label: '资源', value: 'Resource'
        // }
      ],
      AsyncType: [
        { label: '同步', value: 'SYNC' },
        { label: '异步', value: 'ASYNC' }
      ],
      RebuildLevelEnum: [
        { label: '高', value: 'HIGH' },
        { label: '中', value: 'MIDDLE' },
        { label: '低', value: 'LOW' }
      ],
      bucketList: [],
      allResourceList: [],
      loadGroupSelect: [],
      form: {
        loadGroupId: '',
        bucketId: '',
        replicaRedundancyType: 'Device',
        designType: 'NotDesign',
        aSync: 'SYNC',
        rebuildLevel: 'HIGH',
        rebuildPerformance: 'test',
        rebuildTryCount: '1',
        replicaNumber: 2,
        designListFst: '',
        designListSec: '',
        rebuildStartTime: '',
        rebuildEndTime: ''
      },
      designLists: [],
      opType: 'add',
      fromModal: false,
      rules: {
        bucketId: [
          {
            required: true, message: '存储桶名必填', trigger: ['blur', 'change']
          },
          {
            validator: validBucketName, trigger: ['blur', 'change']
          }
        ],
        designList: {
          required: true,
          message: '',
          trigger: ['blur', 'change']
        },
        loadGroupId: {
          required: true,
          message: '请选择负载组',
          trigger: ['blur', 'change']
        },
        designListFst: {
          required: true,
          message: '请选择副本一',
          trigger: ['blur', 'change']
        },
        designListSec: {
          required: true,
          message: '请选择副本二',
          trigger: ['blur', 'change']
        },
        rebuildStartTime: {
          required: true,
          message: '请选择开始时间',
          trigger: ['blur', 'change']
        },
        rebuildEndTime: {
          required: true,
          message: '请选择结束时间',
          trigger: ['blur', 'change']
        }
      },
      bucketId: '',
      fillSourceForm: [],
      innerFormLoading: false,
      treeOpt: {
        label: 'bucketName',
        id: 'id',
        children: 'children'
      },
      total: 0,
      filterText: '',
      loading: false,
      searchVal: '',
      tableData: [],
      columns: [
        {
          title: '桶名称',
          prop: 'name'
        },
        {
          title: '创建时间',
          prop: 'creationDate',
          formatter: (__, _, val) => {
            return moment(val).format('YYYY-MM-DD HH:mm:ss')
          }
        },
        {
          slot: 'action'
        }
      ]
    }
  },
  computed: {
    filterLoadGroupSelect () {
      // 过滤已配置负载组类型
      if (this.isAdd) {
        const LoadGroupIds = this.fillSourceForm.map(x => String(x.loadGroupId))
        return this.loadGroupSelect.filter(x => {
          return x.options.every(y => !LoadGroupIds.includes(String(y.value)))
        })
      } else {
        // 只过滤非自身loadGroup
        const LoadGroupIds = this.fillSourceForm.map(x => String(x.loadGroupId)).filter(x => x !== String(this.form.loadGroupId))
        return this.loadGroupSelect.filter(x => {
          return x.options.every(y => !LoadGroupIds.includes(String(y.value)))
        })
      }
    },
    showLabel () {
      return this.form.designType.indexOf('DesignStorage') > -1 ? '选择设备' : '选择资源'
    },
    showDesignSel () {
      return this.form.designType === 'DesignStorage' || this.form.designType === 'DesignResource'
    },
    isAdd () {
      return this.opType === 'add'
    }
  },
  watch: {
    filterText (val) {
      this.$refs.tree.filter(val)
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    clearResource () {
      this.form.designListFst = ''
      this.form.designListSec = ''
    },
    filterDesignLists (value) {
      return this.designLists.find(x => x.value === this.form.loadGroupId)?.list.filter(x => {
        return x.value !== value
      })
    },
    mapSelectLoadGroup (val) {
      // 映射负载组名称、
      const res = this.loadGroupSelect.reduce((pre, cur) => ([...pre, ...cur.options]), [])
      console.log(res, 'nameLoadGroup')
      return this.mapSelectLabel(val, res)
    },
    mapSelectLabel (val, arr) {
      const item = arr.find(x => String(x.value) === String(val))
      return item && item.label
    },
    initForm () {
      Object.assign(
        this.form,
        {
          replicaRedundancyType: 'Device',
          designType: 'NotDesign',
          loadGroupId: '',
          aSync: 'SYNC',
          rebuildLevel: 'HIGH',
          rebuildPerformance: 'test',
          rebuildTryCount: '1',
          replicaNumber: 2,
          bucketId: '',
          rebuildStartTime: '',
          rebuildEndTime: '',
          designListFst: '',
          designListSec: ''
        }
      )
    },
    initBucketList () {
      return new Promise((resolve, rej) => {
        listUserBuckets().then(res => {
          this.bucketList = res.data.list || []
          resolve(true)
        })
      })
    },
    inputPositiveNum (ipt, value) {
      const val = value.split('.')
      if (val && val.length == 1) {
        this.$set(this.form, value, ipt.replace(/(^0+)|\D/g, ''))
      } else {
        this.$set(this.form[val[0]], val[1], ipt.replace(/(^0+)|\D/g, ''))
      }
    },
    handleLoadSel (val) {
      this.$refs['form'] && this.$refs['form'].clearValidate(['designList'])
      this.form.designList = []
      if (val === 'DesignStorage') {
        this.rules.designList.message = '请选择设备'
        this.loadingSel = true
        listStorageDevice().then(res => {
          this.designLists = res.data.map(x => {
            return {
              label: x.deviceName,
              value: x.deviceId
            }
          })
        }).finally(() => {
          this.loadingSel = false
        })
      } else if (val === 'DesignResource') {
        this.rules.designList.message = '请选择资源'
        this.loadingSel = true
        listStorageDevice().then(res => {
          this.designLists = res.data.reduce((pre, cur) => {
            return [...pre, ...cur.storageResourceModelList.map(x => {
              return { label: x.storageName, value: x.resourceId }
            })]
          }, [])
        }).finally(() => {
          this.loadingSel = false
        })
      }
    },
    changelogicUnit (val) {
      if (val == 'TB') {
        this.form.objectSize = ''
        this.placeholderValue = this.placeholder[1].value
      } else {
        this.form.objectSize = ''
        this.placeholderValue = this.placeholder[0].value
      }
    },
    dialogOpen (e) {
      const ipt = e
      this.$nextTick(function () {
        this.$refs[ipt].$el.querySelector('input').focus()
      })
    },
    filterNode (value, data) {
      // console.log(data, '12333')
      if (!value) return true
      return (data.bucketId || data.id).toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1
    },
    mapLabel (label, val) {
      if (label === 'bucketName') {
        const res = this.bucketList.find(x => (x.id).toString() === val)
        // console.log(val, this.bucketList, label)
        return res && res.name || '-'
      }
    },
    async getConfig () {
      const loadGroupMap = await this.initGroupList()
      if (JSON.stringify(loadGroupMap) === '{}') {
        this.innerFormLoading = false
        return
      }
      return new Promise((resolve, reject) => {
        getBucketExtend({
          bucketId: this.bucketId
        })
          .then(res => {
            const config = res.data || []
            const {
              dataLoadGroupId,
              glacierLoadGroupId
            } = config
            // dataLoadGroupId、glacierLoadGroupId 0
            this.loadGroupSelect = []
            if (String(dataLoadGroupId) !== '0' && String(dataLoadGroupId) !== 'null') {
              this.loadGroupSelect.push({
                label: 'S3负载组', options: [{
                  label: loadGroupMap[dataLoadGroupId], value: dataLoadGroupId
                }]
              })
            }
            if (String(glacierLoadGroupId) !== '0' && String(glacierLoadGroupId) !== 'null') {
              this.loadGroupSelect.push({
                label: '冰负载组', options: [{ label: loadGroupMap[glacierLoadGroupId], value: glacierLoadGroupId }]
              })
            }
            resolve(true)
          })
          .catch(err => {
            reject(false)
          })
      })
    },
    getResource () {
      return new Promise((resolve) => {
        listStorageDevice().then(res => {
          resolve(res.data || [])
        })
      })
    },
    mapResource (key) {
      return this.allResourceList[key]
    },
    async initGroupList () {
      const resourceList = await this.getResource()
      const allRsourceMap = resourceList.reduce((pre, cur) => {
        return [...pre, ...cur.storageResourceModelList.map(x => {
          return { label: x.storageName, value: x.resourceId }
        })]
      }, []).reduce((pre, cur) => {
        pre[cur.value] = cur.label
        return pre
      }, {})
      // MapResource
      this.allResourceList = allRsourceMap
      // console.log(allRsourceMap, 'allRsourceMap===allRsourceMap')
      return new Promise(resolve => {
        getGroupList().then(res => {
          const loadGroupMap = (res.data || []).reduce((pre, cur) => {
            pre[cur.id] = cur.loadGroupName
            return pre
          }, {})
          this.designLists = res.data.map(x => {
            return {
              value: x.id,
              list: x.items.map(i => {
                return {
                  label: allRsourceMap[i.resourceId],
                  value: i.resourceId
                }
              })
            }
          })
          // console.log(this.designLists, '===designLists===')
          resolve(loadGroupMap)
        })
      })
      // map 负载组名称
    },
    async init () {
      this.innerFormLoading = true
      await this.initBucketList()
      const currentBucketId = this.bucketList.find(x => x.name === this.$route.params.id)
      this.bucketId = currentBucketId && currentBucketId.id.toString()
      const config = await this.getConfig()
      if (!config) return
      getHighBucketConfig({
        id: 0,
        bucketId: this.bucketId
      }).then((res) => {
        if (res.data) {
          const defaultData = res.data
          this.hasConfig = true
          this.$set(this, 'fillSourceForm', defaultData)
          // const resourceId = JSON.parse(defaultData.designResourceIds)
          // listStorageDevice().then(res => {
          //   let designListFst = ''
          //   let designListSec = ''
          //   const designLists = res.data.reduce((pre, cur) => {
          //     return [...pre, ...cur.storageResourceModelList.map(x => {
          //       return { label: x.storageName, value: x.resourceId }
          //     })]
          //   }, [])
          //   // 选择负载组后、筛选前二资源、先判断满足加载条件
          //   designListFst = designLists.find(x => x.value === Number(resourceId[0]).toString())?.label || ''
          //   designListSec = designLists.find(x => x.value === Number(resourceId[1]).toString())?.label || ''
          //   Object.assign(
          //     this.fillSourceForm, {
          //       designListFst,
          //       designListSec
          //     }
          //   )
          // }).finally(() => {
          // })
          this.innerFormLoading = false
        } else {
          this.hasConfig = false
          this.innerFormLoading = false
        }
      }).catch(() => {
        this.innerFormLoading = false
      })
    },
    async showCreate () {
      this.fromModal = true
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
      this.opType = 'add'
      this.initForm()
    },
    confirmSubmit () {
      this.$refs['form'].validate((valid) => {
        const {
          replicaRedundancyType,
          designType,
          loadGroupId,
          aSync,
          rebuildLevel,
          rebuildPerformance,
          rebuildTryCount,
          replicaNumber,
          bucketId,
          id,
          rebuildStartTime,
          rebuildEndTime,
          designListFst,
          designListSec
        } = this.form
        const designListObj = {}
        if (designType === 'NotDesign') {
          Object.assign(designListObj, {
            designMasterStorage: []
          })
        } else {
          Object.assign(designListObj, {
            designMasterStorage: [String(designListFst), String(designListSec)]
          })
        }
        // if (this.showDesignSel) {
        //   // Object.assign(designListObj,
        //   //   this.form.designType.indexOf('DesignStorage') > -1
        //   //     ? { designStorageIds: designList }
        //   //     : { designResourceIds: designList })
        // }
        if (valid) {
          // const isValid = rebuildStartTime && rebuildStartTime.length && rebuildStartTime.every(x => x)
          const putRebuildStartTime = rebuildStartTime + ',' + rebuildEndTime
          if (this.isAdd) {
            const obj = {
              replicaRedundancyType,
              // designType,
              loadGroupId,
              aSync,
              rebuildLevel,
              rebuildPerformance,
              rebuildTryCount,
              replicaNumber,
              bucketId: this.bucketId,
              ...designListObj,
              rebuildStartTime: putRebuildStartTime
            }
            createHighBucketConfig(obj).then(res => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.fromModal = false
              // console.log(res, 'res')
            }).finally(() => {
              this.init()
            })
          } else {
            const obj = {
              replicaRedundancyType,
              // designType,
              loadGroupId,
              aSync,
              rebuildLevel,
              rebuildPerformance,
              rebuildTryCount,
              replicaNumber,
              id,
              bucketId: bucketId.toString(),
              ...designListObj,
              rebuildStartTime: putRebuildStartTime
            }
            updateHighBucketConfig(obj).then(res => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.fromModal = false
              this.init()
            })
          }
        } else {
          console.log('error submit')
        }
      })
    },
    updateForm (row) {
      const time = row.rebuildStartTime ? row.rebuildStartTime.split(',') : ['', '']
      Object.assign(this.form,
        { ...row,
          rebuildStartTime: time[0],
          rebuildEndTime: time[1]
        }
      )
      this.form.loadGroupId = Number(row.loadGroupId)
      const Resource = JSON.parse(row.designMasterStorage)
      if (Resource && Resource.length > 1) {
        this.form.designListFst = Resource[0]
        this.form.designListSec = Resource[1]
        this.form.designType = 'DesignResource'
      } else {
        this.form.designType = 'NotDesign'
      }
      this.fromModal = true
      this.opType = 'update'
    },
    handleDel (row) {
      this.$confirm('确认删除当前所选配置吗', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        deleteHighBucketConfig({
          id: row.id
        }).then((res) => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
          this.init()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-form){
  .el-select{
    width: 100%;
  }
  .el-tag{
    background-color: #384348!important;
    color: #e39606!important;
    border-color:transparent!important;
    border-radius: 10px;
  }
}
::v-deep .expandDeviceForm {
  &:first-of-type{
    margin-bottom: 30px;
  }
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);
  .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  label.el-form-item__label {
    width: 130px!important;
    font-weight: bold;
  }

  .clusterLabel {
    label {
      width: 300px !important;
    }
  }

  .cluster {
    // margin-left: 0;
    margin: 20px 0;
    width: 100%;
    // display: flex;
    // flex-wrap: wrap;

    // &>div {
    //   width: 50%;
    // }
  }
}

::v-deep .treeContent {
  .el-empty{
    .el-empty__image{
      display: none;
    }
}
  display: flex;
  justify-content: space-between;
  width: 90%;

  .content {
    flex: 1;
    min-height: 300px;
    .btn {
      margin: 30px 0 0 0px;
    }
  }
}

:deep(.el-form-item__content) {
  word-break: break-word;
  flex: 1;
  color: #b1b1b1;
}

.quick-default-style {
  margin-top: 14px;
}

::v-deep.el-form {
  label.el-form-item__label {
    // width: 150px!important;
    margin-left: 0 !important;
  }
}

.el-date-editor.el-input, .el-date-editor.el-input__inner{
  width: 100%;
}
</style>
