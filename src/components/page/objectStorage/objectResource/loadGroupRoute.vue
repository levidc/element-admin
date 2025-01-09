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
          min-width="120px"
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
          width="120px"
        >
          <template slot-scope="scope">
            {{ renderUseSize(scope.row.bucketUsedSize) }}
          </template>
        </el-table-column>
        <el-table-column
          label="桶配额"
          width="120px"
        >
          <template slot-scope="scope">
            {{ renderQuota(scope.row.bucketQuotaSize) }}
          </template>
        </el-table-column>
        <el-table-column
          label="桶协议类型"
          width="100px"
        >
          <template>
            S3
          </template>
        </el-table-column>
        <el-table-column label="关联负载组" min-width="600px" align="center">
          <template slot-scope="data">
            <el-table class="innerTable" :data="[data.row]">
              <el-table-column v-for="{prop,label,minWidth,useSlot,formatter} in renderColumn(data.row)" :key="prop" :prop="prop" :label="label" :min-width="minWidth" align="center">
                <template slot-scope="scope">
                  <!-- useSlot 对应负载组名称如默认负载（添加默认） -->
                  <showToolTip
                    v-if="useSlot"
                    :text="showLoadGroupName(scope.row,prop)"
                    use-slot
                  >
                    <a
                      slot="data"
                      class="blue"
                      @click="viewLoadGroup('loadGroup',scope.row[prop])"
                    >{{ showLoadGroupName(scope.row,prop) }}</a>
                  </showToolTip>
                  <span v-else>{{ formatter? formatter(scope.row[prop]):scope.row[prop] }}</span>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <!-- <el-table-column
          prop="dataLoadGroupName"
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
          prop="glacierLoadGroupName"
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
        </el-table-column> -->
        <el-table-column
          prop="loadGroupCapacity"
          label="操作"
          fixed="right"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <div class="menuList">
              <el-tooltip
                content="修改负载路由"
                placement="top"
              >
                <i
                  class="el-icon-edit-outline"
                  @click="openEdit(scope.row)"
                />
              </el-tooltip>
            </div>
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
      width="750px"
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
        <div class="tipMenu">
          <i
            class="fa fa-exclamation-circle"
            style="color:#ff8746"
          />
          <span style="color:#ff8746">
            没有指定负载路由的存储桶将按默认负载路由配置
          </span>
        </div>
        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item
              label="冷负载组"
              prop="loadGroup"
            >
              <el-select
                v-model="form.loadGroup"
                value-key="value"
                filterable
                :disabled="form.loadGroupBlackList==-2"
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
          <el-col :span="10">
            <el-form-item label="负载组黑名单">
              <el-radio-group
                v-model="form.loadGroupBlackList"
              >
                <el-radio :label="false">关闭</el-radio>
                <el-radio :label="-2">开启</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item label="冰负载组">
              <el-select
                v-model="form.glacierLoadGroupId"
                value-key="value"
                filterable
                :disabled="form.glacierGroupBlackList==-2"
              >
                <el-option
                  v-for="{label,value} in glacierGroupList"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="负载组黑名单">
              <el-radio-group
                v-model="form.glacierGroupBlackList"
              >
                <el-radio :label="false">关闭</el-radio>
                <el-radio :label="-2">开启</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item label="温负载组">
              <el-select
                v-model="form.warmLoadGroupId"
                value-key="value"
                filterable
                clearable
                :disabled="form.warmGroupBlackList==-2"
              >
                <el-option
                  v-for="{label,value} in warmGroupList"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="负载组黑名单">
              <el-radio-group
                v-model="form.warmGroupBlackList"
              >
                <el-radio :label="false">关闭</el-radio>
                <el-radio :label="-2">开启</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="解冻负载组">
              <el-select
                v-model="form.restoreLoadGroupId"
                value-key="value"
                filterable
                clearable
              >
                <el-option
                  v-for="{label,value} in restoreGroupList"
                  :key="value"
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
                <svg v-access="'admin:DeleteUser'" @click="handleRemoveBucket(scope)" class="icon icon-trash" aria-hidden="true">
                  <use xlink:href="#icon-trash" />
                </svg>
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
      title="修改负载路由"
      width="750px"
    >

      <el-form
        ref="editForm"
        label-width="150px"
        class="editForm"
        :model="editForm"
        :rules="rules"
      >
        <div style="margin:0 0 20px 0">
          <i
            class="fa fa-exclamation-circle"
            style="color:#ff8746"
          />
          <span style="color:#ff8746">
            没有指定负载路由的存储桶将按默认负载路由配置
          </span>
        </div>
        <el-form-item label="存储桶名称">
          {{ currentBucket.bucketName }}
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="14">
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
                filterable
                clearable
                :disabled="editForm.loadGroupBlackList===-2"
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

              <!-- <el-select
            v-model="editForm.editLoadGroup"
          >
            <el-option
              v-for="{label,value} in loadGroupList"
              :key="label"
              :label="label"
              :value="value"
            />
          </el-select> -->
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="负载组黑名单">
              <el-radio-group
                v-model="editForm.loadGroupBlackList"
              >
                <el-radio :label="false">关闭</el-radio>
                <el-radio :label="-2">开启</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item label="冰负载组">
              <el-select
                v-model="editForm.glacierLoadGroupId"
                filterable
                clearable
                :disabled="editForm.glacierGroupBlackList===-2"
              >
                <el-option
                  v-for="{label,value} in glacierGroupList"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="10">
            <el-form-item label="负载组黑名单">
              <el-radio-group
                v-model="editForm.glacierGroupBlackList"
              >
                <el-radio :label="false">关闭</el-radio>
                <el-radio :label="-2">开启</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="14">
            <el-form-item label="温负载组">
              <el-select
                v-model="editForm.warmLoadGroupId"
                value-key="value"
                filterable
                clearable
                :disabled="editForm.warmGroupBlackList===-2"
              >
                <el-option
                  v-for="{label,value} in warmGroupList"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="负载组黑名单">
              <el-radio-group
                v-model="editForm.warmGroupBlackList"
              >
                <el-radio :label="false">关闭</el-radio>
                <el-radio :label="-2">开启</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="解冻负载组">
          <el-select
            v-model="editForm.restoreLoadGroupId"
            value-key="value"
            filterable
            clearable
          >
            <el-option
              v-for="{label,value} in restoreGroupList"
              :key="value"
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
  data() {
    return {
      loadGroupNameKey:
      [
        'dataLoadGroupName',
        'glacierLoadGroupName',
        'warmLoadGroupName',
        'restoreLoadGroupName'
      ],
      restoreGroupList: [],
      warmGroupList: [],
      glacierGroupList: [],
      disableGroupId: '',
      mapLoadGroupType: {},
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
        loadGroupBlackList: false,
        glacierGroupBlackList: false,
        warmGroupBlackList: false,
        loadGroup: '',
        glacierLoadGroupId: '',
        selectBucket: [],
        warmLoadGroupId: '',
        restoreLoadGroupId: ''
      },
      editForm: {
        loadGroupBlackList: false,
        glacierGroupBlackList: false,
        warmGroupBlackList: false,
        editLoadGroup: '',
        glacierLoadGroupId: '',
        warmLoadGroupId: '',
        restoreLoadGroupId: ''
      },
      allBucket: [],
      selBucket: '',
      selLoadGroup: '',
      rules:
      {
        // loadGroup: { required: true, message: '请选择负载组', trigger: ['blur', 'change'],
        //   validator: (rule, val, cb) => {
        //     if (!val.value) {
        //       return cb('请选择负载组')
        //     } else {
        //       return cb()
        //     }
        //   }
        // },
        selectBucket: { required: true, message: '请选择存储桶', trigger: ['blur', 'change'] }
        // editLoadGroup: {
        //   message: '请选择负载组', trigger: ['blur', 'change'],
        //   required: true, validator: (rule, val, cb) => {
        //     if (!val.value) {
        //       return cb('请选择负载组')
        //     } else {
        //       return cb()
        //     }
        //   }
        // }
      }
    }
  },
  computed: {
    filterLoadGroupList() {
      return this.loadGroupList.filter(x => x.options.length)
    },
    // 过滤当前已展示的负载路由数据
    BucketNameSel() {
      return this.tableData.map(x => x.bucketName).filter(x => x)
    },
    LoadGroupSel() {
      return this.tableData.reduce((pre, cur) => {
        for (const item of this.loadGroupNameKey) {
          if (cur[item] && !pre.includes(cur[item])) {
            pre.push(cur[item])
          }
        }
        return pre
      }, [])
    },
    submitSelectBucket() {
      return this.form.selectBucket.map(x => {
        return {
          name: x
        }
      })
    },
    filterSelBucket() {
      return this.allBucket.filter(x => {
        return this.form.selectBucket.every(i => {
          return x.name !== i.name
        })
      })
    },
    filterSearchTable() {
      // 过滤负载组不存在、过滤负载组名称、桶名称、负载组名称不存在新增黑名单设置后也无名称
      return this.tableData.filter(x => {
        return (this.selBucket ? x.bucketName && x.bucketName === this.selBucket : true) &&
        (this.selLoadGroup ? this.loadGroupNameKey.some(y => x[y] && x[y] === this.selLoadGroup) : true)
      })
    }
  },
  watch: {
  },
  mounted() {
    this.init()
  },
  methods: {
    showLoadGroupName(row, prop) {
      const isDefault = this.mapLoadGroupType[row[prop]] ? `(默认)` : ''
      return row[prop] + isDefault
    },
    renderColumn(data) {
      //
      const {
        dataLoadGroupName,
        glacierLoadGroupName,
        warmLoadGroupName,
        restoreLoadGroupName
      } = data
      return [
        {
          prop: 'dataLoadGroupName',
          label: '冷负载组',
          minWidth: '80px',
          useSlot: true,
          show: !!dataLoadGroupName
        },
        {
          prop: 'dataLoadGroupQuotaSize',
          label: '总容量',
          minWidth: '100px',
          formatter: (val) => this.renderQuota(val),
          show: !!dataLoadGroupName
        },
        {
          prop: 'glacierLoadGroupName',
          label: '冰负载组',
          minWidth: '120px',
          useSlot: true,
          show: !!glacierLoadGroupName
        },
        {
          prop: 'glacierLoadGroupQuotaSize',
          label: '总容量',
          minWidth: '100px',
          formatter: (val) => this.renderQuota(val),
          show: !!glacierLoadGroupName
        },
        {
          prop: 'warmLoadGroupName',
          label: '温负载组',
          minWidth: '120px',
          useSlot: true,
          show: !!warmLoadGroupName
        },
        {
          prop: 'warmLoadGroupQuotaSize',
          label: '总容量',
          minWidth: '100px',
          formatter: (_, __, val) => this.renderQuota(val),
          show: !!warmLoadGroupName
        },
        {
          prop: 'restoreLoadGroupName',
          label: '解冻负载组',
          minWidth: '120px',
          useSlot: true,
          show: !!restoreLoadGroupName
        },
        {
          prop: 'restoreLoadGroupQuotaSize',
          label: '总容量',
          minWidth: '100px',
          formatter: (_, __, val) => this.renderQuota(val),
          show: !!restoreLoadGroupName
        }
      ].filter(x => x.show)
    },
    renderUseSize(data) {
      return this.byteConvert(data)
    },
    renderQuota(data) {
      return Number(data) === -1 ? '无上限' : this.byteConvert(Number(data))
    },
    handleRemoveBucket(row) {
      this.form.selectBucket.splice(row.$index, 1)
    },
    init() {
      this.loading = true
      // list 桶路由 用户桶 映射
      getGroupList().then(res => {
        this.mapLoadGroupType = res.data.reduce((pre, cur) => {
          if (!pre[cur.loadGroupName]) {
            pre[cur.loadGroupName] = cur.defaultGroup
          }
          return pre
        }, {})
        getBucketExtendList().then((res) => {
          this.tableData = res.data || []
          // this.tableData = (res.data || []).filter(x => {
          //   // 需过滤无指定负载路由的桶、设置后设置默认仍有记录的桶
          //   const {
          //     cacheLoadGroupId,
          //     dataLoadGroupId,
          //     dataLoadGroupName
          //   } = x
          //   return dataLoadGroupName || (dataLoadGroupId === -2) || (cacheLoadGroupId === -2)
          //   // const id = cacheLoadGroupId || dataLoadGroupId
          //   // return id && id !== this.disableGroupId && dataLoadGroupName
          // })
          // 测试不同负载路由下多负载组展示
          // this.tableData.push({
          //   'bucketId': 215424780872978430,
          //   'cacheLoadGroupId': null,
          //   'dataLoadGroupId': 1,
          //   'glacierLoadGroupId': 30001,
          //   'warmLoadGroupId': 2,
          //   'restoreLoadGroupId': 60001,
          //   'packageMinSize': null,
          //   'packageMaxCacheSecond': null,
          //   'bucketName': 'test-cold-to-warm222',
          //   'bucketUsedSize': 209796102,
          //   'bucketQuotaSize': 107374182400,
          //   'dataLoadGroupName': 'coldLoadGroup',
          //   'dataLoadGroupQuotaSize': -1,
          //   'glacierLoadGroupName': 'glacierLoadGroup',
          //   'glacierLoadGroupQuotaSize': -1
          // })
        }).finally(() => {
          this.loading = false
        })
      }).catch(() => {
        this.loading = false
      })
    },
    handleAdd() {
      const all = [getGroupList(), listUserBuckets()]
      Promise.allSettled(all).then(res => {
        const loadGroupList = res[0].value.data || []
        const bucketList = res[1].value.data.list || []
        this.glacierGroupList = []
        this.warmGroupList = []
        this.restoreGroupList = []

        Object.assign(this.form,
          {
            loadGroup: '',
            loadGroupBlackList: false,
            glacierLoadGroupId: '',
            glacierGroupBlackList: false,
            warmLoadGroupId: '',
            warmGroupBlackList: false
          })

        // this.form.glacierLoadGroupId = ''
        // this.form.restoreLoadGroupId = ''
        // this.form.warmLoadGroupId = ''
        this.loadGroupList = [
          { label: 'S3负载组', options: [] },
          { label: 'NAS负载组', options: [] },
          { label: 'AWS负载组', options: [] }
        ]
        // 移除默认  && !x.defaultGroup
        loadGroupList.forEach(x => {
          const isDefault = x.defaultGroup ? '（默认）' : ''
          if (x.groupTag === 'DATA') {
            const item = {
              label: x.loadGroupName + isDefault,
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
            // this.loadGroupList.push({
            //   label: x.loadGroupName + isDefault,
            //   value: x.id
            // })
          }
          if (x.groupTag === 'GLACIER') {
            this.glacierGroupList.push({
              label: x.loadGroupName + isDefault,
              value: x.id
            })
          }
          if (x.groupTag === 'WARM') {
            this.warmGroupList.push({
              label: x.loadGroupName + isDefault,
              value: x.id
            })
          }
          if (x.groupTag === 'RESTORE') {
            this.restoreGroupList.push({
              label: x.loadGroupName + isDefault,
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
        // 统计无配置的桶
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
    resetForm() {
      this.$refs['form'].resetFields()
    },
    resetField() {
      this.$refs['form'] && this.$refs['form'].clearValidate('selectBucket')
    },
    viewLoadGroup(type, data) {
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
    openEdit(row) {
      this.currentBucket = {
        bucketName: row.bucketName,
        bucketId: row.bucketId
      }
      // 指定负载组、默认负载组、
      this.chargeLoadGroup = true

      const {
        cacheLoadGroupId,
        dataLoadGroupId,
        glacierLoadGroupId,
        warmLoadGroupId,
        restoreLoadGroupId
      } = row

      getGroupList().then((res) => {
        const group = res.data || []
        let selectGroup = ''
        let selectGlacier = ''
        let selectWarm = ''
        let selectRestore = ''
        this.glacierGroupList = []
        this.restoreGroupList = []
        this.warmGroupList = []
        this.loadGroupList = [
          { label: 'S3负载组', options: [] },
          { label: 'NAS负载组', options: [] },
          { label: 'AWS负载组', options: [] }
        ]
        group.forEach(x => {
          // case2
          const isDefault = x.defaultGroup ? '（默认）' : ''
          if (x.id === (cacheLoadGroupId || dataLoadGroupId)) {
            selectGroup = x
          }
          if (x.id === glacierLoadGroupId) {
            selectGlacier = x
          }
          if (x.id === warmLoadGroupId) {
            selectWarm = x
          }
          if (x.id === restoreLoadGroupId) {
            selectRestore = x
          }
          // 移除默认负载组 && !x.defaultGroup
          // groupTag 添加冰存储
          if (x.groupTag === 'DATA') {
            const item = {
              label: x.loadGroupName + isDefault,
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
          if (x.groupTag === 'GLACIER') {
            this.glacierGroupList.push({
              label: x.loadGroupName + isDefault,
              value: x.id
            })
          }
          if (x.groupTag === 'WARM') {
            this.warmGroupList.push({
              label: x.loadGroupName + isDefault,
              value: x.id
            })
          }
          if (x.groupTag === 'RESTORE') {
            this.restoreGroupList.push({
              label: x.loadGroupName + isDefault,
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
          //
        } else {
          this.editForm.editLoadGroup = {}
        }
        // 新增黑名单 响应的负载组id为-2、启用黑名单
        this.editForm.glacierLoadGroupId = selectGlacier ? selectGlacier.id : ''
        this.editForm.warmLoadGroupId = selectWarm ? selectWarm.id : ''
        this.editForm.restoreLoadGroupId = selectRestore ? selectRestore.id : ''

        this.editForm.loadGroupBlackList = (cacheLoadGroupId === -2 || dataLoadGroupId === -2) ? -2 : false
        this.editForm.glacierGroupBlackList = glacierLoadGroupId === -2 ? -2 : false
        this.editForm.warmGroupBlackList = warmLoadGroupId === -2 ? -2 : false

        this.openModal = true
      })
    },
    // 移除当前配置、相当于设置默认负载
    deleteConfig(row) {
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
          this.$msg({
            type: 'success',
            text: this.$ts('response.success')
          })
        }).finally(() => {
          this.init()
        })
      })
    },
    // 新增桶负载路由
    confirmCreate() {
      const {
        loadGroup,
        selectBucket,
        glacierLoadGroupId,
        warmLoadGroupId,
        restoreLoadGroupId,
        loadGroupBlackList,
        glacierGroupBlackList,
        warmGroupBlackList
      } = this.form
      const bucketIds = selectBucket.reduce((pre, cur) => [...pre, ...[cur.value.toString()]], [])
      const loadGroupConfig = {}
      if (loadGroup.groupTag === 'CACHE') {
        loadGroupConfig.cacheLoadGroupId = loadGroupBlackList === -2 ? -2 : loadGroup.value
      } else {
        loadGroupConfig.dataLoadGroupId = loadGroupBlackList === -2 ? -2 : loadGroup.value
      }
      if (glacierGroupBlackList === -2) {
        Object.assign(loadGroupConfig, { glacierLoadGroupId: -2 })
      } else {
        glacierLoadGroupId && Object.assign(
          loadGroupConfig,
          { glacierLoadGroupId }
        )
      }
      if (warmGroupBlackList === -2) {
        Object.assign(loadGroupConfig, { warmLoadGroupId: -2 })
      } else {
        warmLoadGroupId && Object.assign(
          loadGroupConfig, { warmLoadGroupId }
        )
      }

      restoreLoadGroupId && Object.assign(
        loadGroupConfig, { restoreLoadGroupId }
      )

      // 新增黑名单

      this.$refs['form'].validate(valid => {
        if (valid) {
          putBucketExtend({
            bucketIds,
            ...loadGroupConfig
          }).then(res => {
            this.$msg({
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
    confirmUpdate() {
      // true 修改负载路由
      this.$refs['editForm'].validate(valid => {
        if (valid) {
          if (this.chargeLoadGroup) {
            const loadGroupConfig = {}
            const {
              glacierLoadGroupId,
              warmLoadGroupId,
              restoreLoadGroupId,
              loadGroupBlackList,
              glacierGroupBlackList,
              warmGroupBlackList
            } = this.editForm
            if (this.editForm.editLoadGroup.groupTag === 'CACHE') {
              loadGroupConfig.cacheLoadGroupId = loadGroupBlackList === -2 ? -2 : this.editForm.editLoadGroup.value
              loadGroupConfig.dataLoadGroupId = null
            } else {
              loadGroupConfig.dataLoadGroupId = loadGroupBlackList === -2 ? -2 : this.editForm.editLoadGroup.value
              loadGroupConfig.cacheLoadGroupId = null
            }

            if (glacierGroupBlackList === -2) {
              Object.assign(loadGroupConfig, { glacierLoadGroupId: -2 })
            } else {
              glacierLoadGroupId && Object.assign(
                loadGroupConfig, { glacierLoadGroupId }
              )
            }

            if (warmGroupBlackList === -2) {
              Object.assign(loadGroupConfig, { warmLoadGroupId: -2 })
            } else {
              warmLoadGroupId && Object.assign(
                loadGroupConfig, { warmLoadGroupId }
              )
            }
            restoreLoadGroupId && Object.assign(
              loadGroupConfig, { restoreLoadGroupId }
            )
            putBucketExtend({
              bucketIds: [this.currentBucket.bucketId],
              ...loadGroupConfig
            }).then(res => {
              this.$msg({
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
              this.$msg({
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
  .tipMenu{
    margin:0 0 20px 0;
  }
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
  .el-select {
    width: 100%;
  }
  label.el-form-item__label {
    margin-left: -20px;
    width: 160px !important;
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
.menuList {
  font-size: 22px;
  cursor: pointer;
  color: #ff8746;
  display: flex;
  justify-content: center;
  .el-icon-refresh-left {
    font-size: 22px;
  }
}
:deep(.resetStyle) {
  span {
    color: unset;
  }
}
:deep(.innerTable) {
  .el-table__header-wrapper {
    thead tr th{
      &:nth-of-type(2n){
        border-right: 1px solid #4f5c62!important;
      }
      &:nth-last-of-type(2){
        border-right: none!important;
      }
    }
  }
  tbody tr td {
    &:nth-of-type(2n){
      border-right: 1px solid #4f5c62!important;
    }
    &:last-of-type{
      border-right: none!important;
    }
  }
  tr {
    &:hover {
      td {
        background: #2c383e !important;
      }
    }
  }
}
</style>
