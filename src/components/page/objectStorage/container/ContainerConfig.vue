<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mb_15">
        <el-button
          v-access="'admin:CreateOrUpdateContainerConfigController'"
          style="margin-bottom:10px"
          type="primary"
          class="golden"
          @click="openCreate"
        >创建</el-button>
        <div class="right">
          <el-tooltip
            content="刷新"
            placement="top"
            effect="dark"
          >
            <i
              class="el-icon-refresh"
              @click="listContainerConfig"
            />
          </el-tooltip>
        </div>
      </el-row>
      <el-table
        ref="multipleTable"
        v-loading="loading"
        class="volumeDetail_column"
        :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
        border
        tooltip-effect="dark"
        row-key="containerId"
        style="width: 100%"
        @sort-change="sortFunction"
      >

        <el-table-column
          label="类型"
          prop="containerFormatType"
          sortable="custom"
        >
          <template slot-scope="scope">
            {{ getType(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column
          label="EC类型"
          prop="durabilityType"
          :formatter="getDurabilityType"
          sortable="custom"
        />
        <el-table-column
          label="默认创建个数"
          prop="defaultCreateNumber"
          sortable="custom"
        />
        <el-table-column
          label="剩余空间(G)"
          prop="threshold"
          sortable="custom"
        />
        <!-- <el-table-column label="启用自动创建" prop="autoCreate" sortable="custom">
          <template slot-scope="scope">
            <span :class="[scope.row.autoCreate?'status_green':'status_red']">{{ scope.row.autoCreate ? '已启用':'未启用' }}</span>
          </template>
        </el-table-column> -->
        <el-table-column
          :label="$ts('action')"
          width="140"
        >
          <template slot-scope="scope">
            <el-dropdown v-access="'admin:CreateOrUpdateContainerConfigController'" size="small">
              <el-button type="primary" class="blue">
                {{ $ts('action') }}<i class="el-icon-arrow-down el-icon--right" />
              </el-button>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="preUpdate(scope.row)">修改</el-dropdown-item>
                <el-dropdown-item @click.native="deleteConfig(scope.row)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div
        v-show="total"
        class="page_block"
      >
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[5, 10, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <el-dialog
      v-dialogDrag
      :title="type==='create'?'创建配置':'修改配置'"
      :visible.sync="isCreate"
      width="600px"
    >
      <el-form
        ref="createForm"
        :model="createForm"
        :rules="createRules"
        size="mini"
        label-width="100px"
        style="padding:0 5%"
      >
        <el-form-item
          label="类型"
          prop="containerFormatType"
        >
          <el-select
            v-model="createForm.containerFormatType"
            filterable
            style="width: 100%;"
            clearable
          >
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >{{ item.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <!-- ectype 接口创建 -->
        <el-form-item
          label="EC类型"
          prop="durabilityType"
        >
          <el-select
            v-model="createForm.durabilityType"
            filterable
            style="width: 100%;"
            clearable
          >
            <el-option
              v-for="item in ecTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >{{ item.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="默认创建个数"
          prop="defaultCreateNumber"
        >
          <el-input
            ref="tableFocus"
            v-model="createForm.defaultCreateNumber"
            auto-complete="off"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="剩余空间"
          prop="threshold"
        >
          <el-input
            ref="tableFocus"
            v-model="createForm.threshold"
            auto-complete="off"
            clearable
          >
            <template slot="append">G</template>
          </el-input>
        </el-form-item>
        <!-- <el-form-item label="启用自动创建" prop="isAutoCreate">
          <el-col :span="3">
            <el-switch v-model="createForm.isAutoCreate" />
          </el-col>
          <el-col :span="3">
            <span v-if="createForm.isAutoCreate" class="green">已启用</span>
            <span v-else class="red">未启用</span>
          </el-col>
        </el-form-item> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" class="golden" @click="createOrUpdate('createForm')">{{ $ts('button.confirm') }}</el-button>
        <el-button @click="isCreate = false;resetForm('createForm')">{{ $ts('button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>

</template>
<script>
import {
  listContainerConfig,
  createOrUpdateContainerConfig
} from '@/api/storage'
export default {
  name: 'ContainerConfig',
  components: {},
  data () {
    return {
      loading: true,
      type: 'create',
      isCreate: false,
      typeList: [
        {
          value: 'TYPE_8G_160_BASKET_4KPAGE',
          label: '8GB'
        },
        {
          value: 'TYPE_32GB_160_BASKET_128KPAGE',
          label: '32GB'
        },
        {
          value: 'TYPE_256GB_160_BASKET_2048KPAGE',
          label: '256GB'
        }
        // {
        //   value: 'TYPE_1M_160_BASKET_4KPAGE',
        //   label: 'TYPE_1M_160_BASKET_4KPAGE'
        // }
      ],
      ecTypeList: [
        // { value: '1', label: 'REPLICATION_3' },
        // { value: '2', label: 'CAUCHY_N9_K3' },
        // { value: '3', label: 'CAUCHY_N6_K3' },
        // { value: '4', label: 'CAUCHY_N18_K9' },
        // { value: '5', label: 'CAUCHY_N21_K11' },
        { value: 6, label: '4+2' },
        { value: 7, label: '2+1' }
      ],
      createForm: {
        containerFormatType: '',
        durabilityType: '',
        defaultCreateNumber: '',
        threshold: '',
        isAutoCreate: true
      },
      createRules: {
        // bucketName: [
        // 	{ required: true, message: this.$ts('domain.name.required'), trigger: 'blur' },
        // 	{ validator: this.nameValidate(2,63),trigger: 'blur'}
        // ]
        containerFormatType: {
          required: true,
          message: '必填',
          trigger: ['blur', 'change']
        },
        durabilityType: {
          required: true,
          message: '必填',
          trigger: ['blur', 'change']
        },
        defaultCreateNumber: [
          { required: true, message: '必填', trigger: 'blur' },
          {
            pattern: /^[1-9]\d*$/,
            message: '请输入正整数',
            trigger: ['blur', 'change']
          }
        ],
        threshold: [
          { required: true, message: '必填', trigger: ['blur', 'change'] },
          {
            validator (rule, data, callback) {
              if (!/^(0|[1-9]\d*)$/.test(data)) {
                return callback('请填入大于等于0的整数')
              } else if (data > 1000000) {
                return callback('限制容量为100万')
              } else {
                return callback()
              }
            },
            trigger: ['blur', 'change']
          }
        ]
      },
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  mounted () {
    this.listContainerConfig()
  },
  methods: {
    getDurabilityType (row, column) {
      let durabilityType = []
      this.ecTypeList.forEach(function (ele) {
        if (ele.value == row[column.property]) {
          durabilityType = ele
        }
      })
      return durabilityType.label
    },
    getType (row) {
      const arr = this.typeList.filter(
        item => row.containerFormatType == item.value
      )
      return arr && arr.length && arr[0].label
    },
    deleteConfig (row) {
      const {
        durabilityType,
        threshold,
        defaultCreateNumber,
        containerFormatType
      } = row
      createOrUpdateContainerConfig({
        durabilityType,
        threshold,
        defaultCreateNumber,
        containerFormatType,
        version: this.$store.state.dosVersion,
        isDelete: true
      })
        .then(res => {
          if (res.error.code !== 0) {
            this.$ts({
              type: 'error',
              text: this.$ts(res.error.name)
            })
          } else {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
          }
          this.listContainerConfig()
        })
        .catch(function (error) {
          console.error(error)
        })
    },
    openCreate () {
      this.type = 'create'
      this.isCreate = true
      this.resetForm('createForm')
    },
    preUpdate (row) {
      console.log(row, 'row')
      this.resetForm('createForm')
      this.type = 'update'
      this.isCreate = true
      this.createForm.containerFormatType = row.containerFormatType
      this.createForm.durabilityType = Number(row.durabilityType)
      this.createForm.threshold = row.threshold
      this.createForm.defaultCreateNumber = row.defaultCreateNumber
      this.createForm.isAutoCreate = row.autoCreate
    },

    handleSizeChange (val) {
      this.pageSize = val
    },
    handleCurrentChange (val) {
      this.currentPage = val
      console.log(JSON.stringify(this.multipleSelection))
    },
    sortFunction (val) {
      this.prop = val.prop
      this.order = val.order
      this.tableData.sort(this.sortMethod(val.prop, val.order))
    },
    resetForm (formName) {
      if (this.$refs[formName] != undefined) {
        this.$refs[formName].resetFields()
      }
    },
    createOrUpdate (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          createOrUpdateContainerConfig({
            durabilityType: this.createForm.durabilityType,
            threshold: this.createForm.threshold,
            defaultCreateNumber: this.createForm.defaultCreateNumber,
            containerFormatType: this.createForm.containerFormatType,
            // accountId: this.$store.state.user.accountId,
            version: this.$store.state.dosVersion,
            isDelete: false
            // isAutoCreate: this.createForm.isAutoCreate
          })
            .then(res => {
              if (res.error.code !== 0) {
                this.$ts({
                  type: 'error',
                  text: this.$ts(res.error.name)
                })
              } else {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                this.resetForm('createForm')
              }
              this.listContainerConfig()
            })
            .catch(error => {
              console.error(error)
            })
            .finally(() => {
              this.isCreate = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    listContainerConfig () {
      this.loading = true
      listContainerConfig({
        version: this.$store.state.dosVersion
      })
        .then(res => {
          if (res.error.code !== 0) {
            this.$ts({
              type: 'error',
              text: this.$ts(res.error.name)
            })
          } else {
            this.tableData = res.data
            this.tableData.sort(this.sortMethod(this.prop, this.order))
            this.total = this.tableData.length
            if (
              this.total &&
              Math.ceil(this.total / this.pageSize) < this.currentPage
            ) {
              this.currentPage = Math.ceil(this.total / this.pageSize)
            }
          }
        })
        .catch(error => {
          console.error(error)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
