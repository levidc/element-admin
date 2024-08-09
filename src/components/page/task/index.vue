<template>
  <div>
    <div
      class="page_content_wrap"
      @keyup.enter="searchParams()"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
        class="searchForm"
      >
        <div class="searchContent">
          <el-col :span="8">
            <el-form-item
              class="noLabel"
              prop="taskName"
            >
              <el-input
                v-model="form.taskName"
                placeholder="任务名称"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              class="noLabel"
              prop="taskType"
            >
              <el-select
                v-model="form.taskType"
                placeholder="归档资源类型"
                clearable
              >
                <el-option
                  v-for="item in userTaskType"
                  :key="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="6">
            <el-form-item
              class="noLabel"
              prop="sourceResourceId"
            >
              <el-select
                v-model="form.sourceResourceId"
                placeholder="源资源名称"
                filterable
                clearable
              >
                <el-option
                  v-for="{id,name} in filterSourceResourceNames"
                  :key="id"
                  :value="id"
                  :label="name"
                />
              </el-select>
            </el-form-item>
          </el-col> -->
          <el-col :span="8">
            <el-form-item
              class="noLabel"
              prop="sourceDetail"
            >
              <el-input
                v-model="form.sourceDetail"
                placeholder="归档目录/归档数据表"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              class="noLabel"
              prop="userName"
            >
              <el-input
                v-model="form.userName"
                placeholder="创建人"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              class="noLabel"
              prop="createStartTime"
            >
              <el-date-picker
                v-model="form.createStartTime"
                type="datetime"
                placeholder="任务创建时间"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              class="noLabel"
              prop="createEndTime"
            >
              <el-date-picker
                v-model="form.createEndTime"
                type="datetime"
                placeholder="任务完成时间"
              />
            </el-form-item>
          </el-col>
        </div>
        <div class="search">
          <el-button
            class="golden mr_10"
            type="primary"
            @click="createTask"
          >创建任务</el-button>
          <el-button
            class="mr_10"
            @click="reset"
          >重置</el-button>
          <el-button
            class="golden mr_10"
            type="primary"
            @click="searchParams"
          >查询</el-button>
          <SelectColumns
            :column-headers="columns"
            class="mr_10"
            @hideColumn="hideColumn"
          />
          <el-tooltip
            content="刷新"
            placement="top"
            effect="dark"
          >
            <i
              class="el-icon-refresh"
              @click="handleRefresh"
            />
          </el-tooltip>
        </div>
      </el-form>
      <TableData
        ref="tab"
        :table-data="tableData"
        :columns="columns"
        :selection="false"
        :loading="loading"
        :sort-function="sortFunction"
        :page-obj="{ currentPage: 1, pageSize: 10 }"
        :default-sort="{ prop: 'createTime', order: 'descending' }"
        :total="total"
        :max-height="tableHeight"
        pagination
        @renderPagination="renderPagination"
      >
        <el-table-column
          slot="taskName"
          prop="taskName"
          label="任务名称"
          sortable="custom"
          fixed="left"
          min-width="100px"
        >
          <template slot-scope="scope">
            <showToolTip :text="scope.row.taskName" />
          </template>
        </el-table-column>
        <el-table-column
          slot="sourceDetail"
          prop="sourceDetail"
          label="源资源路径"
          sortable="custom"
          min-width="300"
        >
          <template slot-scope="scope">
            <showToolTip :text="scope.row.sourceDetail" />
          </template>
        </el-table-column>
        <el-table-column
          slot="targetDetail"
          prop="targetDetail"
          label="目标资源路径"
          sortable="custom"
          min-width="150"
        >
          <template slot-scope="scope">
            <showToolTip :text="scope.row.targetDetail" />
          </template>
        </el-table-column>
        <el-table-column
          slot="taskProgress"
          label="任务进度"
          prop="taskProgress"
          width="120px"
        >
          <template slot-scope="scope">
            <span v-if="!scope.row.taskProgress" />
            <el-progress
              v-else
              :percentage="showProgress(scope.row)"
              :color="showProgreeColor(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          slot="status"
          prop="status"
          width="120px"
        >
          <template #header>

            <SelectStatus
              :fill-sel-status="fillSelStatus"
              :need-reset="resetFlag"
              :column-headers="filterStatus"
              class="mr_10"
              @clearFill="clearFill"
              @doRequest="searchTaskStatus"
              @handleChange="handleStatus"
            />
          </template>
          <!-- <template #header>
            <el-dropdown
              trigger="hover"
              :hide-on-click="false"
            >
              <span class="el-dropdown-link">
                <span>任务状态</span>
                <svg
                  class="icon"
                  aria-hidden="true"
                  :style="{'color':renderStatusColor,'cursor':'pointer'}"
                >
                  <use xlink:href="#icon-filter" />
                </svg>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <el-checkbox-group v-model="form.taskStatus">
                      <el-checkbox
                        v-for="item in filterStatus"
                        :key="item.value"
                        :label="item.value"
                      >
                        {{ item.text }}
                      </el-checkbox>
                    </el-checkbox-group>
                    <div class="flexMenu">
                      <el-button
                        type="text"
                        @click="searchTaskStatus(true)"
                      >重置</el-button>
                      <el-button
                        type="text"
                        @click="searchTaskStatus(false)"
                      >查询</el-button>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </span>
            </el-dropdown>
          </template> -->
          <template slot-scope="scope">
            {{ renderStatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column
          slot="remark"
          label="备注"
          prop="remark"
          min-width="120px"
        >
          <template slot-scope="scope">
            <el-tooltip
              :content="scope.row.remark"
              placement="top"
            >
              <span class="showOverFlown">
                {{ scope.row.remark }}
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          slot="action"
          :label="$ts('action')"
          fixed="right"
          width="100px"
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
                <!-- 添加下拉菜单禁用、需外层容器添加类名 -->
                <!-- cursorDisabled -->
                <div :class="[judgeDisableBtn(scope.row) ? 'cursorDisabled' : null]">
                  <el-dropdown-item
                    :disabled="judgeDisableBtn(scope.row)"
                    @click.native="doRetryTask(scope.row)"
                  >
                    重试任务
                  </el-dropdown-item>
                </div>
                <el-dropdown-item
                  v-if="scope.row.taskType==='ES'"
                  @click.native="doCloneTask(scope.row)"
                >
                  克隆任务
                </el-dropdown-item>
                <div :class="[scope.row.status !== 'SUCCESSFUL' ? 'cursorDisabled' : null]">
                  <el-dropdown-item
                    :disabled="scope.row.status !== 'SUCCESSFUL'"
                    @click.native="createMoveBackTask(scope.row)"
                  >
                    回迁任务
                  </el-dropdown-item>
                </div>
                <div :class="[scope.row.status !== 'FAILURE' ? 'cursorDisabled' : null]">
                  <el-dropdown-item
                    :disabled="scope.row.status !== 'FAILURE'"
                    @click.native="doDelete(scope.row)"
                  >
                    删除任务
                  </el-dropdown-item>
                </div>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </TableData>
    </div>
    <el-dialog
      :visible.sync="taskFlag"
      width="50%"
      title="创建归档任务"
    >
      <el-form
        ref="taskForm"
        :model="taskForm"
        :rules="rules"
        label-width="160px"
        class="taskForm"
      >
        <el-form-item
          label="任务名称"
          prop="taskName"
        >
          <el-input
            v-model="taskForm.taskName"
            placeholder="请输入任务名称"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="源资源名称"
          prop="sourceResourceId"
        >
          <!-- <el-select v-model="taskForm.sourceResourceId" clearable>
            <el-option v-for="item in taskForm.nasList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select> -->
          <el-select
            v-model="taskForm.sourceResourceId"
            placeholder="请选择"
            filterable
            @change="showSourceDetail"
          >
            <el-option-group
              v-for="group in taskForm.nasList"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <div v-if="taskForm.sourceResourceId">
          <el-form-item
            v-if="taskForm.isNas==='NAS'||taskForm.isNas==='HDFS'"
            label="源资源路径"
            prop="sourceDetail"
            clearable
          >
            <el-input
              v-model="taskForm.sourceDetail"
              :autosize="{ minRows: 2, maxRows: 4}"
              type="textarea"
              placeholder="请设置源资源路径"
              clearable
              @input="val=>taskForm.sourceDetail= val.replace(/[ \t]+/g, '').replace(/[\r\n]+/g, '\n')"
            />
          </el-form-item>
          <div
            v-else
            v-loading="loadingCreateTask"
          >
            <el-form-item
              :label="taskForm.isNas==='ES'?'备份索引':'数据库表'"
              prop="sourceDetailES"
              :rules="taskForm.isNas==='ES'?rules.sourceDetailES:rules.sourceDetailDataBase"
              clearable
            >
              <el-input
                v-model="taskForm.searchESIndex"
                placeholder="关键词过滤"
                clearable
              />
              <el-row>
                <el-checkbox
                  v-model="taskForm.selectAll"
                  @change="handleSelAll"
                >全选</el-checkbox>
              </el-row>
              <el-checkbox-group
                v-model="taskForm.sourceDetailES"
                class="overflownYES"
                @change="handelSelOne"
              >
                <el-checkbox
                  v-for="item in filterSearch"
                  :key="item"
                  :label="item"
                />
              </el-checkbox-group>
              <!-- <el-table :data="taskForm.backUpIndexList">
                <el-table-column >

                </el-table-column>
              </el-table> -->
              <!-- <el-input v-model="taskForm.sourceDetailES" placeholder="请设置源资源路径" clearable
                v-if="taskForm.storageType === 'ES'" /> -->
            </el-form-item>
            <el-form-item
              v-if="taskForm.isNas==='ES'"
              label="备份带宽"
              prop="backupBandwidth"
            >
              <el-input
                v-model="taskForm.backupBandwidth"
                placeholder="请输入备份带宽"
                @input="val => inputPositiveNum(val, 'taskForm', 'backupBandwidth')"
              >
                <template slot="append">MB</template>
              </el-input>
            </el-form-item>
          </div>
        </div>
        <el-form-item
          label="目标资源名称"
          prop="targetResourceId"
        >
          <el-select
            v-model="taskForm.targetResourceId"
            @change="renderTargetResouce"
          >
            <el-option
              v-for="item in taskForm.resourceList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标资源路径">
          <span>{{ taskForm.targetDetail }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          class="golden"
          @click="confirmCreate"
        >{{ $ts('true') }}</el-button>
        <el-button @click="cancelDoCreate">{{ $ts('wtstype.none') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="moveBackFlag"
      width="40%"
      title="创建回迁任务"
    >
      <el-form
        ref="moveBackForm"
        :model="moveBackForm"
        :rules="rules"
        label-width="160px"
        class="taskForm"
      >
        <el-form-item
          label="任务名称"
          prop="moveTaskName"
        >
          <el-input
            v-model="moveBackForm.moveTaskName"
            placeholder="请输入任务名称"
            clearable
          />
        </el-form-item>
        <el-form-item
          v-if="moveBackForm.isNas==='NAS'||moveBackForm.isNas==='HDFS'"
          label="源资源路径"
          prop="moveSourceDetail"
        >
          <el-input
            v-model="moveBackForm.moveSourceDetail"
            placeholder="请设置源资源路径"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="目标资源名称"
          prop="moveTargetResourceId"
        >
          <el-select
            v-model="moveBackForm.moveTargetResourceId"
            clearable
            filterable
            placeholder="请选择目标资源"
            @change="judgeMoveIsNas"
          >
            <el-option-group
              v-for="group in moveBackForm.nasList"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <div v-if="moveBackForm.moveTargetResourceId">
          <el-form-item
            v-if="moveBackForm.isNas==='NAS'||moveBackForm.isNas==='HDFS'"
            label="目标资源路径"
            prop="moveTargetDetail"
          >
            <el-input
              v-model="moveBackForm.moveTargetDetail"
              placeholder="请设置目标资源路径"
              clearable
            />
          </el-form-item>
          <div v-else>
            <el-form-item
              :label="moveBackForm.isNas==='ES'?'回迁索引':'数据库表'"
              prop="moveBackUpDetail"
            >
              <el-input
                v-model="moveBackForm.moveBackUpDetail"
                disabled
                placeholder="请输入回迁索引"
                clearable
              />
            </el-form-item>
            <el-form-item
              v-if="moveBackForm.isNas==='ES'"
              label="索引替换模式"
              prop="moveBackUpIndex"
            >
              <el-input
                v-model="moveBackForm.moveBackUpIndex"
                placeholder="如索引名已存在会覆盖原索引"
                clearable
              />
            </el-form-item>
            <el-form-item
              v-if="moveBackForm.isNas==='ES'"
              label="回迁带宽"
              prop="restoreBandwidth"
            >
              <el-input
                v-model="moveBackForm.restoreBandwidth"
                placeholder="请输入回迁带宽"
                clearable
                @input="val => inputPositiveNum(val, 'moveBackForm', 'restoreBandwidth')"
              >
                <template slot="append">MB</template>
              </el-input>
            </el-form-item>
          </div>
        </div>
      </el-form>
      <div slot="footer">
        <el-button
          class="golden"
          @click="doMoveBackTask"
        >{{ $ts('true') }}</el-button>
        <el-button @click="cancelMoveBack">{{ $ts('wtstype.none') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="confirmESFlag"
      width="40%"
      title="确认提交"
    >
      <p>
        {{ '是否选择如下'+( taskForm.isNas==='ES'?'备份索引':'数据库表')+'？' }}
      </p>
      <div class="esResourceLayOut">
        <p
          v-for="item in taskForm.sourceDetailES"
          :key="item"
        >
          {{ item }}
        </p>
      </div>
      <div slot="footer">
        <el-button
          class="golden"
          @click="doCreateTask"
        >{{ $ts('true') }}</el-button>
        <el-button @click="confirmESFlag = false">{{ $ts('cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="cloneFlag"
      width="30%"
      title="创建克隆任务"
    >
      <el-form
        ref="cloneForm"
        :model="cloneForm"
        label-width="120px"
        :rules="rules"
      >
        <el-form-item
          prop="taskName"
          label="任务名称"
        >
          <el-input
            v-model="cloneForm.taskName"
            placeholder="请输入任务名称"
            clearable
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          class="golden"
          @click="confirmClone"
        >{{ $ts('true') }}</el-button>
        <el-button @click="cancelClone">{{ $ts('wtstype.none') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { queryTasks, createTask, retryTask, createMoveBackTasks, listStorageResource, getEsIndices, cloneTask, getDatabaseTable, deleteTask } from '@/api/storage'
import moment from 'moment'
export default {
  data () {
    return {
      fillSelStatus: false,
      resetFlag: false,
      tableHeight: 500,
      userTaskType: {
        'NAS': 'NAS',
        'ES': 'ES',
        'HDFS': 'HDFS',
        'DATABASE': 'DATABASE'
      },
      cloneForm: {
        taskName: ''
      },
      cloneFlag: false,
      reqData: null,
      confirmESFlag: false,
      total: 0,
      timer: null,
      rules: {
        sourceDetail: { required: true, message: '请设置源资源路径' },
        targetResourceId: { required: true, message: '请设置目标资源' },
        taskName: { required: true, message: '请输入任务名称' },
        sourceResourceId: { required: true, message: '请设置源资源' },
        moveTargetResourceId: { required: true, message: '请选择目标资源' },
        moveTargetDetail: { required: true, message: '请设置目标资源路径' },
        moveSourceDetail: { required: true, message: '请设置源资源路径' },
        moveTaskName: { required: true, message: '请输入任务名称' },
        sourceDetailES: { required: true, message: '请选择备份索引' },
        sourceDetailDataBase: {
          required: true,
          message: '请选择数据库表'
        },
        backupBandwidth: [
          {
            required: true,
            message: '请输入备份带宽'
          },
          {
            validator: (_, val, cb) => {
              if (val > 500) {
                return cb('备份带宽最大支持500M')
              } else {
                return cb()
              }
            }
          }
        ], // 500MB、超出50添加确认提示、提示
        moveBackUpDetail: { required: true, message: '请输入回迁索引' },
        restoreBandwidth: [{ required: true, message: '请输入回迁带宽' }, {
          validator: (_, val, cb) => {
            if (val > 500) {
              return cb('回迁带宽最大支持500M')
            } else {
              return cb()
            }
          }
        }] // 500MB、超出50添加确认提示、提示
        // moveBackUpIndex: {
        //   trigger: ['change'], validator: (rule, val, cb) => {
        //     if (val.length > 2 && val.indexOf('$1') !== -1 || val.length == 0) return cb()
        //     else cb('索引替换模式需包含原索引名标识符：$1')
        //   }
        // }
      },
      taskForm: {
        nasList: [],
        resourceList: [],
        sourceDetail: '', // 源资源路径
        targetDetail: '', // 目标资源路径 bucketName
        targetResourceId: '', // 目标资源id s3
        sourceResourceId: '', // 源资源id
        taskName: '', // 任务名称,
        isNas: 'nas', // 判断源资源是nas还是es
        sourceDetailES: [], // 备份索引
        backUpIndexList: [], // 备份索引 list
        backupBandwidth: '',
        searchESIndex: '',
        selectAll: false
      },
      mapResourceName: {},
      taskFlag: false,
      moveBackFlag: false,
      moveBackForm: {
        nasList: [],
        moveSourceDetail: '',
        moveTargetDetail: '',
        moveTargetResourceId: '',
        archiveTaskId: '',
        restoreBandwidth: '',
        moveBackUpDetail: '',
        isNas: false,
        moveBackUpIndex: ''
      },
      form: {
        taskName: '',
        userName: '',
        createStartTime: '',
        createEndTime: '',
        sourceDetail: '',
        taskType: '',
        sourceResourceId: '',
        taskStatus: [
          'CREATED',
          'ALLOCATED',
          'PROCESSING',
          'SCANNING',
          'SUCCESSFUL',
          'FAILURE',
          'RETRY',
          'RETRYING',
          'ABORT'
        ],
        SourceResourceNames: [] // map searchName
      },
      sort: {
        prop: 'createTime',
        order: 'descending'
      },
      loadingCreateTask: false,
      loading: false,
      tableData: [],
      defaultColumns: [],
      filterStatus: [
        { title: '已创建', value: 'CREATED' },
        { title: '已分配', value: 'ALLOCATED' },
        { title: '执行中', value: 'PROCESSING' },
        { title: '扫描中', value: 'SCANNING' },
        { title: '任务完成', value: 'SUCCESSFUL' },
        { title: '任务失败', value: 'FAILURE' },
        { title: '任务重试', value: 'RETRY' },
        { title: '重试中', value: 'RETRYING' }
        // { title: '任务终止', value: 'ABORT', hide: true }
      ]
    }
  },
  computed: {
    columns: {
      get: function () {
        return [
          {
            slot: 'taskName',
            show: true,
            title: '任务名称'
          },
          {
            prop: 'createUserName',
            title: '创建人',
            minWidth: '120',
            show: true,
            sortable: 'custom'
          },
          {
            prop: 'sourceResourceId',
            title: '源资源名称',
            minWidth: '150',
            show: true,
            formatter: (__, _, val) => this.mapResourceName[val + '']
          },
          {
            slot: 'sourceDetail',
            show: true,
            title: '源资源路径'
          },
          {
            prop: 'targetResourceId',
            title: '目标资源名称',
            minWidth: '150',
            show: true,
            formatter: (__, _, val) => this.mapResourceName[val + '']
          },
          // {
          //   slot: 'targetDetail',
          //   show: true,
          //   title: '目标资源路径'
          // },
          {
            slot: 'taskProgress',
            title: '任务进度',
            show: true
          },
          {
            prop: 'dataCount',
            title: '任务文件数量',
            show: true,
            sortable: 'custom',
            align: 'center',
            width: '150',
            formatter: (__, _, val) => this.thousandthSeparator(val)
          },
          {
            prop: 'dataSize',
            title: '任务文件大小',
            show: true,
            // sortable: 'custom',
            align: 'center',
            width: '150',
            formatter: row => {
              return row.taskType === 'ES' ? row.dataCount ? this.byteConvert(row.dataSize) : '' : this.byteConvert(row.dataSize)
            }
          },
          {
            slot: 'status',
            title: '任务状态',
            show: true,
            width: '120',
            filters: [
              { text: '已创建', value: 'CREATED' },
              { text: '已分配', value: 'ALLOCATED' },
              { text: '执行中', value: 'PROCESSING' },
              { text: '任务完成', value: 'SUCCESSFUL' },
              { text: '任务失败', value: 'FAILURE' },
              { text: '重试中', value: 'RETRYING' }
            ],
            // disabled: true,
            formatter: (__, _, data) => {
              switch (data) {
                case 'CREATED':
                  return '已创建'
                case 'ALLOCATED':
                  return '已分配'
                case 'PROCESSING':
                  return '执行中'
                case 'SUCCESSFUL':
                  return '任务完成'
                case 'FAILURE':
                  return '任务失败'
                case 'SCANNING':
                  return '扫描中'
                case 'ABORT':
                  return '任务终止'
                case 'RETRY':
                  return '任务重试'
                case 'RETRYING':
                  return '重试中'
                default:
                  return ''
              }
            }
          },
          {
            slot: 'remark',
            show: true,
            title: '备注'
          },
          {
            prop: 'createTime',
            title: '任务创建时间',
            show: true,
            formatter: (_row, _, data) => {
              return moment(data).format('YYYY/MM/DD HH:mm:ss')
            },
            minWidth: '150px',
            sortable: 'custom'
          },
          {
            prop: 'finishTime',
            title: '任务完成时间',
            show: true,
            formatter: (_row, _, data) => {
              return data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : ''
            },
            minWidth: '150px',
            sortable: 'custom'
          },
          { slot: 'action', width: 200, show: true, title: '操作' }
        ]
      },
      set: function (val) {
        // 绑定 过滤任务状态 禁用状态列隐藏
        this.defaultColumns = val
        return this.defaultColumns
      }
    },
    // disabledStatus () {
    //   return !!this.form.taskStatus.length
    // },
    filterSourceResourceNames () {
      const obj = {}
      return this.form.SourceResourceNames.reduce((pre, cur) => {
        if (!obj[cur.id]) {
          obj[cur.id] = true
          pre.push(cur)
        }
        return pre
      }, [])
    },
    watchForm () {
      return JSON.stringify(this.form)
    },
    accessResource () {
      return this.taskForm.nasList.reduce((pre, cur) => [...pre, ...cur.options], [])
    },
    filterSearch () {
      if (this.taskForm.isNas !== 'DATABASE') {
        return this.taskForm.backUpIndexList.filter(x => x.toLocaleLowerCase().indexOf(this.taskForm.searchESIndex.toLocaleLowerCase()) > -1)
      } else {
        return this.taskForm.backUpIndexList.filter(x => x.toLocaleLowerCase().indexOf(this.taskForm.searchESIndex.toLocaleLowerCase()) == 0)
      }
    }
  },
  watch: {
    watchForm: {
      handler (val) {
        // console.log(val, '123')
        clearTimeout(this.timer)
        this.timer = null
        // console.log(this.timer)
      }
    },
    'taskForm.searchESIndex' (val) {
      // 触发过滤保持过滤后的数据和之前选中的数据处于后者包含前者即可保持全选状态
      if (this.filterSearch && this.filterSearch.length) {
        this.taskForm.selectAll = this.filterSearch.every(item => {
          return this.taskForm.sourceDetailES.includes(item)
        })
      } else {
        this.taskForm.selectAll = false
      }
    },
    // 触发 清除定时器/ 恢复定时器、
    taskFlag (val) {
      if (val) {
        clearTimeout(this.timer)
      }
    },
    moveBackFlag (val) {
      if (val) {
        clearTimeout(this.timer)
      }
    },
    cloneFlag (val) {
      if (val) {
        clearTimeout(this.timer)
      }
    }
    // tableData (val) {
    //   $('.el-progress-bar__inner').hide(200).show(200)
    // }
  },
  mounted () {
    // this.init({ params: { pageNumber: 1, pageSize: 10 } }, true)
    sessionStorage.setItem('fillSelStatus', JSON.stringify([
      'CREATED',
      'ALLOCATED',
      'PROCESSING',
      'SCANNING',
      'SUCCESSFUL',
      'FAILURE',
      'RETRY',
      'RETRYING'
    ]))
    this.$nextTick(() => {
      this.handleSearchParams(false, true)
      this.getHeight()
    })
  },
  created () {
    window.addEventListener('resize', this.getHeight)
  },
  destroyed () {
    clearTimeout(this.timer)
  },
  methods: {
    handleStatus (status) {
      this.form.taskStatus = [...status].concat('ABORT')
      sessionStorage.setItem('fillSelStatus', JSON.stringify([...status]))
    },
    renderStatus (status) {
      switch (status) {
        case 'CREATED':
          return '已创建'
        case 'ALLOCATED':
          return '已分配'
        case 'PROCESSING':
          return '执行中'
        case 'SUCCESSFUL':
          return '任务完成'
        case 'FAILURE':
          return '任务失败'
        case 'SCANNING':
          return '扫描中'
        case 'ABORT':
          return '任务终止'
        case 'RETRY':
          return '任务重试'
        case 'RETRYING':
          return '重试中'
        default:
          return ''
      }
    },
    searchTaskStatus (data) {
      this.form.taskStatus = [...data].concat('ABORT')
      this.searchParams()
      // 默认全选
    },
    filterChange (val) {
      const { taskStatus = [] } = val
      Object.assign(this.form, { taskStatus })
      const { pageSize } = this.$refs['tab']
      this.$refs['tab'].currentPage = 1
      this.handleSearchParams(
        { pageSize, pageNumber: 1 }, true
      )
    },
    cancelMoveBack () {
      this.moveBackFlag = false
      this.handleSearchParams(false, true)
    },
    cancelDoCreate () {
      this.taskFlag = false
      this.handleSearchParams(false, true)
    },
    cancelClone () {
      this.cloneFlag = false
      this.handleSearchParams(false, true)
    },
    getHeight () {
      this.$nextTick(() => {
        const height = window.innerHeight - 400
        this.tableHeight = height > 200 ? height : 200
      })
    },
    clearFill () {
      this.fillSelStatus = false
    },
    hideColumn (columns) {
      this.defaultColumns = columns
      // false、读取
      if (!this.fillSelStatus) {
        this.fillSelStatus = !columns.find(x => x.slot == 'status').show
      }
      // if (this.fillSelStatus) {
      //   setTimeout(() => {
      //     this.fillSelStatus = false
      //   }, 1000)
      // }
      // console.log(this.defaultColumns, '1233')
      this.$nextTick(() => {
        this.$refs['tab'].$refs['dataTable'] && this.$refs['tab'].$refs['dataTable'].doLayout()
      })
    },
    doDelete (row) {
      const { id, taskName } = row
      this.$confirm(`删除如下任务：<b style="color:#ff8736">${taskName}</b>，请确认！`, '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true
      }).then(() => {
        deleteTask({ taskId: id }).then(() => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
        }).finally(() => {
          this.handleSearchParams(false, true)
        })
      })
    },
    judgeDisableBtn (row) {
      // case 状态部位FAILURE、
      // 归档 快照任务执行失败
      if (row.status !== 'FAILURE') {
        return true
      } else if (row.taskType === 'ES') {
        return row.remark === '快照任务执行失败'
      } else {
        return false
      }
    },
    handleSelAll (val) {
      // 有过滤条件、全选按钮反选后 之前的数据需要过滤掉当前反选的
      if (val) {
        if (this.taskForm.searchESIndex) {
          this.taskForm.sourceDetailES = [...new Set(this.taskForm.sourceDetailES.concat(this.filterSearch))]
        } else {
          this.taskForm.sourceDetailES = this.filterSearch
        }
      } else {
        if (this.taskForm.searchESIndex) {
          this.taskForm.sourceDetailES = this.taskForm.sourceDetailES.filter(item => {
            return this.filterSearch.every(x => item !== x)
          })
        } else {
          this.taskForm.sourceDetailES = []
        }
      }
    },
    handelSelOne (val) {
      if (this.taskForm.searchESIndex) {
        // 有搜索、判断当前选中的值是否全部包含过滤后的选项
        this.taskForm.selectAll = this.filterSearch.every(item => {
          return val.includes(item)
        })
      } else {
        this.taskForm.selectAll = val.length === this.filterSearch.length
      }
    },
    instanceValidate (val) {
      if (val.length == 0) {
        this.$nextTick(() => {
          this.$refs['moveBackForm'].clearValidate(['moveBackUpIndex'])
        })
      }
    },
    inputPositiveNum (ipt, form, value) {
      this.$set(this[form], value, ipt.replace(/(^0+)|\D/g, ''))
    },
    showSourceDetail (val) {
      // 匹配是否nas、大数据同nas
      // 选择资源为nas、大数据时候、展示input源资源路径
      // 反之展示es及数据库资源选择备份索引
      const res = this.accessResource.find(x => {
        return String(x.value) === String(val)
      })
      this.taskForm.isNas = res && res.type
      // es资源获取es索引
      if (this.taskForm.isNas === 'ES') {
        this.loadingCreateTask = true
        this.taskForm.sourceDetailES = []
        this.taskForm.selectAll = false

        getEsIndices({
          resourceId: val
        }).then((res) => {
          this.taskForm.backUpIndexList = res.data || []
        }).catch(err => {
          this.taskForm.backUpIndexList = []
        })
          .finally(() => {
            this.loadingCreateTask = false
          })
      } else if (this.taskForm.isNas === 'DATABASE') {
        this.loadingCreateTask = true
        this.taskForm.sourceDetailES = []
        this.taskForm.selectAll = false

        getDatabaseTable({
          resourceId: val
        }).then((res) => {
          this.taskForm.backUpIndexList = res.data || []
        }).catch(err => {
          this.taskForm.backUpIndexList = []
        })
          .finally(() => {
            this.loadingCreateTask = false
          })
      }
    },
    showProgreeColor (row) {
      switch (row.status) {
        case 'PROCESSING':
          return '#517beb'
        case 'FAILURE':
          return '#c23f3f'
        case 'ABORT':
          return '#c23f3f'
        case 'SUCCESSFUL':
          return '#FF8746'
      }
    },
    showProgress (row) {
      return parseInt(((row.taskProgress / row.dataCount) * 100))
    },
    handleSearchParams (customPage, loading = false) {
      const { pageSize, currentPage } = this.$refs['tab']
      const { userName, createStartTime, createEndTime, taskName, sourceDetail, taskType, taskStatus } = this.form
      const data = {
        userName,
        createStartTime, createEndTime,
        order: this.sort.order === 'descending' ? 'DESC' : 'ASC',
        orderColumn: this.sort.prop,
        taskName,
        taskType: taskType || null,
        sourceDetail,
        // sourceResourceId, // 源资源名称 id,
        taskStatus
      }
      this.init({
        params: {
          ...customPage || {
            pageSize, pageNumber: currentPage
          }
        },
        data
      }, loading)
    },
    renderPagination (val) {
      this.handleSearchParams(val, true)
    },
    sortFunction (val) {
      const { prop, order } = val
      Object.assign(
        this.sort, { prop, order }
      )
      this.handleSearchParams(false, true)
    },
    renderTargetResouce () {
      const flag = this.taskForm.resourceList.filter(item => {
        return this.taskForm.targetResourceId === item.value
      })
      this.taskForm.targetDetail = flag && flag[0].bucketName
    },
    async createTask () {
      const res = await listStorageResource({
        deviceId: '66666666666666666'
      })
      if (res) {
        Object.assign(this.taskForm,
          {
            resourceList: [],
            nasList: [],
            sourceDetail: '',
            targetDetail: '',
            targetResourceId: '',
            sourceResourceId: '',
            taskName: '',
            sourceDetailES: [],
            backupBandwidth: '',
            searchESIndex: '',
            selectAll: false
          }
        )
        this.taskForm.nasList = [
          { label: 'NAS资源', options: [] },
          { label: 'ES资源', options: [] },
          { label: '大数据资源', options: [] },
          { label: '数据库资源', options: [] }
        ]
        res.data.forEach(item => {
          // !== 'NAS' && item.storageType !== 'ES'
          if (item.storageType === 'S3') {
            this.taskForm.resourceList.push({
              label: item.storageName,
              value: item.resourceId,
              bucketName: item.bucketName
            })
          } else {
            if (item.storageType === 'NAS') {
              this.taskForm.nasList[0].options.push({
                label: item.storageName,
                value: item.resourceId,
                bucketName: item.bucketName,
                type: item.storageType
              })
            } else if (item.storageType === 'ES') {
              this.taskForm.nasList[1].options.push({
                label: item.storageName,
                value: item.resourceId,
                bucketName: item.bucketName,
                type: item.storageType
              })
            } else if (item.storageType === 'HDFS') {
              this.taskForm.nasList[2].options.push({
                label: item.storageName,
                value: item.resourceId,
                bucketName: item.bucketName,
                type: item.storageType
              })
            } else {
              this.taskForm.nasList[3].options.push({
                label: item.storageName,
                value: item.resourceId,
                bucketName: item.bucketName,
                type: item.storageType
              })
            }
          }
        })
        this.taskFlag = true
        this.$nextTick(() => {
          this.$refs['taskForm'] && this.$refs['taskForm'].clearValidate()
        })
      }
    },
    doCloneTask (row) {
      this.cloneForm.taskName = ''
      this.cloneForm.sourceResourceId = row.sourceResourceId
      this.cloneForm.targetResourceId = row.targetResourceId
      this.cloneForm.sourceDetail = row.sourceDetail
      this.cloneForm.id = row.id
      this.cloneFlag = true
    },
    confirmClone () {
      this.$refs['cloneForm'].validate((valid) => {
        if (valid) {
          const {
            id,
            taskName,
            sourceResourceId,
            targetResourceId,
            sourceDetail
          } = this.cloneForm
          cloneTask({
            taskName,
            id,
            sourceResourceId,
            targetResourceId,
            sourceDetail
          }).then(() => {
            this.$ts({
              type: 'success',
              text: '操作成功'
            })
            this.cloneFlag = false
          }).finally(() => {
            this.handleSearchParams(false, true)
          })
        }
      })
    },
    confirmCreate () {
      this.$refs['taskForm'].validate((valid) => {
        if (valid) {
          this.reqData = null
          const {
            sourceDetail,
            sourceResourceId,
            targetDetail,
            targetResourceId,
            taskName,
            isNas,
            backupBandwidth,
            sourceDetailES
          } = this.taskForm
          // console.log(this.taskForm,'taskForm');
          const data = {
          }
          if (isNas === 'NAS' || isNas === 'HDFS') {
            Object.assign(data, {
              sourceDetail: sourceDetail.split('\n').join(','),
              sourceResourceId,
              targetDetail,
              targetResourceId,
              taskName,
              taskType: isNas
            })
          } else {
            Object.assign(data, {
              sourceDetail: sourceDetailES.join(','),
              sourceResourceId,
              targetDetail,
              targetResourceId,
              taskName,
              backupBandwidth: isNas === 'ES' ? backupBandwidth : 0,
              taskType: isNas
            })
          }
          this.reqData = data
          if (isNas === 'ES') { // ES
            if (backupBandwidth > 50) {
              this.$confirm('当前备份带宽超出<strong style="color:#d3d6d8">50MB</strong>将会影响相关业务性能，请确认', '提示', {
                distinguishCancelAndClose: true,
                dangerouslyUseHTMLString: true,
                confirmButtonText: '确定',
                cancelButtonText: '取消'
              }).then((res) => {
                this.confirmESFlag = true
              })
            } else {
              this.confirmESFlag = true
            }
          } else if (isNas === 'DATABASE') {
            this.confirmESFlag = true
          } else {
            this.doCreateTask()
          }
        }
      })
    },
    doCreateTask () {
      this.confirmESFlag = false
      createTask(this.reqData).then((res) => {
        this.$ts({
          type: 'success',
          text: '操作成功'
        })
        this.taskFlag = false
      }).finally(() => {
        this.handleSearchParams(false, true)
      })
    },
    reset () {
      this.$refs['form'].resetFields()
      this.form.taskStatus = [
        'CREATED',
        'ALLOCATED',
        'PROCESSING',
        'SCANNING',
        'SUCCESSFUL',
        'FAILURE',
        'RETRY',
        'RETRYING',
        'ABORT'
      ]
      sessionStorage.setItem('fillSelStatus', JSON.stringify([
        'CREATED',
        'ALLOCATED',
        'PROCESSING',
        'SCANNING',
        'SUCCESSFUL',
        'FAILURE',
        'RETRY',
        'RETRYING'
      ]))
      this.resetFlag = true
      setTimeout(() => {
        this.resetFlag = false
      }, 500)
      // 重置分页数为1
      this.$refs['tab'].currentPage = 1
      this.$refs['tab'].$refs['dataTable'].sort('createTime', 'descending')
      // 操作排序 重置
      // this.init(
      //   {
      //     params: { pageSize, pageNumber: 1 },
      //     data: {
      //       order: 'DESC',
      //       orderColumn: 'createTime'
      //     }
      //   }, true)
    },
    handleRefresh () {
      if (this.form.taskStatus.length === 1) {
        this.$message.error('请至少选择一项任务状态')
        return
      }
      this.handleSearchParams(false, true)
    },
    searchParams () {
      if (this.form.taskStatus.length === 1) {
        this.$message.error('请至少选择一项任务状态')
        return
      }
      const { pageSize } = this.$refs['tab']
      this.$refs['tab'].currentPage = 1
      this.handleSearchParams(
        { pageSize, pageNumber: 1 }, true
      )
    },
    init (data = {}, flag = false) {
      // this.loading = false
      // this.tableData = [
      // {
      //   "createTime": "2023-05-16T06:50:13.430Z",
      //   "createUserName": "string",
      //   "finishTime": "2023-05-16T06:50:13.430Z",
      //   "id": 0,
      //   "sourceDetail": "string",
      //   "sourceResourceId": 0,
      //   "status": "ABORT",
      //   "targetDetail": "string",
      //   "targetResourceId": 0,
      //   "taskProgress": 0,
      //   "updateTime": "2023-05-16T06:50:13.430Z"
      //  }
      // ]
      clearTimeout(this.timer)
      if (flag) {
        this.loading = true
      }
      const queryTask = queryTasks(data)
      const resourceName = listStorageResource({
        deviceId: '66666666666666666'
      })
      Promise.allSettled([queryTask, resourceName]).then((all) => {
        const res = all[0].value
        if (res) {
          this.tableData = res.data.list || []
          this.total = res.data.total
        }
        const mapResourceName = all[1].value
        if (mapResourceName) {
          this.form.SourceResourceNames = []
          mapResourceName.data.forEach(item => {
            this.mapResourceName[item.resourceId + ''] = item.storageName
            this.form.SourceResourceNames.push({ id: item.resourceId + '', name: item.storageName })
          })
        }
      })
        .finally(() => {
          this.loading = false
          this.timer = setTimeout(() => {
            this.handleSearchParams(false)
          }, 5000)
        })
      // const cc =
      //   () => {
      //     const p = new Promise(res => {
      //       for (let i = 1; i <= 200; i++) {
      //         (
      //           setTimeout(() => {
      //             // console.log(i, this.tableData[0].taskProgress = i * .5)
      //             if (i == 200) {
      //               res(true)
      //             }
      //           }, i * 1000)
      //         )
      //       }
      //     })
      //     return p
      //   }
      // const cb = () => {
      //   cc().then(() => cb())
      // }
      // cb()
    },
    doRetryTask (row) {
      const taskId = row.id
      this.$confirm('是否重试当前已失败的任务', `任务名:${row.taskName}`, {
        distinguishCancelAndClose: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then((res) => {
        retryTask({
          taskId
        }).then(() => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
          this.moveBackFlag = false
        }).finally(() => {
          this.handleSearchParams(false, true)
        })
      })
    },
    judgeMoveIsNas (val) {
      const flag = this.moveBackForm.allresource.find(x => {
        return String(x.value) === String(val)
      })
      this.moveBackForm.isNas = flag && flag.type || ''
    },
    async createMoveBackTask (row) {
      const res = await listStorageResource({
        deviceId: '66666666666666666'
      })
      if (res) {
        // 添加分组
        // 匹配资源类型此处过滤
        const allresource = res.data.map(x => {
          return {
            label: x.storageName,
            value: String(x.resourceId),
            bucketName: x.bucketName,
            type: x.storageType
          }
        })
        const typeFlag = res.data.find(x => String(x.resourceId) === String(row.sourceResourceId))
        const isNas = typeFlag && typeFlag.storageType
        const nasList = [
          { label: 'NAS资源', options: [], type: 'NAS' },
          { label: 'ES资源', options: [], type: 'ES' },
          { label: '大数据资源', options: [], type: 'HDFS' },
          { label: '数据库资源', options: [], type: 'DATABASE' }
        ].filter(x => x.type === isNas)
        allresource.forEach(x => {
          if (x.type === isNas) {
            nasList[0].options.push(x)
          }
        })
        // console.log(nasList, row.sourceResourceId, '222')
        // const nasList = res.data.filter(item => item.storageType == 'NAS' || item.storageType == 'ES').map(item => {
        //   return {
        //     label: item.storageName,
        //     value: String(item.resourceId),
        //     bucketName: item.bucketName
        //   }
        // })
        // console.log(nasList, 'nasList')

        let moveTargetDetail = ''
        // disable ES moveBack
        if (isNas === 'NAS' || isNas === 'HDFS') {
          moveTargetDetail = isNas === 'NAS' ? nasList[0].options.find(x => String(x.value) === String(row.sourceResourceId))?.bucketName || '' : nasList[0].options.find(x => String(x.value) === String(row.sourceResourceId))?.bucketName || ''
        }
        this.moveBackFlag = true
        this.$nextTick(() => {
          Object.assign(
            this.moveBackForm,
            {
              isNas,
              moveBackUpDetail: row.sourceDetail,
              restoreBandwidth: '50',
              moveTargetDetail,
              moveSourceDetail: row.sourceDetail,
              moveTargetResourceId: '',
              archiveTaskId: row.id,
              allresource,
              nasList,
              moveBackUpIndex: ''
            })
          this.$set(this.moveBackForm, 'moveTaskName', '')
          setTimeout(() => {
            this.$refs['moveBackForm'].clearValidate()
          }, 50)
        })
      }
    },
    doMoveBackTask () {
      this.$refs['moveBackForm'].validate((valid) => {
        if (valid) {
          // console.log(this.moveBackForm, 'moveBackForm')
          const {
            isNas,
            moveSourceDetail,
            moveTargetDetail,
            moveTaskName,
            archiveTaskId,
            restoreBandwidth,
            moveTargetResourceId,
            moveBackUpIndex,
            moveBackUpDetail } = this.moveBackForm
          const data = {}
          if (isNas === 'NAS' || isNas === 'HDFS') {
            Object.assign(data, {
              sourceDetail: moveSourceDetail,
              targetDetail: moveTargetDetail,
              targetResourceId: moveTargetResourceId,
              taskName: moveTaskName,
              archiveTaskId
            })
          } else {
            Object.assign(data, {
              // sourceDetail: moveSourceDetail,
              // moveBackUpDetail 填充回迁索引
              targetDetail: isNas === 'ES' ? moveBackUpIndex || moveBackUpDetail : moveBackUpDetail,
              sourceDetail: moveBackUpDetail,
              targetResourceId: moveTargetResourceId,
              taskName: moveTaskName,
              archiveTaskId,
              restoreBandwidth: isNas === 'ES' ? restoreBandwidth : 0
            })
          }
          if (isNas === 'ES' && restoreBandwidth > 50) {
            this.$confirm('当前回迁带宽超出<strong style="color:#d3d6d8">50MB</strong>将会影响相关业务性能，请确认！', '提示', {
              distinguishCancelAndClose: true,
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }).then((res) => {
              createMoveBackTasks(data).then(() => {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                this.moveBackFlag = false
              }).finally(() => {
                this.handleSearchParams(false, true)
              })
            })
          } else {
            createMoveBackTasks(data).then(() => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.moveBackFlag = false
            }).finally(() => {
              this.handleSearchParams(false, true)
            })
          }
        }
      })
    }
  }
}

</script>
<style lang="scss" scoped>
:v-deep .el-table {
  .el-table__body {
    height: 100%;
  }
}
.esResourceLayOut {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 1px;
  max-height: 300px;
  overflow-y: scroll;
  p {
    width: 30%;
    margin: 5px 0;
  }
}
::v-deep .searchForm {
  display: flex;
  justify-content: space-between;
  .searchContent {
    .el-form-item__content {
      margin-right: 20px;
    }
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    margin-right: 8%;
  }
  .search {
    width: 340px;
    .el-button {
      position: relative;
      top: 5px;
    }

    .el-icon-refresh {
      position: relative;
      top: 10px;
    }
  }

  .noLabel .el-form-item__content {
    margin-left: 0 !important;
  }

  .el-select {
    width: 100%;
  }

  .el-date-editor.el-input {
    width: 100%;
  }
}

::v-deep .taskForm {
  label.el-form-item__label {
    margin-left: 0;
  }

  .el-select {
    width: 100%;
  }
}

::v-deep .overflownYES {
  margin: 0px 0 20px;
  max-height: 300px;
  overflow-y: scroll;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  label {
    width: 40%;
    margin-right: unset !important;
  }

  span.el-checkbox__label {
    white-space: pre-wrap;
  }
}
</style>
<style lang="scss">
.selectStatus {
  .selStatus {
    width: 120px;
  }
}
.el-dropdown-menu {
  .el-dropdown-menu__item {
    .el-checkbox-group {
      width: 120px;
      label {
        position: relative;
        top: -10px;
      }
    }
  }
}
</style>
