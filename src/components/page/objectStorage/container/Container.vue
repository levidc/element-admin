<template>
  <div>
    <div class="page_content_wrap">
      <el-form label-width="100px">
        <el-row>
          <el-col :span="6">
            <el-form-item
              label="选择域"
              required
            >
              <el-select
                v-model="domain"
                filterable
                clearable
                size="mini"
                placeholder="请选择一个域"
                @change="changeDomain"
              >
                <el-option
                  v-for="item in domainList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-show="domain"
            :span="6"
          >
            <el-form-item label="类型">
              <el-select
                v-model="containerFormatType"
                size="mini"
                filterable
                clearable
                placeholder="选择type"
                @change="clearStoragepoolId"
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
          </el-col>
          <el-col
            v-show="domain"
            :span="6"
          >
            <el-form-item label="EC类型">
              <el-select
                v-model="durabilityType"
                size="mini"
                filterable
                clearable
                placeholder="选择EC类型"
                @change="clearStoragepoolId"
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
          </el-col>
          <div
            class="right"
            style="margin-top:12px"
          >
            <el-tooltip
              content="刷新"
              placement="top"
              effect="dark"
            >
              <i
                class="el-icon-refresh"
                @click="listContainers"
              />
            </el-tooltip>
          </div>
        </el-row>

        <el-form-item
          v-show="domain"
          label="存储池"
          required
        >
          <el-select
            v-model="storagepoolId"
            filterable
            clearable
            size="mini"
            placeholder="请选择一个存储池"
            @change="listContainers"
          >
            <el-option
              v-for="item in storagepoolList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              {{ item.label }}
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="page_content_wrap">
        <div class="manage-area-main">
          <el-row class="tc-data">
            <el-col :span="8">
              <div class="tc-data-card pl-0 pr-0">
                <div class="tc-data-card-hd">
                  <span slot="reference">存储池名称</span>
                </div>
                <div class="tc-data-card-bd">
                  <div class="tc-data-value">
                    {{ storagepoolName }}
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="tc-data-card pl-0 pr-0">
                <div class="tc-data-card-hd">
                  <span slot="reference">可用Container</span>
                </div>
                <div class="tc-data-card-bd">
                  <div class="tc-data-value">
                    {{ availableContainerNumber }}
                  </div>
                </div>
              </div>

            </el-col>
            <el-col :span="8">
              <div class="tc-data-card pl-0 pr-0">
                <div class="tc-data-card-hd">
                  <div class="title">
                    <span slot="reference">不可用Container
                    </span>
                  </div>
                </div>
                <div class="tc-data-card-bd">
                  <div class="tc-data-value">
                    {{ unAvailableContainerNumber }}
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>

          <el-row class="tc-data">
            <el-col :span="8">
              <div class="tc-data-card pl-0 pr-0">
                <div class="tc-data-card-hd">
                  <span slot="reference">总容量</span>
                </div>
                <div class="tc-data-card-bd">
                  <div class="tc-data-value">
                    {{ totalSpace }}
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="tc-data-card pl-0 pr-0">
                <div class="tc-data-card-hd">
                  <span slot="reference">剩余容量</span>
                </div>
                <div class="tc-data-card-bd">
                  <div class="tc-data-value">
                    {{ freeSpace }}
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <!-- <el-button v-show="tableData&&tableData.length" type="danger" :disabled="hasChecked" @click="deleteFlag=true">删除</el-button> -->
      <el-table
        v-show="tableData&&tableData.length"
        ref="multipleTable"
        class="volumeDetail_column"
        :data="tableData"
        border
        tooltip-effect="dark"
        row-key="containerId"
        :row-class-name="getRowClass"
        :expand-row-keys="expands"
        style="width: 100%"
        @sort-change="sortFunction"
      >
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table
              :data="props.row.simpleContainerUnitMetadataList"
              style="margin-left: 48px;"
            >
              <el-table-column
                label="aircraftId"
                prop="aircraftId"
              >
                <template slot-scope="scope">
                  {{ scope.row.aircraftId + '' }}
                </template>
              </el-table-column>
              <el-table-column
                label="archiveId"
                prop="archiveId"
              >
                <template slot-scope="scope">
                  {{ scope.row.archiveId + '' }}
                </template>
              </el-table-column>
              <el-table-column
                label="position"
                prop="position"
              />
              <el-table-column
                label="statusValue"
                prop="statusValue"
              />
              <el-table-column
                label="timerWillDeleting"
                prop="timerWillDeleting"
              >
                <template slot-scope="scope">
                  {{ scope.row.timerWillDeleting + '' }}
                </template>
              </el-table-column>
              <el-table-column
                label="logicPageSize"
                prop="logicPageSize"
              />
              <el-table-column
                label="freeSpace(GB)"
                prop="freeSpace"
                :formatter="formatterG"
              />
            </el-table>
          </template>
        </el-table-column>
        <!-- <el-table-column type="selection" :selectable="checkDeleting" /> -->
        <el-table-column
          label="ContainerId"
          prop="containerId"
          align="center"
        />
        <el-table-column
          label="containerFormatType"
          prop="containerFormatType"
          align="center"
        >
          <template slot-scope="scope">
            {{ getType(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="durabilityType" prop="durabilityType" align="center" :formatter="getDurabilityType" />
        <el-table-column label="containerStatus" prop="containerStatus" align="center" />
        <el-table-column :label="$ts('domain.free')" prop="freeSpace" align="center" :formatter="formatterG" />
        <el-table-column :label="$ts('domain.used')" prop="usedSpace" align="center" :formatter="formatterG" />
      </el-table>
      <div
        v-show="total"
        class="page_block"
      >
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <el-dialog
      :visible.sync="deleteFlag"
      title="删除容器"
    >
      <p>确定删除下列id的容器</p>
      <div
        v-for="item in multipleSelection"
        :key="item.containerId"
      >
        {{ item.containerId }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="deleteContainer">{{ $ts('button.confirm') }}</el-button>
        <el-button @click="deleteFlag = false">{{ $ts('button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script type="text/javascript">
import { listDomain, listStoragePool } from '@/api/resource'
import { listContainer, deleteContainer } from '@/api/storage'
export default {
  name: 'Container',
  data() {
    return {
      timer: null,
      tableData: [],
      tableDataDetail: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      expands: [],
      prop: 'containerId',
      order: 'ascending',
      domainList: [],
      storagepoolList: [],
      domain: '',
      storagepoolId: '',
      storagepoolName: '',
      unAvailableContainerNumber: '',
      availableContainerNumber: '',
      totalSpace: '',
      freeSpace: '',
      containerFormatType: '',
      durabilityType: '',
      multipleSelection: [],
      hasChecked: true,
      deleteFlag: false,
      ecTypeList: [
        // { value: '1', label: 'REPLICATION_3' },
        // { value: '2', label: 'CAUCHY_N9_K3' },
        // { value: '3', label: 'CAUCHY_N6_K3' },
        // { value: '4', label: 'CAUCHY_N18_K9' },
        // { value: '5', label: 'CAUCHY_N21_K11' },
        { value: 6, label: '4+2' },
        { value: 7, label: '2+1' }
      ],
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
      ]
    }
  },
  mounted() {
    // 选择域、存储池后调用 containerlist接口
    this.listDomains()
  },
  destroyed() {
    clearTimeout(this.timer)
  },
  methods: {
    checkDeleting(val) {
      return val.containerStatus !== 'Deleting'
    },
    getRowClass(row) {
      const data = row.row
      const res = []
      if (data.simpleContainerUnitMetadataList && data.simpleContainerUnitMetadataList.length > 0) {
        res.push('row-expand-has')
        return res
      } else {
        res.push('row-expand-unhas')
        return res
      }
    },
    clearStoragepoolId() {
      this.storagepoolId = ''
      this.tableData = []
      this.total = 0
      this.storagepoolName = ''
      this.availableContainerNumber = ''
      this.unAvailableContainerNumber = ''
      this.totalSpace = ''
      this.freeSpace = ''
    },
    getType(row) {
      const arr = this.typeList.filter(
        item => row.containerFormatType == item.value
      )
      return arr && arr[0].label
    },
    getDurabilityType(row, column) {
      let durabilityType = []
      this.ecTypeList.forEach(function(ele) {
        if (ele.value == row[column.property]) {
          durabilityType = ele
        }
      })
      return durabilityType.label
    },
    byteFormat(size) {
      if (!size) {
        return '0'
      }
      size = size * 1.0
      if (size < 1024) {
        return size.toFixed(1) + 'B'
      }
      size = size / 1024
      if (size < 1024) {
        return size.toFixed(1) + 'KB'
      }
      size = size / 1024
      if (size < 1024) {
        return size.toFixed(1) + 'MB'
      }
      size = size / 1024
      return size.toFixed(1) + 'GB'
    },
    listContainers() {
      // 未选中存储池
      if (this.storagepoolId == '') {
        this.tableData = []
        this.total = 0
        this.storagepoolName = ''
        this.unAvailableContainerNumber = ''
        this.availableContainerNumber = ''
        this.totalSpace = ''
        this.freeSpace = ''
        return
      }
      // 获取新的domain
      this.listDomains()
      const startIndex = (this.currentPage - 1) * this.pageSize
      listContainer({
        version: this.$store.state.dosVersion,
        poolId: this.storagepoolId,
        startIndex,
        paginationNumber: this.pageSize,
        containerFormatType: this.containerFormatType || '',
        durabilityType: this.durabilityType || 0
      })
        .then(res => {
          if (res.error.code !== 0) {
            this.$ts({
              type: 'error',
              text: this.$ts(res.error.name)
            })
          } else {
            // console.log(res, 'res')
            this.tableData = res.data
            this.tableData.sort(this.sortMethod(this.prop, this.order))
            this.total = res.totalCount
            if (
              this.currentPage == 0 &&
              Math.ceil(this.total / this.pageSize) > 0
            ) {
              this.currentPage = 1
            }
            if (
              this.total &&
              Math.ceil(this.total / this.pageSize) < this.currentPage
            ) {
              this.currentPage = Math.ceil(this.total / this.pageSize)
            }
            this.unAvailableContainerNumber =
              res.unAvailableContainerNumber || 0
            this.availableContainerNumber = res.availableContainerNumber || 0
            this.totalSpace = this.byteFormat(res.totalSpace)
            this.freeSpace = this.byteFormat(res.freeSpace)
            const pool = this.storagepoolList.find(item => {
              return item.value === this.storagepoolId
            })
            this.storagepoolName = pool.label
            // const deleteArr = this.tableData.filter(item => {
            //   return item.containerStatus == 'Deleting'
            // })
            // clearTimeout(this.timer)
            // if (deleteArr && deleteArr.length) {
            //   this.timer = setTimeout(() => {
            //     this.listContainers()
            //   }, 3000)
            // }
          }
        })
        .catch(error => {
          console.error(error)
        })
    },
    listDomains() {
      listDomain({
        version: this.$store.state.dosVersion
      })
        .then(res => {
          if (res.error.code !== 0) {
            this.$ts({
              type: 'error',
              text: this.$ts(res.error.name)
            })
          } else {
            var data = res.data
            this.domainList = []
            // 选了domain 不清空storagePoolList
            if (!this.domain) {
              this.storagepoolList = []
            }
            for (var i = 0; i < data.length; i++) {
              this.domainList.push({
                value: data[i].domainId,
                label: data[i].domainName
              })
            }
          }
        })
        .catch(error => {
          console.error(error)
        })
    },
    changeDomain() {
      if (this.domain) {
        listStoragePool({
          version: this.$store.state.dosVersion,
          domainId: this.domain
        })
          .then(res => {
            if (res.error.code !== 0) {
              this.$ts({
                type: 'error',
                text: this.$ts(res.error.name)
              })
            } else {
              var data = res.data || []
              this.storagepoolList = []
              for (var i = 0; i < data.length; i++) {
                this.storagepoolList.push({
                  value: data[i].poolId,
                  label: data[i].poolName
                })
              }
              // 清除所选存储池
              this.storagepoolId = ''
              this.durabilityType = ''
              this.containerFormatType = ''
            }
          })
          .catch(error => {
            console.error(error)
          })
      }
      this.clearStoragepoolId()
    },
    // handleSelectionChange (val) {
    //   this.multipleSelection = val
    //   if (this.multipleSelection.length != 0) {
    //     this.hasChecked = false
    //     clearTimeout(this.timer)
    //   } else {
    //     this.hasChecked = true
    //     this.timer = setTimeout(() => {
    //       this.listContainers()
    //     })
    //   }
    // },
    async deleteContainer() {
      const temp = []
      for (let i = 0; i < this.multipleSelection.length; i++) {
        const p = new Promise((resolve, reject) => {
          deleteContainer({
            containerId: this.multipleSelection[i].containerId,
            version: this.$store.state.dosVersion
          }).then(res => {
            resolve(res)
            temp.push(p)
          }).catch(err => {
            reject(err)
          })
        })
      }
      // console.log(temp, 'temp', contrast, 'ccontrast')
      if (temp.length !== this.multipleSelection.length) {
        this.deleteFlag = false
        this.listContainers()
      } else {
        Promise.all(temp).then(res => {
          // console.log(res, 'all')
          this.deleteFlag = false
          this.listContainers()
        })
      }
    },
    sortFunction(val) {
      this.prop = val.prop
      this.order = val.order
      this.listContainers()
    },
    handleSizeChange: function(size) {
      this.pageSize = size
      this.listContainers()
    },
    handleCurrentChange: function(currentPage) {
      this.currentPage = currentPage
      this.listContainers()
    },
    getRowKeys(row) {
      return row.containerId
    }
  }
}
</script>
<style>
.row-expand-unhas .el-table__expand-column {
  pointer-events: none;
}

.row-expand-unhas .el-table__expand-column .el-icon {
  visibility: hidden;
}
</style>
<style lang="scss" scoped>
.volumeDetail_column {
  margin-top: 20px;
}

.el-select {
  margin-right: 10px;
}

.manage-area-main {
  max-width: 1360px;
  margin: 20px auto;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.2);
  padding: 20px;
  box-sizing: border-box;
}

.area_title {
  display: table;
  width: 100%;
  table-layout: auto;
  margin-bottom: 18px;
  box-sizing: border-box;
}

.area_title h3 {
  display: block;
  font-size: 1.17em;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  font-weight: bold;
  line-height: 30px;
}

.area_link {
  font-size: 12px;
  color: #ff8746;
}

.tc-data {
  margin-bottom: 20px;
}

.tc-data .el-col {
  padding: 0 10px;
}

.tc-data .el-col:first-of-type {
  border-left: none;
}

.tc-data-card-hd {
  position: relative;
  margin-bottom: 3px;
  font-size: 12px;
  height: 18px;
  font-weight: 700;
}

.tc-data-card-hd .fa-question-circle {
  font-style: normal;
  font-weight: 400;
}

.tc-data-card-bd {
  height: 54px;
  line-height: 54px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Hiragina Sans GB",
    "WenQuanYi Micro Hei", "microsoft yahei ui", "microsoft yahei", sans-serif;
}

.tc-data-num {
  font-size: 36px;
}

.tc-data-unit {
  font-size: 12px;
}
</style>
