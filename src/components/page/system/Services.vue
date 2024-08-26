<template>
  <div>
    <div class="page_content_wrap">
      <div v-show="changeTab">
        <div id="services_search" class="mb_15">
          <el-button v-access="'admin:StartInstanceController'" type="primary" class="blue" :disabled="startInstance" @click="startEvent">{{ $ts("service.start") }}</el-button>
          <el-button v-access="'admin:StopInstanceController'" type="primary" class="blue" :disabled="stopInstance" @click="stopEvent">{{ $ts("service.stop") }}</el-button>
          <el-button v-access="'admin:KillInstanceController'" type="danger" class="red" :disabled="deleteInstance" @click="deleteEvent">{{ $ts("service.remove") }}</el-button>
          <el-button v-if="false" @click="changeTab=!changeTab">群组配置</el-button>
          <el-tooltip content="刷新" placement="top" effect="dark">
            <i style="position:relative;top:1px" class="right el-icon-refresh" @click="listInstance" />
          </el-tooltip>
          <el-button
            class="right tab_search_btn"
            type="primary"
            plain
            icon="fa fa-search"
            @click="changeStatus"
          />
          <el-input
            v-model="searchVal"
            class="search_style right"
            :placeholder="$ts('enter.service.name')"
            width="14"
            clearable
          />
          <el-select v-model="serviceStatus" filterable class="search_style right" clearable width="14" :placeholder="$ts('status.choose')">
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >{{ item.label }}
            </el-option>
          </el-select>
        </div>
        <el-table
          ref="tableData"
          v-loading="loadingFlag"
          :data="tableSlice"
          border
          stripe
          style="width: 100%;margin-top:10px"
          @selection-change="selectFun"
          @sort-change="sortFunction"
        >
          <el-table-column v-if="checkBox" align="center" type="selection" width="55" />
          <el-table-column :label="$ts('service.name')" sortable="custom" prop="instanceName">
            <template slot-scope="scope">
              <span class="blue">{{ scope.row.instanceName }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$ts('status')" sortable="custom" prop="status">
            <template slot-scope="scope">
              <span v-if="scope.row.status=='OK'" class="status_green">{{ $ts("status.ok") }}</span>
              <span v-if="scope.row.status=='SUSPEND'" class="status_blue">{{ $ts("status.suspend") }}</span>
              <span v-if="scope.row.status=='INC'" class="status_red">{{ $ts("status.stop") }}</span>
              <span v-if="scope.row.status=='FAILED'" class="status_red">{{ $ts("status.failed") }}</span>
              <span v-if="scope.row.status=='FORGOTTEN'" class="status_orange">{{ $ts("status.forgotten") }}</span>
              <span v-if="scope.row.status=='UNKNOWN'" class="status_orange">{{ $ts("status.unknown") }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column :label="$ts('group.id')" sortable="custom" prop="groupId">
				</el-table-column> -->
          <el-table-column :label="$ts('host.ip')" sortable="custom" prop="host" />
          <el-table-column :label="$ts('port')" sortable="custom" prop="port" />
          <!-- <el-table-column :label="$ts('action')">
            <template slot-scope="scope">
              <el-dropdown size="small">
                <el-button type="primary" class="blue">
                  {{ $ts('action') }}<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="visibleD = true">{{ '修改' }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column> -->
        </el-table>
        <div
          v-show="totalDetail"
          class="page_block"
        >
          <el-pagination
            :current-page="currentPageDetail"
            :page-size="pagesizeDetail"
            :page-sizes="pagesizesDetail"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalDetail"
            @size-change="handleSizeChangeDetail"
            @current-change="handleCurrentChangeDetail"
          />
        </div>
      </div>
      <div v-show="!changeTab">
        <div
          id="services_search"
          class="mb_15"
        >
          <el-button
            type="primary"
            class="blue"
            @click="addGroup = true"
          >创建群组</el-button>
          <!-- <el-button type="primary" class="blue" @click="visibleD = true">分配instance</el-button> -->
          <el-tooltip
            content="刷新"
            placement="top"
            effect="dark"
          >
            <i
              style="position:relative;top:1px"
              class="right el-icon-refresh"
              @click="listInstanceGroup"
            />
          </el-tooltip>
          <el-tooltip
            content="返回"
            placement="top"
            effect="dark"
          >
            <svg
              class="right icon backicon"
              aria-hidden="true"
              @click="changeTab=true"
            >
              <use xlink:href="#icon-fanhui" />
            </svg>
          </el-tooltip>
        </div>
        <!-- <el-table
          :data="tableGroup"
        >
          <el-table-column label="组名" sortable="custom" prop="groupName" />
          <el-table-column label="描述" prop="description" />
        </el-table> -->
        <TableData
          :loading="loading"
          :table-data="tableGroup"
          :page-obj="pageObj"
          :columns="tableColumns"
          :sort-function="sortFunction"
        >
          <el-table-column
            slot="groupName"
            sortable="custom"
            prop="groupName"
            label="组名"
          >
            <template slot-scope="scope">
              <span class="blue">{{ scope.row.groupName }}</span>
            </template>
          </el-table-column>
          <el-table-column slot="action" :label="$ts('action')">
            <template slot-scope="scope">
              <el-dropdown size="small">
                <el-button type="primary" class="blue">
                  {{ $ts('action') }}<i class="el-icon-arrow-down el-icon--right" />
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="visibleD = true; selectGroup = scope.row">{{ '分配服务' }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </TableData>
      </div>
    </div>

    <el-dialog
      title="创建group"
      width="40%"
      :visible.sync="addGroup"
      @open="dialogOpen('form')"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
        :rules="rules"
      >
        <el-row>
          <el-form-item
            label="组名"
            prop="groupName"
          >
            <el-input v-model="form.groupName" />
          </el-form-item>
          <el-form-item
            label="描述"
            prop="description"
          >
            <el-input
              v-model="form.description"
              type="textarea"
            />
          </el-form-item>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button class="golden" @click="createGroup">{{ $ts('button.confirm') }}</el-button>
        <el-button @click="addGroup = false">{{ $ts('button.cancel') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="分配服务"
      width="65%"
      :visible.sync="visibleD"
    >
      <div
        v-loading="loading"
        class="itxst"
      >
        <div class="col">
          <div class="title">服务名称</div>
          <draggable
            v-model="draggableInstance"
            :group="groupA"
            animation="300"
            drag-class="dragClass"
            ghost-class="ghostClass"
            chosen-class="chosenClass"
            :force-fallback="true"
          >
            <transition-group :style="style">
              <div
                v-for="(item,index) in draggableInstance"
                :key="item.instanceId"
                class="item"
              >
                <el-tooltip
                  placement="top"
                  style="width:100%"
                  :content="'主机ip:' + item.host + '' + '端口' + item.port"
                >
                  <div>
                    <span>
                      {{ item.instanceName }}
                    </span>
                    <i
                      class="fa el-icon-plus"
                      @click="addTo(index)"
                    />
                  </div>
                </el-tooltip>
              </div>
            </transition-group>
          </draggable>
        </div>
        <svg
          class="icon backicon left draggableArrow"
          aria-hidden="true"
        >
          <use xlink:href="#icon-youjiantou" />
        </svg>
        <div class="col">
          <div class="title">当前群组:{{ selectGroup.groupName }}</div>
          <draggable
            v-model="draggableGroup"
            group="instance"
            animation="100"
            drag-class="dragClass"
            ghost-class="ghostClass"
            chosen-class="chosenClass"
            :force-fallback="true"
          >
            <transition-group :style="style">
              <div
                v-for="(item,index) in draggableGroup"
                :key="item.instanceId"
                class="item"
              >
                <div>
                  <p>
                    {{ item.instanceName }}
                  </p>
                  <p>
                    {{ '主机:' + item.host }}
                  </p>
                  <p>
                    {{ '端口:' + item.port }}
                  </p>
                </div>
                <i
                  class="fa fa-trash-o"
                  @click="deleteD(index)"
                />
              </div>
            </transition-group>
          </draggable>
        </div>
      </div>
      <div slot="footer">
        <el-button class="golden" @click="setInstanceGroup">{{ $ts('button.confirm') }}</el-button>
        <el-button class="primary blue" @click="resetD">{{ $ts('reset') }}</el-button>
        <el-button @click="visibleD = false">{{ $ts('button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import {
  getAllInstance,
  startInstance,
  stopInstance,
  killInstance,
  addInstanceGroup,
  setInstanceGroup,
  listInstanceGroup
} from '@/api/system'
import TableData from '../../tableData.vue'
const instanceIds = []
const instanceNames = []
const instanceStatuses = []
const instanceHostIps = []
var instanceTimer
export default {
  name: 'Services',
  components: { TableData },
  filters: {
    getInstanceStatus(e) {
      let status_level = ''
      switch (e.status) {
        case 'OK':
          status_level = 'success'
          break
        case 'SUSPEND':
          status_level = ''
          break
        case 'INC':
          status_level = 'danger'
          break
        case 'FAILED':
          status_level = 'danger'
          break
        case 'FORGOTTEN':
          status_level = 'warning'
          break
        case 'UNKNOWN':
          status_level = 'warning'
          break
      }
      return status_level
    }
  },
  data() {
    return {
      rules: {
        groupName: {
          required: true, message: '组名必填'
        },
        description: {
          min: 0, max: 256, message: '长度限制256位'
        }
      },
      form: {
        groupName: '',
        description: ''
      },
      addGroup: false,
      changeTab: true,
      visibleD: false,
      style: 'min-height:120px;display: flex;flex-wrap:wrap;justify-content:space-between',
      groupA: {
        name: 'instance', pull: true
      },
      draggableGroup: [],
      draggableInstance: [],
      serviceStatus: '',
      tempStatus: '',
      statusList: [
        {
          label: this.$ts('ok.status'),
          value: 'ok'
        },
        {
          label: this.$ts('status.unknown'),
          value: 'alarm'
        },
        {
          label: this.$ts('status.stop'),
          value: 'error'
        }
      ],
      startInstance: true,
      stopInstance: true,
      deleteInstance: true,
      tableDataDetail: [],
      totalDetail: 0,
      currentPageDetail: 1,
      pagesizeDetail: 10,
      pagesizesDetail: [5, 10, 20, 50],
      checkBox: true,
      tempChoosed: [],
      searchVal: '',
      tempSearchVal: '',
      searchShowVal: '',
      tempShowVal: '',
      prop: '',
      order: '',
      tableGroup: [],
      totalGroup: 0,
      pageObj: {
        currentPage: 1,
        pageSize: 10
      },
      loading: false,
      loadingFlag: true,
      tableColumns: [
        {
          slot: 'groupName', show: true
        },
        {
          sortable: 'custom', prop: 'description', title: '描述', show: true
        },
        { slot: 'action', show: true }
      ],
      selectGroup: ''
    }
  },
  computed: {
    tableSlice() {
      return this.tableDataDetail.slice(
        (this.currentPageDetail - 1) * this.pagesizeDetail,
        this.currentPageDetail * this.pagesizeDetail
      )
    }
  },
  watch: {
    changeTab(val) {
      if (val) {
        this.listInstance()
      } else {
        clearTimeout(instanceTimer)
        this.listInstanceGroup()
      }
    },
    visibleD(val) {
      if (val) {
        // 设置instancegroup、调用instanceList
        this.loading = true
        getAllInstance({
          version: this.$store.state.dosVersion
        })
          .then(res => {
            if (res.error.code !== 0) {
              this.$ts({
                type: 'error',
                text: this.$ts(res.error.name)
              })
            } else {
              this.draggableInstance = res.data.sort((a, b) => {
                return a.instanceName.localeCompare(b.instanceName)
              })
              this.copyDraggableInstance = JSON.parse(JSON.stringify(this.draggableInstance))
            }
          })
          .finally(() => {
            this.loading = false
          })
      } else {
        this.draggableGroup = []
      }
    }
  },
  mounted() {
    this.serviceStatus = this.$route.params.level || ''
    this.serviceStatus = this.serviceStatus.toLowerCase()
    this.tempStatus = this.serviceStatus
    this.listInstance()
  },
  destroyed() {
    clearTimeout(instanceTimer)
  },
  methods: {
    dialogOpen(ref) {
      this.$refs[ref] && this.$refs[ref].resetFields()
    },
    listInstanceGroup() {
      this.loading = true
      listInstanceGroup().then(res => {
        this.tableGroup = res.data
        this.tableGroup = [
          { groupName: 123 },
          { groupName: 456 }
        ]
      }).catch(err => {
        console.error(err)
      })
        .finally(() => {
          this.loading = false
        })
    },
    createGroup() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const { groupName, description } = this.form
          addInstanceGroup({
            groupName,
            description
          }).then(res => {
            if (res.code === '200') {
              this.listInstanceGroup()
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            }
          }).finally(() => {
            this.addGroup = false
          })
        }
      })
    },
    deleteD(i) {
      var temp = this.draggableGroup.splice(i, 1)
      this.draggableInstance.push(...temp)
    },
    // end () {
    // const arr = []
    // this.draggableB.forEach((d, index) => {
    //   arr.push({
    //     id: d.name,
    //     name: d.name,
    //     type: d.type
    //   })
    // })
    // this.draggableB = arr
    // },
    addTo(index) {
      this.draggableGroup.push(this.draggableInstance[index])
      this.draggableInstance.splice([index], 1)
    },
    resetD() {
      this.draggableGroup.splice(0)
      this.draggableInstance = JSON.parse(JSON.stringify(this.copyDraggableInstance))
    },
    setInstanceGroup() {
      const instanceIds = this.draggableGroup.map(item => item.instanceId)
      setInstanceGroup({
        groupId: this.selectGroup.groupId,
        instanceIds
      }).then(res => {
        if (res.code == '200') {
          const instanceIds = res.data.failedInstanceIds.map(item => {
            item.toString()
            return item
          })
          if (instanceIds && instanceIds.length) {
            const duplicatedInstance = this.draggableGroup.filter(item => {
              return instanceIds.some(i => {
                return i == item.instanceId
              })
            })
            const errorInfo = duplicatedInstance.reduce((pre, cur) => {
              return pre + `${cur.instanceName}(ip:${cur.host},port:${cur.port})`
            }, '')
            this.$ts({
              type: 'error',
              text: '如下instance由于重复添加导致失败:' + errorInfo
            })
          } else {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
          }
        }
      })
        .finally(() => {
          this.visibleD = false
          this.listInstanceGroup()
        })
    },
    changeStatus() {
      this.currentPageDetail = 1
      this.tempSearchVal = this.searchVal
      this.tempStatus = this.serviceStatus
      this.listInstance()
    },
    handleSizeChangeDetail(size) {
      this.pagesizeDetail = size
      this.listInstance()
    },
    handleCurrentChangeDetail(currentPage) {
      this.currentPageDetail = currentPage
      this.listInstance()
    },
    sortFunction(val) {
      this.prop = val.prop
      this.order = val.order
      if (this.changeTab) {
        this.tableDataDetail.sort(this.sortMethod(val.prop, val.order))
      } else {
        this.tableGroup.sort(this.sortMethod(val.prop, val.order))
      }
    },
    selectFun(val) {
      this.tempChoosed = val
      // ？？？
      var count = 0
      var fir = false
      var sec = false
      var thir = false
      var fou = false
      $.each(val, function(i, v) {
        instanceIds[count] = v.instanceId
        instanceNames[count] = v.instanceName
        instanceHostIps[count] = v.host
        instanceStatuses[count] = v.status
        count++
      })
      // 取消select开启轮询、禁用状态初始化
      if (val.length == 0) {
        this.listInstance()
        this.startInstance = true
        this.stopInstance = true
        this.deleteInstance = true
      } else {
        clearTimeout(instanceTimer)
        this.startInstance = false
        this.stopInstance = false
        this.deleteInstance = false
        // fir 对应启动、sec：停止，thir移除,fou 额外状态都禁用?
        // 移除按钮启用：当status为INC或者除了ok、suspend、unknown外的status的
        for (var i = 0; i < count; i++) {
          // 正常、挂起
          if (instanceStatuses[i] == 'OK' || instanceStatuses[i] == 'SUSPEND') {
            fir = true
          } else if (instanceStatuses[i] == 'INC') {
            sec = true
          } else if (instanceStatuses[i] == 'UNKNOWN') {
            thir = true
          } else {
            fou = true
          }
        }
        if (sec == true && fou == true && fir == false && thir == false) {
          this.deleteInstance = false
          this.stopInstance = true
          this.startInstance = true
        } else if (
          fir == true &&
          sec == false &&
          thir == false &&
          fou == false
        ) {
          this.startInstance = true
          this.deleteInstance = true
        } else if (
          fir == false &&
          sec == true &&
          thir == false &&
          fou == false
        ) {
          this.stopInstance = true
        } else if (
          fir == false &&
          sec == false &&
          thir == true &&
          fou == false
        ) {
          this.stopInstance = true
          this.startInstance = true
          this.deleteInstance = true
        } else if (
          fir == false &&
          sec == false &&
          thir == false &&
          fou == true
        ) {
          this.stopInstance = true
          this.startInstance = true
          this.deleteInstance = false
        } else {
          this.stopInstance = true
          this.startInstance = true
          this.deleteInstance = true
        }
      }
    },
    startEvent() {
      for (const i in this.tempChoosed) {
        startInstance({
          version: this.$store.state.dosVersion,
          host: this.tempChoosed[i].host,
          servicePort: this.tempChoosed[i].port,
          serviceName: this.tempChoosed[i].instanceName
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
          })
          .catch(error => {
            console.error(error)
          })
          .finally(() => {
            this.$refs['tableData'].clearSelection()
          })
      }
    },
    stopEvent() {
      for (const i in this.tempChoosed) {
        stopInstance({
          version: this.$store.state.dosVersion,
          host: this.tempChoosed[i].host,
          servicePort: this.tempChoosed[i].port,
          serviceName: this.tempChoosed[i].instanceName,
          sync: false
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
          })
          .catch(error => {
            console.error(error)
          })
          .finally(() => {
            this.$refs['tableData'].clearSelection()
          })
      }
    },
    deleteEvent() {
      for (const i in this.tempChoosed) {
        killInstance({
          version: this.$store.state.dosVersion,
          host: this.tempChoosed[i].host,
          port: this.tempChoosed[i].port,
          serviceName: this.tempChoosed[i].instanceName,
          instanceId: this.tempChoosed[i].instanceId
        })
          .then(res => {
            if (res.error.code !== 0) {
              // 状态变更、延迟删除 添加返回、不然请求返回错误
              if (res.error.name === 'InstanceHasFailedAleadyException') {
                return
              } else {
                this.$ts({
                  type: 'error',
                  text: this.$ts(res.error.name)
                })
              }
            } else {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            }
          })
          .catch(error => {
            console.error(error)
          })
          .finally(() => {
            this.$refs['tableData'].clearSelection()
          })
      }
    },
    listInstance() {
      clearTimeout(instanceTimer)
      getAllInstance({
        version: this.$store.state.dosVersion
      })
        .then(res => {
          if (res.error.code !== 0) {
            this.$ts({
              type: 'error',
              text: this.$ts(res.error.name)
            })
          } else {
            // 状态、ip过滤tempSearchVal、tempStatus
            // 健康ok 匹配ok、suspend、
            // 警告 alarm匹配 FORGOTTEN、UNKNOWN
            // 错误 匹配INC、FAILED
            this.tableDataDetail = res.data.filter(item => {
              if (this.tempSearchVal && this.tempStatus) {
                if (this.tempStatus === 'ok') {
                  return (
                    item.host.indexOf(this.tempSearchVal) > -1 &&
                    (item.status == 'OK' || item.status == 'SUSPEND')
                  )
                } else if (this.tempStatus === 'alarm') {
                  return (
                    item.host.indexOf(this.tempSearchVal) > -1 &&
                    (item.status == 'FORGOTTEN' || item.status == 'UNKNOWN')
                  )
                } else {
                  return (
                    item.host.indexOf(this.tempSearchVal) > -1 &&
                    (item.status == 'INC' || item.status == 'FAILED')
                  )
                }
              } else if (this.tempSearchVal && !this.tempStatus) {
                // 无状态 过滤
                return item.host.indexOf(this.tempSearchVal) > -1
              } else if (this.tempStatus && !this.tempSearchVal) {
                if (this.tempStatus === 'ok') {
                  return item.status == 'OK' || item.status == 'SUSPEND'
                } else if (this.tempStatus === 'alarm') {
                  return item.status == 'FORGOTTEN' || item.status == 'UNKNOWN'
                } else {
                  return item.status == 'INC' || item.status == 'FAILED'
                }
              } else {
                return item
              }
            })
            this.totalDetail = this.tableDataDetail.length
            this.tableDataDetail.sort(this.sortMethod(this.prop, this.order))
            if (
              Math.ceil(this.totalDetail / this.pageSizeDetail) <
              this.currentPageDetail
            ) {
              this.currentPageDetail = Math.ceil(
                this.totalDetail / this.pageSizeDetail
              )
            }
            if (this.$route.name !== 'Service') return
            instanceTimer = setTimeout(this.listInstance, 5000)
          }
        })
        .catch(error => {
          console.error(error)
        })
        .finally(() => {
          this.loadingFlag = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
.ghostClass {
  border-radius: 20px;
  background-color: #fff !important;
}

.chosenClass {
  background-color: #25363e !important;
  opacity: 1 !important;
}

.dragClass {
  overflow: hidden;
  background-color: #25363e !important;
  opacity: 1 !important;
  box-shadow: none !important;
  outline: none !important;
  background-image: none !important;
}

::v-deep .itxst {
  margin: 10px;
  max-height: 500px;
  display: flex;
  align-items: center;
  position: relative;

  .el-loading-mask {
    top: -30px;
  }

  .col {
    width: 40%;
    padding: 40px 10px 10px;
    border-radius: 5px;
    box-shadow: 0 2px 12px 0 rgb(0, 0, 0, 0.2) !important;

    .title {
      color: #ff8746;
      position: absolute;
      top: -16px;

      & + div {
        height: 500px;
        overflow-y: scroll;
      }
    }
  }
}

.draggableArrow {
  margin: 0 30px;
  position: relative;
  color: #ff8746;
  font-size: 30px;
  // position: absolute;
  // top: 50%;
  // transform: translateY(-50%);
}

.col + .col {
  margin-left: 10px;
}

.item {
  text-indent: 10px;
  border-radius: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  width: 44%;
  height: 10%;
  padding: 8px;
  margin: 10px;
  background-color: #19272e;
  color: #d3d6d8;
  min-width: 60px;

  .fa {
    padding: 3px;
    float: right;
  }
}

.item:hover {
  background-color: #25363e;
  cursor: move;
}
</style>
<style>
#services_search .el-range-separator,
#services_search .el-input__icon {
  line-height: 26px !important;
}

.icon_circle {
  display: inline-block;
  width: 0;
  height: 0;
  border-radius: 5px;
  border: 5px solid #000;
  margin: 0 10px;
}

.icon_safe {
  background-color: #67c23a;
  border-color: rgba(103, 194, 58, 0.2);
  color: #67c23a;
}

.icon_alarm {
  background-color: #e6a23c;
  border-color: rgba(230, 162, 60, 0.2);
  color: #e6a23c;
}

.icon_danger {
  background-color: #f56c6c;
  border-color: hsla(0, 87%, 69%, 0.2);
  color: #f56c6c;
}

.icon_suspend {
  color: #409eff;
  border-color: #409eff;
  background-color: #409eff;
}

.instance_wrap {
  border-radius: 9px;
  line-height: 18px;
  display: inline-block;
  padding: 0 10px;
  margin: 4px 0;
  color: #fff;
  margin-right: 20px;
  width: 115px;
  text-align: center;
}

.serviceTag {
  display: inline-block;
  margin-right: 20px;
  width: 115px;
  text-align: center;
  line-height: 18px;
  margin-top: 6px;
  margin-bottom: 6px;
}
</style>
