<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 menu">
        <div>
          <el-button class="golden mr_10" type="primary" @click="showCreate">创建</el-button>
        </div>
        <div>
          <el-tooltip content="刷新" placement="top" effect="dark">
            <i class="el-icon-refresh" @click="refresh()" />
          </el-tooltip>
        </div>
      </div>
      <DataTable
        ref="DataTable"
        :columns="columns"
        pagination
        :table-data="tableData"
        :loading="loading"
        :page-obj="{ pageSize: pageSize, currentPage: pageNum }"
        :total="total"
        @renderPagination="getPageSearch"
      >
        <el-table-column slot="expressions" min-width="230px" label="策略表达式(字典名称/运算符/值)">
          <!-- <el-table-column
            prop="strategyName"
            label="字典名称"
            width="120"
          >
            {{ 123 }}
          </el-table-column>
          <el-table-column
            prop="expression"
            label="运算符"
            width="120"
          >
            {{ 123 }}
          </el-table-column>
          <el-table-column
            prop="strategyName"
            label="值"
            width="120"
          /> -->
          <template slot-scope="scope">
            <p v-for="(item, index) in scope.row.expressions" :key="index" class="rowExpress">
              <span>
                {{ item.strategyName }}
              </span>
              <span>
                {{ item.expression }}
              </span>
              <span>
                {{ item.num }}
              </span>
              <!-- {{  +'/' + item. + '/'+ item. }} -->
            </p>
          </template>
        </el-table-column>
        <el-table-column slot="action" min-width="100px" label="操作">
          <template slot-scope="scope">
            <el-dropdown size="small" trigger="hover">
              <el-button type="primary" class="blue">
                {{ $ts('action') }}<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="modifyForm(scope.row)">修改表达式</el-dropdown-item>
                <el-dropdown-item @click.native="deleteConfig(scope.row)">删除表达式</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </DataTable>
    </div>
    <el-dialog :visible.sync="flag" width="800px" :title="isAdd ? '创建策略表达式' : '修改策略表达式'">
      <el-form ref="form" :model="form" label-width="120px" :rules="rules">
        <el-form-item prop="policyName" label="策略名称">
          <el-input v-model="form.policyName" placeholder="请输入策略名称" />
        </el-form-item>

        <el-form-item prop="action" label="调度行为">
          <el-radio-group v-model="form.action">
            <el-radio v-for="{ label, value } in renderAction" :key="value" :label="value">{{ label }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="表达式">
          <el-button class="golden mr_10" type="primary" @click="addExpress">添加</el-button>
          <el-row
            v-for="(item, index) in form.expressions"
            :key="index"
            class="addExpress"
            :gutter="20"
            style="margin-top: 15px;"
          >
            <el-col :span="8">
              <el-form-item label=" " :prop="`expressions.${index}.strategyName`" :rules="rules.strategyName">
                <el-popover
                  v-model="form.expressions[index].visiblePopover"
                  placement="top"
                  width="500px"
                  @show="getList()"
                  @hide="resetForm"
                >
                  <p>请选择策略字典</p>
                  <el-table :key="index" v-loading="popLoading" :data="listStrategyDictionary" style="margin:20px 0">
                    <el-table-column label="字典名称" width="300px" prop="strategyName">
                      <template slot-scope="scope">
                        <showToolTip :text="scope.row.strategyName" />
                      </template>
                    </el-table-column>
                    <el-table-column label="类型" width="200px" prop="type">
                      <template slot-scope="scope">
                        {{ enumType[scope.row.type] }}
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="200px">
                      <!-- 触发禁用条件新增 同存储 -->
                      <template slot-scope="scope">
                        <el-button @click="confirmSel(scope.row, index)">选择</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-pagination
                    :current-page="userPage"
                    :page-sizes="[5, 10, 50, 100]"
                    :page-size="userPageSize"
                    :total="userTotal"
                    class="right_page"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleUserSize"
                    @current-change="handleUserPage"
                  />
                  <br>
                  <div style="display:flex;justify-content:flex-end;margin-top:20px">
                    <el-button
                      size="mini"
                      type="text"
                      @click="form.expressions[index].visiblePopover = false"
                    >取消</el-button>
                  </div>
                  <el-button slot="reference">配置策略字典</el-button>
                </el-popover>
                <el-tag v-if="form.expressions[index].strategyName" closable @close="resetConfig(index)">
                  {{ form.expressions[index].strategyName }}
                </el-tag>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item
                v-if="item.type && !['FILE_TYPE', 'PACKAGE_TEMPLATE', 'PREFIX'].includes(item.type)"
                label=" "
                :prop="`expressions.${index}.expression`"
                :rules="rules.expression"
              >
                <el-select v-model="item.expression" placeholder="请选择运算符" clearable>
                  <el-option v-for="opts in operator" :key="opts" :value="opts">
                    {{ opts }}
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item
                v-if="['FILE_SIZE', 'STORAGE_DURATION'].includes(item.type)"
                label=" "
                :prop="`expressions.${index}.num`"
                :rules="rules.num"
              >
                <el-input
                  v-model="item.num"
                  placeholder="请输入正整数"
                  class="byteInput"
                  clearable
                  @input="val => form.expressions[index].num = val.replace(/(^0+)|\D/g, '')"
                >
                  <template v-if="item.type === 'FILE_SIZE'" slot="suffix">
                    Byte
                  </template>
                  <template v-if="item.type === 'STORAGE_DURATION'" slot="suffix">
                    天
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col v-if="['FILE_TYPE', 'PACKAGE_TEMPLATE', 'PREFIX'].includes(item.type)" :span="14">
              <el-form-item
                v-if="['PACKAGE_TEMPLATE'].includes(item.type)"
                label=" "
                :prop="`expressions.${index}.num`"
                :rules="rules.packageType"
              >
                <el-select v-model="item.num" placeholder="请选择" style="width: 100%;">
                  <el-option v-for="opts in packageTemplate" :key="opts" :value="opts">
                    {{ opts }}
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                v-if="['FILE_TYPE'].includes(item.type)"
                label=" "
                :rules="rules.fileType"
                :prop="`expressions.${index}.num`"
              >
                <el-input v-model="item.num" placeholder="请输入文件类型" clearable />
              </el-form-item>
              <el-form-item
                v-if="['PREFIX'].includes(item.type)"
                label=" "
                :rules="rules.prefix"
                :prop="`expressions.${index}.num`"
              >
                <el-input v-model="item.num" type="textarea" placeholder="请输入文件/对象前缀" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="2">
              <i v-if="form.expressions.length !== 1" class="el-icon-delete delBtn" @click="deleteIcon(index)" />
            </el-col>
          </el-row>
        </el-form-item>
        <!-- <el-form-item prop="type" label="字典类型">
          <el-radio-group
            v-model="form.type"
          >
            <el-radio label="FILE_SIZE">文件大小</el-radio>
            <el-radio label="PACKAGE_TEMPLATE">打包模板</el-radio>
          </el-radio-group>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button class="blue" @click="flag = false">{{ $ts('button.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmCreate">{{ $ts('button.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>

import {
  createPolicyExpression,
  listPolicyExpression,
  updatePolicyExpression,
  listStrategyDictionary,
  deletePolicyExpression
} from '@/api/strategyDictionary'

export default {
  name: 'LifecycleTaskList',
  data() {
    return {
      enumAction: {
        'archiving': '转冰',
        'warming': '转温',
        'colding': '转冷',
        'packaging': '打包'
      },
      enumType: {
        'FILE_SIZE': '文件大小',
        'FILE_TYPE': '文件类型',
        'PACKAGE_TEMPLATE': '打包模板',
        'STORAGE_DURATION': '存入天数',
        'PREFIX': '文件/对象前缀'
      },
      packageTemplate: [
        'Hospital',
        'Sequence',
        'Batch'
      ],
      operator: [
        '=',
        '>=',
        '<=',
        '>',
        '<'
      ],
      flag: false,
      pageSize: 10,
      pageNum: 1,
      statusEnum: [
        { label: '未开始', value: 'STATUS_INIT' },
        { label: '执行中', value: 'STATUS_RUNNING' },
        { label: '挂起', value: 'STATUS_SUSPEND' },
        { label: '成功', value: 'STATUS_SUCCEED' },
        { label: '失败', value: 'STATUS_FAILED' }
      ],
      taskType: [
        { label: '物理删除', value: 'HardDelete' },
        { label: '生命周期删除', value: 'Lifecycle' }
      ],
      buckets: [],
      rules: {
        prefix: [
          {
            required: true,
            message: '请输入文件/对象前缀',
            trigger: ['blur', 'change']
          },
          {
            min: 1,
            trigger: ['blur', 'change'],
            max: 1024,
            message: '字符长度最大1024位'
          }
        ],
        policyName: {
          required: true,
          message: '请输入策略名称'
        },
        strategyName: {
          required: true,
          trigger: ['blur', 'change'],
          validator: (_, val, cb) => {
            if (!val) {
              return cb('请选择策略字典')
            } else {
              return cb()
            }
          }
        },
        type: { required: true, message: '' },
        expression: {
          trigger: ['blur', 'change'],
          required: true,
          message: '请输入运算符'
        },
        num: [{
          required: true,
          message: '请输入正整数',
          trigger: ['blur', 'change']
        }
        ],
        fileType: {
          required: true,
          message: '请输入文件类型',
          trigger: ['blur', 'change']
        },
        packageType: {
          required: true,
          message: '请选择打包模板',
          trigger: ['blur', 'change']
        }
      },
      listStrategyDictionary: [],
      form: {
        action: 'archiving',
        policyName: '',
        type: 'FILE_SIZE',
        expressions: [{
          strategyName: '',
          expression: ''
        }]
      },
      loading: false,
      popLoading: false,
      searchVal: '',
      total: 0,
      tableData: [],
      visiblePopover: false,
      userPage: 1,
      userPageSize: 10,
      userTotal: 0,
      columns: [
        {
          title: '策略名称',
          prop: 'policyName',
          minWidth: '150px',
          fixed: true
        },
        {
          slot: 'expressions'
        },
        {
          title: '创建时间',
          prop: 'createTime',
          minWidth: '150px'

        },
        {
          title: '更新时间',
          prop: 'updateTime',
          minWidth: '150px'
        },
        {
          slot: 'action'
        }
      ],
      opt: 'add'
    }
  },
  computed: {
    isAdd() {
      return this.opt === 'add'
    },
    renderAction() {
      return Object.keys(this.enumAction).reduce((pre, cur) => {
        pre.push({
          label: this.enumAction[cur],
          value: cur
        })
        return pre
      }, [])
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    resetConfig(index) {
      this.form.expressions[index].strategyName = ''
      this.form.expressions[index].type = ''
      this.form.expressions[index].num = ''
      this.form.expressions[index].expression = ''
      this.$refs['form'].validateField([`expressions.${index}.strategyName`])
    },
    deleteIcon(index) {
      this.form.expressions.splice(index, 1)
    },
    confirmSel(row, index) {
      const {
        type,
        strategyName,
        id
      } = row
      this.form.expressions[index].strategyName = strategyName
      this.form.expressions[index].id = id
      this.form.expressions[index].visiblePopover = false
      this.form.expressions[index].type = type
      this.$set(this.form.expressions[index], 'num', '')
      this.$refs['form'].validateField([`expressions.${index}.strategyName`])
      if (type === 'PACKAGE_TEMPLATE' || type === 'FILE_TYPE' || type === 'PREFIX') {
        this.form.expressions[index].expression = '='
        if (type === 'PACKAGE_TEMPLATE') {
          this.form.expressions[index].num = 'Hospital'
        }
      }
    },
    resetForm() {
      this.userPage = 1
      this.userPageSize = 10
      this.listStrategyDictionary = []
    },
    handleUserSize(size) {
      this.userPage = 1
      this.userPageSize = size
      this.getList()
    },
    handleUserPage(page) {
      this.userPage = page
      this.getList()
    },
    getList() {
      this.popLoading = true
      listStrategyDictionary({
        pageNum: this.userPage,
        pageSize: this.userPageSize
      }).then(res => {
        this.listStrategyDictionary = res.data.list
        this.userTotal = res.data.totalCount
      }).finally(() => {
        this.popLoading = false
      })
    },
    addExpress() {
      this.form.expressions.push({
        policyName: '',
        expression: '',
        visiblePopover: false
      })
    },
    deleteConfig(row) {
      this.$confirm(`删除策略表达式:<b style="color:#ff8746">${row.policyName}</b>?`, '请确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }).then(() => {
        deletePolicyExpression({
          id: row.id
        }).then(() => {
          this.$msg({
            type: 'success',
            text: this.$ts('response.success')
          })
          this.$refs['DataTable'].currentPage = 1
        }).finally(() => {
          this.init()
        })
      })
    },
    confirmCreate() {
      const {
        expressions,
        policyName,
        action
      } = this.form
      const data = {
        policyName,
        actionPolicy: {
          action
        },
        expressions: expressions.map(x => {
          return {
            id: x.id,
            strategyName: x.strategyName,
            num: x.num,
            expression: x.expression
          }
        })
      }
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.isAdd) {
            createPolicyExpression(data).then(() => {
              this.$msg({
                type: 'success',
                text: this.$ts('response.success')
              })
            })
              .finally(() => {
                this.flag = false
                this.$refs['DataTable'].currentPage = 1
                this.init()
              })
          } else {
            const data = {
              id: this.form.id,
              policyName: this.form.policyName,
              expressions: this.form.expressions,
              actionPolicy: {
                action: this.form.action
              }
            }
            updatePolicyExpression(data)
              .then(() => {
                this.$msg({
                  type: 'success',
                  text: this.$ts('response.success')
                })
              })
              .finally(() => {
                this.flag = false
                this.init()
              })
          }
        }
      })
    },
    getListStrategyDictionary() {
      return new Promise((resolve) => {
        listStrategyDictionary().then(res => {
        })
      })
    },

    modifyForm(row) {
      this.opt = 'edit'
      listStrategyDictionary({
        pageNum: this.userPage,
        pageSize: 1000
      }).then(res => {
        const array = res.data.list
        this.form = {
          id: row.id,
          policyName: row.policyName,
          action: row.actionPolicy.action,
          expressions: row.expressions.map(x => {
            return {
              id: x.id,
              strategyName: x.strategyName,
              num: x.num,
              type: array.find(t => t.id === x.id).type,
              visiblePopover: false,
              expression: x.expression
            }
          })
        }
      }).finally(() => {
        this.flag = true
      })
    },
    showCreate() {
      // await this.getListStrategyDictionary()
      this.opt = 'add'
      this.flag = true
      this.$nextTick(() => {
        this.$refs['form'].resetFields()
        this.form.policyName = ''
        this.form.action = 'archiving'
        this.form.expressions = [{
          strategyName: '',
          expression: '',
          visiblePopover: false
        }]
      })
    },
    refresh() {
      this.getTaskList({
        pageNum: this.pageNum,
        pageSize: this.pageSize
      })
    },
    init() {
      this.getTaskList({
        pageNum: 1,
        pageSize: this.pageSize
      })
    },
    getPageSearch(val) {
      this.pageNum = val.pageNumber
      this.pageSize = val.pageSize
      this.getTaskList({
        pageNum: val.pageNumber,
        pageSize: val.pageSize
      })
    },
    getTaskList(params) {
      this.loading = true
      listPolicyExpression(params).then(res => {
        this.tableData = res.data.list
        this.total = res.data.totalCount
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
:deep(.menu) {
  display: flex;
  justify-content: space-between;

  .right {
    position: relative;
    top: 9px;
    right: 20px;
  }
}

:deep(.el-form) {
  .addExpress {
    .byteInput .el-input__inner {
      padding-right: 48px;
    }

    .delBtn {
      cursor: pointer;
      color: #ff8746;
    }

    .el-col-8,
    .el-col-14,
    .el-col-6 {
      .el-form-item {
        display: flex;

        .el-form-item__content {
          width: 100%;
        }
      }
    }

    .el-form-item__label {
      width: 0 !important;
      margin-left: 0;
      padding-right: 10px;
    }

    .el-form-item__content {
      margin-left: 0px !important;
    }
  }
}

.el-tag {
  color: #e39606 !important;
  background-color: #384348;
  border-color: transparent;
  height: 22px;
  line-height: 20px;
  border-radius: 20px;
  margin-left: 5px;
  width: 75px;
  text-align: center;
}

.el-table {
  .rowExpress {
    span {
      margin-right: 10px;
    }
  }
}
</style>
<style lang="scss">
.el-pagination {
  .el-input__inner+.el-input__suffix {
    .el-input__suffix-inner {
      &+i {
        display: none;
      }
    }
  }
}
</style>
