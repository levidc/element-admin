<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 clearfix">
        <el-button
          v-access="'admin:AddStorageResourceController'"
          class="golden"
          type="primary"
          @click="showCreate('object')"
        >创建</el-button>
        <div class="right">
          <el-tooltip
            content="刷新"
            placement="top"
            effect="dark"
          >
            <i
              class="el-icon-refresh"
              @click="init"
            />
          </el-tooltip>
        </div>
        <div class="right clearfix">
          <el-input
            v-model="filterText"
            class="search_style search_btn right with_search mr_10"
            placeholder="资源名称过滤"
            clearable
          />
        </div>
      </div>
      <TableData
        ref="tab"
        :loading="loading"
        :row-key="rendeKey"
        :table-data="tableData"
        :columns="tableColumns"
        :page-obj="{ ...pageObj }"
        :sort-function="sortFunction"
      >
        <el-table-column
          slot="url"
          label="地址"
          prop="url"
          sortable="custom"
          min-width="200px"
        >
          <template slot-scope="scope">
            <el-tooltip
              :content="scope.row.url"
              placement="top"
            >
              <span>{{ scope.row.url }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          slot="action"
          fixed="right"
          :label="$ts('action')"
          width="200px"
        >
          <template slot-scope="scope">
            <el-dropdown size="small">
              <el-button
                v-access="'admin:UpdateStorageResourceController' || 'admin:DeleteResourceController'"
                type="primary"
                class="blue"
              >
                {{ $ts('action') }}<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-access="'admin:UpdateStorageResourceController'"
                  @click.native="updateForm(scope.row, true)"
                >修改资源</el-dropdown-item>
                <el-dropdown-item
                  v-access="'admin:DeleteResourceController'"
                  @click.native="handleDel('object', scope)"
                >删除资源</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </TableData>
    </div>
    <el-dialog
      :visible.sync="modelFormFlag"
      width="35%"
      :title="isAdd ? '创建资源' : '修改资源'"
      @open="dialogOpen('tableFocus')"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="160px"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              prop="storageName"
              label="资源名称"
            >
              <el-input
                ref="tableFocus"
                v-model.trim="form.storageName"
                placeholder="请输入2-64位中英文、数字、'_'或'-'"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item
              prop="url"
              label="地址"
            >
              <el-select v-model="form.url">
                <el-option
                  v-for="item in clientNas"
                  :key="item.value"
                  :label="item.label"
                  :value="item.label"
                />
              </el-select>
              <!-- <el-input v-model.trim="form.url" placeholder="请输入2-64位字符" clearable /> -->
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              prop="mountDir"
              label="共享目录"
            >
              <el-input
                v-model="form.mountDir"
                placeholder="请输入共享目录"
                :disabled="!isAdd"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="golden"
          type="primary"
          @click="confirmCreate"
        >{{ $ts('button.confirm') }}</el-button>
        <el-button @click="modelFormFlag = false">{{ $ts('button.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="renderDel ? '删除资源' : '删除存储设备'"
      :visible.sync="deleteFlag"
      width="650px"
    >
      <p>{{ renderDel ? `删除如下存储资源:${selectRow.storageName}` : `删除如下存储设备: ${selectRow.deviceName}` }}
      </p>
      <div slot="footer">
        <el-button
          type="primary"
          class="golden"
          @click="deleteForm"
        >{{ $ts('delete') }}</el-button>
        <el-button @click="deleteFlag = false">{{ $ts('cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getInstanceByServiceName } from '@/api/system'
import { mapState } from 'vuex'
import {
  addObjectStorageResource,
  updateObjectStorageResource,
  removeObjectStorageResource,
  deleteStorageDevice,
  addStorageDevice,
  updateStorageDevice,
  listStorageResource
} from '@/api/storage'
import { validBucketName, validateMaxInt } from '@/utils/validate'
export default {
  data() {
    return {
      timer: null,
      enumStorageType: [
        {
          label: 'S3',
          value: 'S3'
        },
        {
          label: 'NAS',
          value: 'NAS'
        }
      ],
      regions: [
        {
          label: '亚太地区(香港)', value: 'ap-east-1'
        }
      ],
      refreshId: [],
      defNextForm: {
        search: '',
        deviceId: '',
        radio: '',
        resourceId: '',
        flag: 'next' // default/next
      },
      defNextSort: {
        prop: 'default',
        order: 'descending'
      },
      sortConfig: {},
      defNextResource: [],
      copyDefNextResource: [],
      defNextFlag: false,
      // defaultSort: {
      //   prop: 'storageResourceModelList',
      //   order: 'descending'
      // },
      filterText: '',
      showDescDevice: '',
      treeOpt: {
        label: 'deviceName',
        id: 'deviceId',
        children: 'storageResourceModelList'
      },
      opType: 'add',
      optDType: 'add',
      rules: {
        storageName: [
          {
            required: true, message: '资源名称必填', trigger: ['blur', 'change']
          },
          {
            message: "请输入2-64位中英文、数字、'_'或'-'", pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5\-]{2,64}$/
          }
        ],
        url: [
          {
            required: true, message: '资源路径必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 64, message: '请输入2-64位字符'
          }
          // {
          //   validator: endpointVerify, trigger: ['blur', 'change']
          // }
        ],
        bucketName: [
          {
            required: true, message: '存储桶名必填', trigger: ['blur', 'change']
          },
          {
            validator: validBucketName, trigger: ['blur', 'change']
          }
        ],
        region: [
          {
            required: true, message: '区域必填', trigger: ['blur', 'change']
          }
        ],
        accessKey: [
          {
            required: true, message: 'access key id 必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 64, message: '请输入2-64位字符'
          }
        ],
        secretKey: [
          {
            required: true, message: 'secret key 必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 64, message: '请输入2-64位字符'
          }
        ],
        userName: [
          {
            required: true, message: '用户名称必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 64, message: '请输入2-64位字符'
          }
        ],
        password: [
          {
            required: true, message: '用户密码必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 64, message: '请输入2-64位字符'
          }
        ],
        sign: [
          {
            required: true, message: '标签名必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 256, message: '请输入2-256字符'
          }

        ],
        objectCount: { required: true, message: '存储数量上限必填，请输入正整数' },
        objectSize: [
          { required: true, message: '存储数量上限必填，请输入正整数' },
          { validator: (rule, data, cb) => validateMaxInt('8000000000', '不超过8,000,000,000GB', rule, data, cb), trigger: ['change', 'blur'] }
        ],
        deviceId: { required: true, message: '请选择存储设备' },
        storageType: { required: true, message: '请选择存储类型' },
        nasAdvancedConfig: { required: true },
        mountDir: { required: true, message: '请设置共享目录' }
      },
      enableAdvancedConfig: false,
      s3SdkVersion: [
        'V1', 'V2'
      ],
      s3SignatureVersion: ['VERSION2', 'VERSION4'],
      clientNas: [],
      form: {
        storageName: '',
        url: '',
        userName: '',
        password: '',
        isDefault: false,
        sign: '',
        bucketName: '',
        next: false,
        defaultV: false,
        objectCount: '',
        objectSize: '',
        deviceId: '',
        nasAdvancedConfig: false,
        storageType: 'NAS', // 初始S3
        accessKey: '',
        secretKey: '',
        extendInfo: {
          s3SdkVersion: '',
          s3SignatureVersion: ''
          // maxObjectSize: '',
          // dirMaxFile: '',
          // dirMaxDepth: '',
          // dirMaxSubDir: ''
        },
        param: {
          connectionTimeoutTime: '',
          sync: false
        },
        mountDir: ''
      },
      deviceDialog: false,
      deviceForm: {
        deviceName: '',
        isDefault: ''
      },
      copyForm: {},
      selectRow: {},
      modelFormFlag: false,
      deleteFlag: false,
      loading: false,
      pageObj: {
        currentPage: 1,
        pageSize: 10
      },
      tableData: [],
      storageType: [
        { label: 'NAS', value: 'NAS' },
        { label: 'DBS', value: 'DBS' },
        { label: 'REMOTE_DISK', value: 'REMOTE_DISK' },
        { label: '本地磁盘', value: 'LOCAL_DISK' },
        { label: 'DOS', value: 'DOS' }
      ],
      tableColumns: [
        { prop: 'storageName', title: '资源名称', show: true, sortable: 'custom', fixed: 'left', minWidth: '200px' },
        { slot: 'url', show: true },
        {
          prop: 'bucketName', title: '共享目录', show: true, sortable: 'custom', minWidth: '200px'
        },
        {
          prop: 'storageStatus', title: '存储状态', show: true, formatter: (row, _, val) => {
            const value = this.storageTypeEnu[val]
            return val === 'CONNECTING' ? <span class='green'>{value}</span> : <span class='red'>{value}</span>
          }, sortable: 'custom', minWidth: '200px'
        },
        { slot: 'action', title: this.$ts('action'), show: true }
      ],
      prop: '',
      order: '',
      storageTypeEnu: {
        'STATUS_NULL': '未检测',
        'CONNECTING': '连接正常',
        'INVALID_KEY': '账号错误',
        'INVALID_SECRET': '密码错误',
        'UNCONNECTION': '地址错误',
        'NO_SUCH_BUCKET': '桶不存在',
        'UNKNOWN_ERROR': '未知错误',
        'OFFLINE_RESOURCE': '资源下线',
        'REMOUNT': '重新挂载中',
        'CONNECT_TIME_OUT': '连接超时',
        'NO_SUCH_DATABASE': '数据库表不存在'
      },
      dRules: {
        deviceName: { message: "请输入2-40位英文、数字、'_'", required: true, pattern: /^[a-zA-Z0-9_]{2,40}$/ },
        isDefault: { required: true }
      },
      deviceSelectOpt: [],
      copyData: []
    }
  },
  computed: {
    isAdd() {
      return this.opType === 'add'
    },
    isAddDevice() {
      return this.optDType === 'add'
    },
    renderDel() {
      return this.opType === 'del'
    },
    getStorageType() {
      return this.form.storageType
    },
    ...mapState(['api'])
  },
  watch: {
    // tableData (val, old) {
    //   const show = val.length > 0
    //   this.$refs['addBtn'].$el.style.display = 'inline'
    //   if (show) {
    //     this.$refs['addBtn'].$el.style.display = 'none'
    //     this.$refs['tipref'].style.display = 'inline'
    //   } else {
    //     this.$refs['addBtn'].$el.style.display = 'inline'
    //     this.$refs['tipref'].style.display = 'none'
    //   }
    // }
    modelFormFlag(val) {
      if (val) {
        clearTimeout(this.timer)
      } else {
        this.init(true)
      }
    },
    'form.storageType': function(val) {
      if (val === 'S3') {
        this.form.nasAdvancedConfig = false
        this.$refs['form'].clearValidate()
      }
    },
    deleteFlag(val) {
      if (!val) {
        this.opType = 'add'
        this.optDType = 'add'
      }
    },
    filterText(val) {
      this.tableData = JSON.parse(JSON.stringify(this.copyData))
      if (!val) {
        this.init(true)
        return
      }
      clearTimeout(this.timer)
      this.$refs['tab'].currentPage = 1
      this.tableData = this.tableData.filter(item => item.storageName.toLowerCase().indexOf(val.toLowerCase()) > -1)
    },
    defNextFlag(val) {
      if (!val) {
        Object.assign(this.defNextForm, { flag: 'next', radio: '', search: '', resourceId: '' })
      }
    }
  },
  mounted() {
    // this.prop = this.defaultSort.prop
    // this.order = this.defaultSort.order
    // console.log('%c nas', 'color:red')
    this.init(true)
  },
  destroyed() {
    clearTimeout(this.timer)
  },
  methods: {
    inputPositiveNum(ipt, value) {
      const val = value.split('.')
      if (val && val.length == 1) {
        this.$set(this.form, value, ipt.replace(/(^0+)|\D/g, ''))
      } else {
        this.$set(this.form[val[0]], val[1], ipt.replace(/(^0+)|\D/g, ''))
      }
    },
    handleExpand(row, expand) {
      // console.log(row, expand)
    },
    transByteToGB(data) {
      // ByteToGB、
      const res = (Number(data) / 1024 ** 3).toFixed(2)
      return res == 0 ? 0 : res
    },
    handleRowChange(row) {
      // 请求成功清除数据 row调用为null
      const resourceId = row && row.resourceId
      this.defNextForm.radio = resourceId
      this.defNextForm.resourceId = resourceId
    },
    defSearch() {
      this.defNextResource = JSON.parse(JSON.stringify(this.copyDefNextResource))
      if (!this.defNextForm.search) {
        return
      } else {
        this.defNextResource = this.defNextResource.filter(item => {
          return Object.keys(item).some(itx => {
            return item[itx].toString().indexOf(this.defNextForm.search) > -1
          })
        })
      }
    },
    sortFunctionDef(val) {
      this.defNextSort.prop = val.prop
      this.defNextSort.order = val.order
      this.defNextResource.sort(this.sortMethod(val.prop, val.order))
    },
    getCurrentRow(row) {
      this.defNextForm.resourceId = row.resourceId
    },
    transferBool(val) {
      return this.stringToBoolean(val)
    },
    // confirmDefNext () {
    //   const {
    //     flag,
    //     deviceId,
    //     resourceId
    //   } = this.defNextForm
    //   if (!this.defNextForm.resourceId) {
    //     return this.$notify.error('请选择存储资源')
    //   }
    //   const item = this.defNextResource.find(item => item.resourceId == resourceId)
    //   if (item.default && flag === 'next') {
    //     return this.$notify.error('默认资源和下一个资源不能同时设置在同一个资源中')
    //   }
    //   const data = {
    //     deviceId,
    //     resourceId
    //   }
    //   data[flag] = true
    //   updateObjectStorageResource(data).then((res) => {
    //     this.loading = true
    //     listStorageDevice().then((res) => {
    //       this.tableData = (res.data || []).map(item => {
    //         if (item.storageResourceModelList && item.storageResourceModelList.length) {
    //           item.storageResourceModelList.map(itx => {
    //             itx.deviceName = itx.storageName
    //           })
    //         }
    //         return item
    //       }).sort(this.sortMethod(this.prop, this.order))
    //       this.copyData = JSON.parse(JSON.stringify(this.tableData))
    //       const row = this.tableData.find(item => item.deviceId === this.defNextForm.deviceId)
    //       this.handleDefNextFlag(row)
    //       this.$ts({
    //         type: 'success',
    //         text: '操作成功'
    //       })
    //     }).finally(() => {
    //       this.loading = false
    //     })
    //   })
    // },
    // handleDefNextFlag (row) {
    //   this.defNextResource = row.storageResourceModelList
    //   this.copyDefNextResource = JSON.parse(JSON.stringify(this.defNextResource))
    //   this.defNextForm.deviceId = row.deviceId
    //   this.defNextFlag = true
    // },
    handleDemi(row, _, value) {
      value = String(value)
      const reg = /\B(?=(\d{3})+(?!\d))/g
      return value.replace(reg, ',')
    },
    filterNode(value, data) {
      if (!value) return true
      return (data.deviceName || data.storageName).indexOf(value) !== -1
    },
    getInfo(node, data) {
      if (Object.keys(node).includes('storageResourceModelList')) {
        this.updateDevice(node)
        this.showDescDevice = 'device'
        // render Device
      } else {
        this.updateForm(node)
        this.showDescDevice = 'object'
        // render object
      }
    },
    rendeKey(row) {
      return row.resourceId
    },
    handleDel(type, { row }) {
      if (type === 'device') {
        this.optDType = 'del'
      } else if (type === 'object') {
        this.opType = 'del'
      }
      // console.log(row, 'row')
      this.selectRow = row
      this.deleteFlag = true
    },
    // stringToBoolean (string) {
    //   // console.log(string, 'string')
    //   if (typeof (string) !== 'string') return string
    //   switch (string.toLowerCase().trim()) {
    //     case 'true':
    //     case 'yes':
    //     case '1':
    //       return true
    //     case 'false':
    //     case 'no':
    //     case '0':
    //     case null:
    //       return false
    //     default:
    //       return Boolean(string)
    //   }
    // },
    // renderStatus (__, _, v) {
    //   return this.stringToBoolean(v) ? <span class='green'>是</span> : <span class='red'>否</span>
    // },
    sortFunction(val) {
      this.prop = val.prop
      this.order = val.order
      this.tableData.sort(this.sortMethod(val.prop, val.order))
    },
    init(flag = false) {
      // this.showDescDevice = ''
      if (flag) {
        this.loading = true
      }
      clearTimeout(this.timer)
      listStorageResource({
        deviceId: '66666666666666666'
      }).then((res) => {
        this.tableData = (res.data || []).filter(item => {
          return item.storageType === 'NAS'
        })
        this.tableData.sort(this.sortMethod(this.prop, this.order))
        this.copyData = JSON.parse(JSON.stringify(this.tableData))
        this.timer = setTimeout(() => {
          this.init()
        }, 4000)
      }).finally(() => {
        this.loading = false
      })
      // listStorageDevice().then((res) => {
      //   this.tableData = (res.data || []).map(item => {
      //     if (item.storageResourceModelList && item.storageResourceModelList.length) {
      //       item.storageResourceModelList.map(itx => {
      //         if (itx.storageStatus == 'REMOUNT') {
      //           this.refreshId.push(itx)
      //         }
      //         itx.deviceName = itx.storageName
      //       })
      //     }
      //     return item
      //   }).sort(this.sortMethod(this.prop, this.order))
      //   this.tableData.forEach(item => {
      //     const config = this.sortConfig[item.deviceId]
      //     config && item.storageResourceModelList && item.storageResourceModelList.length && item.storageResourceModelList
      //       .sort(this.sortMethod(config.prop, config.order))
      //   })
      //   this.copyData = JSON.parse(JSON.stringify(this.tableData))
      //   if (this.refreshId.length) {
      //     setTimeout(() => {
      //       this.init()
      //     }, 5000)
      //   }
      // }).finally(() => {
      //   this.loading = false
      // })
    },
    async updateForm(row, flag = false) {
      this.opType = 'update'
      // console.log(row, 'updateForm')
      // this.form.nasAdvancedConfig = false
      // region、
      Object.assign(this.form, { ...row, defaultV: row.default, mountDir: row.bucketName })
      this.copyForm = JSON.parse(JSON.stringify(this.form))
      await this.loadAsyncOption()
      if (flag) {
        this.modelFormFlag = true
      }
    },
    updateDevice(row, flag = false) {
      this.optDType = 'update'
      Object.assign(this.deviceForm, {
        ...row, isDefault: this.stringToBoolean(row.default)
      })
      if (flag) {
        this.deviceDialog = true
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
      }
    },
    createDevice() {
      this.$refs['Dform'].validate((valid) => {
        if (valid) {
          const { deviceName, isDefault, deviceId } = this.deviceForm
          if (this.isAddDevice) {
            addStorageDevice({
              deviceName, default: isDefault
            }).then(() => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            }).catch((err) => {
              console.log(err, '12')
            }).finally(() => {
              this.deviceDialog = false
              this.init(true)
            })
          } else {
            updateStorageDevice({
              default: isDefault, deviceId
            }).then(() => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            }).finally(() => {
              this.deviceDialog = false
              this.init(true)
            })
          }
        }
        // console.log(valid, 'valid', this.deviceForm)
      })
    },
    getRowClass({ row }) {
      if (row.storageResourceModelList && !row.storageResourceModelList.length) {
        return ['hide-dropdown']
      } else {
        return ['']
      }
    },
    expandChange(row, any) {
      this.$set(row, 'loading', true)
      setTimeout(() => {
        this.$set(row, 'loading', false)
      }, 200)
    },
    dialogOpen(e) {
      const ipt = e
      this.$nextTick(function() {
        this.$refs[ipt].$el.querySelector('input').focus()
      })
    },
    async showCreate(cName, id = '') {
      if (cName === 'device') {
        Object.assign(this.deviceForm, {
          deviceName: '',
          isDefault: false
        })
        this.deviceDialog = true
        this.optDType = 'add'
        this.$nextTick(() => {
          this.$refs['Dform'].clearValidate()
        })
      } else if (cName === 'object') {
        await this.loadAsyncOption()
        this.opType = 'add'
        this.modelFormFlag = true
        this.form.deviceId = id
        this.$set(this, 'form', {
          storageName: '',
          nasAdvancedConfig: false,
          url: '',
          userName: '',
          password: '',
          isDefault: true,
          sign: '',
          bucketName: '',
          next: false,
          defaultV: false,
          objectCount: '',
          objectSize: '',
          deviceId: '',
          storageType: 'NAS',
          mountDir: '',
          extendInfo: {
            // maxObjectSize: '',
            // dirMaxFile: '',
            // dirMaxDepth: '',
            // dirMaxSubDir: '',
            s3SdkVersion: '',
            s3SignatureVersion: ''
          },
          accessKey: '',
          secretKey: '',
          region: '',
          param: {
            connectionTimeoutTime: '',
            sync: false
          }
        })
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
      }
    },
    async loadAsyncOption() {
      const res = await getInstanceByServiceName()
      this.clientNas = (res.data || []).filter(item => item.healthy).map((item, index) => {
        const { hostName } = item.endPoints.CONTROL
        return {
          label: hostName,
          value: hostName + index
        }
      })
    },
    // const res = await listStorageDevice()
    // this.deviceSelectOpt = (res.data || []).map(item => {
    //   return {
    //     label: item.deviceName,
    //     value: item.deviceId
    //   }
    // })
    deleteForm() {
      if (this.renderDel) {
        const { resourceId, deviceId } = this.selectRow
        removeObjectStorageResource({
          resourceId,
          deviceId
        })
          .then(res => {
            if (res.msg === 'success') {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            }
          })
          .catch((err) => {
            console.log(err)
          })
          .finally(() => {
            this.deleteFlag = false
            this.init(true)
          })
      } else {
        deleteStorageDevice({
          deviceId: this.selectRow.deviceId
        }).then((res) => {
          if (res.msg === 'success') {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
          }
        }).finally(() => {
          this.deleteFlag = false
          this.init(true)
        })
      }
    },
    confirmCreate() {
      this.$refs['form'].validate((valid) => {
        const {
          userName,
          password,
          storageName,
          bucketName,
          url,
          next,
          extendInfo,
          storageType,
          mountDir
        } = this.form
        // console.log(this.form, 'form')
        const data = {
          storageName,
          bucketName,
          next,
          storageType,
          url,
          deviceId: '66666666666666666'
        }
        if (valid) {
          if (this.isAdd) {
            if (storageType === 'NAS') {
              data.bucketName = mountDir
            } else {
              // s3 useName、password
              Object.assign(data, { userName, password })
              const extendInfoParams = Object.keys(extendInfo).reduce((pre, cur) => {
                if (!pre[cur]) {
                  if (extendInfo[cur]) {
                    pre[cur] = extendInfo[cur]
                  }
                }
                return pre
              }, {})
              data.extendInfo = extendInfoParams
            }
            addObjectStorageResource(data)
              .then((res) => {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                this.modelFormFlag = false
              })
              .catch((err) => {
                console.log(err)
              })
          } else if (this.opType === 'update') {
            // 过滤 extendInfo、param、
            const reqParams = Object.keys(this.form).reduce((cur, pre) => {
              const newVal = this.form[pre]
              const oldVal = this.copyForm[pre]
              // console.log(newVal, 'newold', oldVal)
              if (typeof newVal !== 'object' && typeof oldVal !== 'object') {
                if (newVal !== oldVal) {
                  if (pre == 'defaultV') {
                    pre = 'default'
                  }
                  cur[pre] = newVal
                }
              }
              return cur
            }, {})
            delete reqParams.nasAdvancedConfig
            reqParams.resourceId = this.form.resourceId
            reqParams.deviceId = '66666666666666666'
            if (Object.keys(reqParams).length == 2) {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.modelFormFlag = false
              this.init(true)
              return
            }

            updateObjectStorageResource(reqParams)
              .then((res) => {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                this.modelFormFlag = false
              })
              .catch((err) => {
                console.log(err)
              })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  th {
    &:nth-of-type(1) {
      .cell {
        display: none;
        // .el-checkbox__inner {
        //   position: relative;
        // }
      }
    }
  }

  .el-select {
    width: 100%;
  }

  .el-descriptions__body {
    background: transparent;
  }

  .extendInfo {
    .el-col-12 {
      label.el-form-item__label {
        width: 175px !important;
        margin-left: -6px !important;

        & + .el-form-item__content {
          margin-left: 15px !important;
        }
      }

      margin-bottom: 20px;

      .el-input {
        width: calc((100% - 160px) / 1.5);
      }
    }
  }
}

::v-deep .el-table {
  .el-table__body-wrapper {
    overflow-x: auto !important;

    .el-table__body {
      table-layout: fixed !important;
      width: 100% !important;
    }
  }

  .el-table__expanded-cell {
    .el-table__cell {
      padding: 3px 10px 3px 0;
    }
  }

  .el-table__row.hide-dropdown {
    .el-table__expand-column {
      pointer-events: none;

      .el-table__expand-icon {
        display: none;
      }
    }
  }

  .cell {
    white-space: nowrap;
  }
}

::v-deep.el-form {
  .el-switch {
    .el-switch__label {
      line-height: 18px;
    }
  }

  label.el-form-item__label {
    margin-left: 10px !important;
  }
}

::v-deep .treeContent {
  display: flex;
  justify-content: space-between;
  padding: 20px;

  .tree {
    width: 30%;
    margin-right: 100px;
    max-height: 700px;
    overflow-y: scroll;

    .custom-tree-node {
      font-size: 15px;

      i {
        margin-left: 20px;
      }
    }

    div[role="treeitem"] {
      margin-bottom: 5px;
    }

    .stauts {
      padding: 0 30px;
      position: relative;
      display: flex;
      justify-content: space-around;

      .el-icon-info {
        position: absolute;
        left: 0;
      }
    }

    .tipIcon {
      margin-right: 4px;
      border-radius: 50%;
      width: 12px;
      height: 12px;
      display: inline-block;
    }
  }

  .content {
    flex: 1;
    min-height: 300px;

    > div {
      .el-descriptions {
        width: 80%;
      }
    }

    .btn {
      margin-top: 30px;
    }
  }

  .el-descriptions-item__label {
    color: #7fb2c5;
  }

  .el-descriptions-item__content {
    color: #d3d6d8;
  }
}

::v-deep .el-form label.el-form-item__label {
  width: 160px !important;
  margin-left: 0px !important;
  padding-right: 20px !important;
}

.advanceConfig {
  margin-left: -75px;
  color: #ff8746;
  cursor: pointer;
}
</style>
