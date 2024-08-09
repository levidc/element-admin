<template>
  <div>
    <div class="page_content_wrap">
      <el-button
        class="golden"
        @click="handleAdd()"
      >创建负载路由</el-button>
      <div class="right">
        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            style="position:relative;top:3px;"
            class="el-icon-refresh"
            @click="selBucket='';selLoadGroup='';init()"
          />
        </el-tooltip>
      </div>
      <el-form
        inline
        style="float:right;position:relative;top:-5px;"
      >
        <el-form-item>
          <el-select
            v-model="selBucket"
            placeholder="桶名称过滤"
            clearable
          >
            <el-option
              v-for="bucket in BucketNameSel"
              :key="bucket"
              :label="bucket"
              :value="bucket"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="selLoadGroup"
            placeholder="负载组名称过滤"
            clearable
          >
            <el-option
              v-for="loadGroupName in LoadGroupSel"
              :key="loadGroupName"
              :label="loadGroupName"
              :value="loadGroupName"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="tipMenu">
        <i
          class="fa fa-exclamation-circle"
          style="color:#ff8746"
        />
        <span style="color:#ff8746">
          没有指定负载路由的存储桶将按默认负载路由配置
        </span>
      </div>
      <el-table
        v-loading="loading"
        :data="filterSearchTable"
        style="width: 100%"
        class="table"
      >
        <el-table-column
          prop="bucketId"
          label="桶名称"
          min-width="150px"
        >
          <template slot-scope="scope">
            <showToolTip
              :text="scope.row.bucketName"
              width="90%"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="桶用量"
          width="150px"
        >
          <template slot-scope="scope">
            {{ renderUseSize(scope.row.bucketUsedSize) }}
          </template>
        </el-table-column>
        <el-table-column
          label="桶配额"
          width="150px"
        >
          <template slot-scope="scope">
            {{ renderQuota(scope.row.bucketQuotaSize) }}
          </template>
        </el-table-column>
        <el-table-column
          label="桶协议类型"
          width="120px"
        >
          <template>
            S3
          </template>
        </el-table-column>

        <el-table-column
          prop="loadGroupName"
          label="冷负载组"
          min-width="80px"
        >
          <template slot-scope="scope">
            <showToolTip
              :text="scope.row.dataLoadGroupName + '('+ mapLoadGroupType[scope.row.dataLoadGroupName] +')'"
              use-slot
            >
              <a
                slot="data"
                class="blue"
                @click="viewLoadGroup('loadGroup',scope.row.dataLoadGroupName)"
              >{{ scope.row.dataLoadGroupName + '('+ mapLoadGroupType[scope.row.dataLoadGroupName] +')' }}</a>
            </showToolTip>
          </template>
        </el-table-column>
        <el-table-column
          prop="dataLoadGroupQuotaSize"
          label="冷负载组总容量"
          width="150px"
        >
          <template slot-scope="scope">
            {{ renderQuota(scope.row.dataLoadGroupQuotaSize) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="loadGroupStatus"
          label="冰负载组"
          min-width="120px"
        >
          <template slot-scope="scope">
            <showToolTip
              :text="scope.row.glacierLoadGroupName"
              width="80%"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="dataLoadGroupQuotaSize"
          label="冰负载组总容量"
          width="150px"
        >
          <template slot-scope="scope">
            {{ scope.row.glacierLoadGroupName && renderQuota(scope.row.glacierLoadGroupQuotaSize) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="loadGroupCapacity"
          label="操作"
          fixed="right"
          width="150px"
        >
          <template slot-scope="scope">
            <div class="actionMenu">
              <el-tooltip
                content="修改负载路由"
                placement="top"
              >
                <i
                  class="el-icon-edit-outline"
                  @click="openEdit(scope.row)"
                />
              </el-tooltip>
              <!-- <el-tooltip
                content="设为默认"
                placement="top"
              >
                <i
                  v-show="!disableDefault"
                  class="el-icon-refresh-left"
                  @click="deleteConfig(scope.row)"
                />
              </el-tooltip> -->
            </div>
            <!-- <el-dropdown v-access="'s3:DeleteBucket||admin:UpdateBucket'" size="small">
              <el-button type="primary" class="blue">
                {{ $ts('action') }}<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="openEdit(scope.row)">指定负载</el-dropdown-item>
                <div :class="[disableDefault ? 'cursorDisabled' : null]">
                  <el-dropdown-item
                    :disabled="disableDefault"
                    @click.native="deleteConfig(scope.row)"
                  >设为默认</el-dropdown-item>
                </div>
              </el-dropdown-menu> -->
            <!-- <div class="actionMenu">
              <i class="fa fa-pencil fa-fw" @click="openEdit(scope.row)" />
              <i
                class="fa fa-trash-o"
                @click="deleteConfig(scope.row)"
              />
              <i class="fa fa-pencil fa-fw" style="visibility:hidden" />
            </div> -->
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="total,sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="10"
        :total="filterSearchTable.length"
        :current-page="1"
      />
    </div>

    <el-dialog
      title="创建负载路由"
      :visible.sync="flag"
      width="600px"
      @open="resetField"
      @close="resetForm"
    >
      <el-form
        ref="form"
        class="createForm"
        :model="form"
        label-width="150px"
        :rules="rules"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="冷负载组"
              prop="loadGroup"
            >
              <el-select
                v-model="form.loadGroup"
                value-key="value"
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
          </el-col>
          <el-col :span="24">
            <el-form-item label="冰负载组">
              <el-select
                v-model="form.glacierLoadGroupId"
                value-key="value"
                filterable
                clearable
              >
                <el-option
                  v-for="{label,value} in glacierGroupList"
                  :key="label"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="温负载组">
              <el-select
                v-model="form.warmLoadGroupId"
                value-key="value"
                filterable
                clearable
              >
                <el-option
                  v-for="{label,value} in warmGroupList"
                  :key="label"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="添加存储桶"
              class="select-checked"
              prop="selectBucket"
            >
              <el-select
                v-model="form.selectBucket"
                placeholder="请选择存储桶"
                value-key="value"
                multiple
                filterable
                collapse-tags
              >
                <el-option
                  v-for="{id,name} in filterSelBucket"
                  :key="name"
                  :label="name"
                  :value="{value:id.toString(),name}"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-table
            v-if="form.selectBucket.length"
            :data="submitSelectBucket"
            :max-height="300"
          >
            <el-table-column
              label="已选择存储桶"
              prop="name"
            >
              <template slot-scope="scope">
                {{ scope.row.name.name }}
              </template>
            </el-table-column>
            <el-table-column
              label="移除"
              width="80px"
            >
              <template slot-scope="scope">
                <i
                  v-access="'admin:DeleteUser'"
                  class="fa fa-trash-o"
                  title="删除"
                  @click="handleRemoveBucket(scope)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="blue"
          @click="flag = false"
        >{{ $ts('button.cancel') }}</el-button>
        <el-button
          class="golden"
          type="primary"
          @click="confirmCreate"
        >{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="openModal"
      title="编辑负载路由"
      width="600px"
    >
      <el-form
        ref="editForm"
        label-width="180px"
        class="editForm"
        :model="editForm"
        :rules="rules"
      >
        <el-form-item label="存储桶名称">
          {{ currentBucket.bucketName }}
        </el-form-item>
        <el-form-item prop="editLoadGroup">
          <span slot="label">
            冷负载组
            <!-- <el-popover placement="top" width="250" trigger="hover" style="position:absolute;">
              <p style="line-height:1.6;"> 无默认负载组时，需手动指定负载组</p>
              <i slot="reference" class="fa fa-question-circle" style="margin-left:10px" />
            </el-popover> -->
          </span>
          <!-- <span slot="label" class="slot_required">*</span> -->
          <el-select
            v-model="editForm.editLoadGroup"
            value-key="value"
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
          <!-- <el-radio-group v-model="chargeLoadGroup">
            <el-radio :label="false" :disabled="disableDefault">{{ '默认负载组' + (!disableDefault ? '('+defaultGroupName + ')' :'') }}</el-radio>
            <el-radio :label="true">指定负载组</el-radio>
          </el-radio-group> -->
        </el-form-item>

        <el-form-item label="冰负载组">
          <el-select
            v-model="editForm.glacierLoadGroupId"
            value-key="value"
            filterable
            clearable
          >
            <el-option
              v-for="{label,value} in glacierGroupList"
              :key="label"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="温负载组">
          <el-select
            v-model="editForm.warmLoadGroupId"
            value-key="value"
            filterable
            clearable
          >
            <el-option
              v-for="{label,value} in warmGroupList"
              :key="label"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <!-- <el-form-item v-if="chargeLoadGroup" prop="editLoadGroup" /> -->
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="blue"
          @click="openModal = false"
        >{{ $ts('button.cancel') }}</el-button>
        <el-button
          class="golden"
          type="primary"
          @click="confirmUpdate"
        >{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listUserBuckets } from '@/api/bucket'
import {
  getGroupList,
  putBucketExtend,
  getBucketExtendList
} from '@/api/storage'
export default {
  name: 'LoadGroupRoute',
  data () {
    return {
      warmGroupList: [],
      glacierGroupList: [],
      disableGroupId: '',
      mapLoadGroupType: {},
      disableDefault: true,
      loadGroupList: [],
      optionsAll: false,
      flag: false,
      tableData: [],
      loading: false,
      searchLoad: '',
      currentBucket: {},
      chargeLoadGroup: true,
      openModal: false,
      optionsData: [],
      selectedOptions: [],
      form: {
        loadGroup: '',
        glacierLoadGroupId: '',
        selectBucket: [],
        warmLoadGroupId: ''
      },
      editForm: {
        editLoadGroup: '',
        glacierLoadGroupId: '',
        warmLoadGroupId: ''
      },
      allBucket: [],
      selBucket: '',
      selLoadGroup: '',
      rules:
      {
        loadGroup: { required: true, message: '请选择负载组', trigger: ['blur', 'change'] },
        selectBucket: { required: true, message: '请选择存储桶', trigger: ['blur', 'change'] },
        editLoadGroup: {
          message: '请选择负载组', trigger: ['blur', 'change'],
          required: true, validator: (rule, val, cb) => {
            if (!val.value) {
              return cb('请选择负载组')
            } else {
              return cb()
            }
          }
        }
      }
    }
  },
  computed: {
    filterLoadGroupList () {
      return this.loadGroupList.filter(x => x.options.length)
    },
    // 过滤当前已展示的负载路由数据
    BucketNameSel () {
      return this.filterSearchTable.map(x => x.bucketName).filter(x => x)
    },
    LoadGroupSel () {
      return this.filterSearchTable.reduce((pre, cur) => {
        if (!pre.includes(cur.dataLoadGroupName)) {
          pre.push(cur.dataLoadGroupName)
        }
        return pre
      }, [])
    },
    submitSelectBucket () {
      return this.form.selectBucket.map(x => {
        return {
          name: x
        }
      })
    },
    filterSelBucket () {
      return this.allBucket.filter(x => {
        return this.form.selectBucket.every(i => {
          return x.name !== i.name
        })
      })
    },
    filterSearchTable () {
      // 过滤负载组不存在
      return this.tableData.filter(x => {
        return x.bucketName && x.bucketName.indexOf(this.selBucket) > -1 && x.dataLoadGroupName.indexOf(this.selLoadGroup) > -1
      })
    }
  },
  watch: {
  },
  mounted () {
    this.init()
  },
  methods: {
    renderUseSize (data) {
      return this.byteConvert(data)
    },
    renderQuota (data) {
      return Number(data) === -1 ? '无上限' : this.byteConvert(Number(data))
    },
    handleRemoveBucket (row) {
      this.form.selectBucket.splice(row.$index, 1)
    },
    init () {
      this.loading = true
      // list 桶路由 用户桶 映射
      getGroupList().then(res => {
        this.mapLoadGroupType = res.data.reduce((pre, cur) => {
          if (!pre[cur.loadGroupName]) {
            pre[cur.loadGroupName] = cur.storageType
          }
          if (cur.defaultGroup && cur.groupTag === 'DATA') {
            this.disableGroupId = cur.dataLoadGroupId
            this.disableDefault = false
          }
          return pre
        }, {})
        getBucketExtendList().then((res) => {
          this.tableData = (res.data || []).filter(x => {
            // 需过滤无指定负载路由的桶、设置后设置默认仍有记录的桶
            const {
              cacheLoadGroupId,
              dataLoadGroupId,
              dataLoadGroupName
            } = x
            const id = cacheLoadGroupId || dataLoadGroupId
            return id && id !== this.disableGroupId && dataLoadGroupName
          })
        }).finally(() => {
          this.loading = false
        })
      }).catch(() => {
        this.loading = false
      })
    },
    handleAdd () {
      const all = [getGroupList(), listUserBuckets()]
      Promise.allSettled(all).then(res => {
        const loadGroupList = res[0].value.data || []
        const bucketList = res[1].value.data.list || []
        this.loadGroupList = [
          { label: 'S3负载组', options: [] },
          { label: 'NAS负载组', options: [] },
          { label: 'AWS负载组', options: [] }
        ]
        this.glacierGroupList = []
        this.warmGroupList = []
        this.form.glacierLoadGroupId = ''
        this.form.warmLoadGroupId = ''
        // 移除默认  && !x.defaultGroup
        loadGroupList.forEach(x => {
          if (x.groupTag === 'DATA') {
            const item = {
              label: x.loadGroupName,
              value: x.id,
              groupTag: x.groupTag
            }
            if (x.storageType === 'S3') {
              this.loadGroupList[0].options.push(item)
            } else if (x.storageType === 'NAS') {
              this.loadGroupList[1].options.push(item)
            } else if (x.storageType === 'IAM') {
              this.loadGroupList[2].options.push(item)
            }
          }
          if (x.storageType === 'GLACIER') {
            this.glacierGroupList.push({
              label: x.loadGroupName,
              value: x.id
            })
          }
          if (x.storageType === 'WARM') {
            this.warmGroupList.push({
              label: x.loadGroupName,
              value: x.id
            })
          }
        })
        // var temp = []
        // for (let i = 0; i < 100; i++) {
        //   temp.push({
        //     name: i + Date.now() + '',
        //     id: Number(i + 1)
        //   })
        // }
        // .concat(temp)
        // 过滤已配置路由的桶
        this.allBucket = (bucketList || []).filter(x => {
          return this.tableData.every(y => {
            return x.name !== y.bucketName
          })
        })
      }).finally(() => {
        this.flag = true
      })
    },
    //
    resetForm () {
      this.$refs['form'].resetFields()
    },
    resetField () {
      this.$refs['form'] && this.$refs['form'].clearValidate('selectBucket')
    },
    viewLoadGroup (type, data) {
      if (type === 'bucket') {
        this.$router.push({
          path: `/main/bucket/BucketDetail/${data}/BucketLoadGroup`
        })
      } else {
        this.$router.push({
          name: 'LoadGroup',
          params: {
            loadGroupName: data
          }
        })
      }
    },
    openEdit (row) {
      this.currentBucket = {
        bucketName: row.bucketName,
        bucketId: row.bucketId
      }
      // 指定负载组、默认负载组、
      this.chargeLoadGroup = true
      getGroupList().then((res) => {
        const group = res.data || []
        let selectGroup = ''
        let selectGlacier = ''
        let selectWarm = ''
        this.glacierGroupList = []
        this.loadGroupList = [
          { label: 'S3负载组', options: [] },
          { label: 'NAS负载组', options: [] },
          { label: 'AWS负载组', options: [] }
        ]
        group.forEach(x => {
          // case2
          if (x.id === (row.cacheLoadGroupId || row.dataLoadGroupId)) {
            selectGroup = x
          }
          if (x.id === row.glacierLoadGroupId) {
            selectGlacier = x
          }
          if (x.id === row.warmLoadGroupId) {
            selectWarm = x
          }
          // 移除默认负载组 && !x.defaultGroup
          // groupTag 添加冰存储
          if (x.groupTag === 'DATA') {
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
            }
          }
          if (x.storageType === 'GLACIER') {
            this.glacierGroupList.push({
              label: x.loadGroupName,
              value: x.id
            })
          }
          if (x.storageType === 'WARM') {
            this.warmGroupList.push({
              label: x.loadGroupName,
              value: x.id
            })
          }
        })
        // select 回显
        // 此处可能问题、负载组按组区分、若桶已分配的负载组空、那就无了
        if (selectGroup) {
          this.editForm.editLoadGroup = {
            value: selectGroup.id,
            groupTag: selectGroup.groupTag
          }
          this.editForm.glacierLoadGroupId = selectGlacier ? selectGlacier.id : ''
          this.editForm.warmLoadGroupId = selectWarm ? selectWarm.id : ''
        } else {
          this.editForm.editLoadGroup = {}
        }
        this.openModal = true
      })
    },
    // 移除当前配置、相当于设置默认负载
    deleteConfig (row) {
      this.$confirm('存储桶将按默认负载路由配置!', '请确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(res => {
        putBucketExtend({
          bucketIds: [row.bucketId.toString()],
          cacheLoadGroupId: null,
          dataLoadGroupId: null
        }).then(() => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
        }).finally(() => {
          this.init()
        })
      })
    },
    // 新增桶负载路由
    confirmCreate () {
      const {
        loadGroup,
        selectBucket,
        glacierLoadGroupId,
        warmLoadGroupId
      } = this.form
      const bucketIds = selectBucket.reduce((pre, cur) => [...pre, ...[cur.value.toString()]], [])
      const loadGroupConfig = {}
      if (loadGroup.groupTag === 'DATA') {
        loadGroupConfig.dataLoadGroupId = loadGroup.value
      } else {
        loadGroupConfig.cacheLoadGroupId = loadGroup.value
      }
      glacierLoadGroupId && Object.assign(
        loadGroupConfig,
        { glacierLoadGroupId }
      )
      warmLoadGroupId && Object.assign(
        loadGroupConfig, { warmLoadGroupId }
      )
      this.$refs['form'].validate(valid => {
        if (valid) {
          putBucketExtend({
            bucketIds,
            ...loadGroupConfig
          }).then(res => {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.flag = false
          }).finally(() => {
            this.init()
          })
        }
      })
    },
    // 修改桶负载路由
    confirmUpdate () {
      // true 修改负载路由
      this.$refs['editForm'].validate(valid => {
        if (valid) {
          if (this.chargeLoadGroup) {
            const loadGroupConfig = {}
            if (this.editForm.editLoadGroup.groupTag === 'DATA') {
              loadGroupConfig.dataLoadGroupId = this.editForm.editLoadGroup.value
              loadGroupConfig.cacheLoadGroupId = null
            } else {
              loadGroupConfig.cacheLoadGroupId = this.editForm.editLoadGroup.value
              loadGroupConfig.dataLoadGroupId = null
            }
            const {
              glacierLoadGroupId,
              warmLoadGroupId
            } = this.editForm
            glacierLoadGroupId && Object.assign(
              loadGroupConfig, { glacierLoadGroupId }
            )
            warmLoadGroupId && Object.assign(
              loadGroupConfig, { warmLoadGroupId }
            )
            putBucketExtend({
              bucketIds: [this.currentBucket.bucketId],
              ...loadGroupConfig
            }).then(res => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.openModal = false
            }).finally(() => {
              this.init()
            })
          } else {
            // 指定默认负载
            putBucketExtend({
              bucketIds: [this.currentBucket.bucketId],
              cacheLoadGroupId: null,
              dataLoadGroupId: null
            }).then(() => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.openModal = false
            }).finally(() => {
              this.init()
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.cascaderTag.el-tag {
  color: #e39606 !important;
  background-color: #384348;
  border-color: transparent;
  height: 22px;
  line-height: 20px;
  border-radius: 20px;
  margin: 0 5px;
  width: fit-content;
  text-align: center;
}

:deep(.createForm) {
  .el-select {
    width: 100%;
  }
  label.el-form-item__label {
    margin-left: -20px;
  }
  .delBtn {
    margin-left: 100px;
    color: #ff8746;
    cursor: pointer;
  }
  .overflownYES {
    margin: 0px 0 20px;
    max-height: 300px;
    overflow-y: scroll;
    display: flex;
    flex-wrap: wrap;

    label {
      width: 165px;
      margin-right: unset !important;
    }

    span.el-checkbox__label {
      white-space: pre-wrap;
    }
  }
}

.el-tag {
  color: #e39606;
  background-color: transparent;
  border-color: transparent;
  max-width: 100%;
  height: fit-content;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
  padding: 0;
}
:deep(.editForm) {
  label.el-form-item__label {
    width: 160px !important;
    margin-left: 0;
  }
  .slot_required {
    color: #f56c6c;
    position: relative;
    right: -40px;
  }
}
.tipMenu {
  margin: 20px 0;
  font-size: 14px;
}
.actionMenu {
  width: 80px;
  font-size: 22px;
  cursor: pointer;
  color: #ff8746;
  .el-icon-refresh-left {
    font-size: 22px;
  }
}
:deep(.resetStyle) {
  span {
    color: unset;
  }
}
</style>
