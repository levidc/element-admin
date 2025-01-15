<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 clearfix">
        <!-- <el-button v-access="'admin:CreateBucket'" class="golden" type="primary" @click="">{{ $ts("page.create") }}</el-button> -->
        <div class="right">
          <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
            <i class="el-icon-refresh" @click="searchVal = ''; init()" />
          </el-tooltip>
        </div>
        <el-input v-model="searchVal" class="search_style search_btn right with_search mr_10"
          :placeholder="$ts('bucket.searchBucketName')" clearable />
      </div>
      <el-table v-loading="loading" :data="tableData.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)"
        style="width: 100%">
        <!-- <el-table-column prop="fsName" label="文件系统名称" min-width="200px" /> -->
        <el-table-column prop="bucketName" :label="$ts('bucket.name')" min-width="200px" fixed>
          <template slot-scope="scope">
            <showToolTip :text="scope.row.name" use-slot>
              <a slot="data" class="blue" @click="filterBucket(scope.row)">
                {{ scope.row.bucketName }}
              </a>
            </showToolTip>
          </template>
        </el-table-column>
        <el-table-column prop="bucketName" :label="this.$ts('client.readWritePermission')" min-width="150px">
          <template slot-scope="scope">
            {{ renderAuth(scope.row.ro) }}
          </template>
        </el-table-column>
        <!-- 展示客户端IP、区分nfs、samba、添加tag显著区分、多条显示查看详情 -->
        <el-table-column prop="nfsInfos" :label="$ts('fileSystem.url')" min-width="200px">
          <template slot-scope="scope">
            <div v-if="scope.row.clientData.length > 4" class="insertTable">
              <div class="rowFlex">
                <div v-for="item in scope.row.clientData" :key="item.name" class="flex">
                  <el-tag>{{ item.type }}</el-tag>
                  <showToolTip :text="item.url" use-slot>
                    <span slot="data" data-clipboard-action="copy" class="copyIcon" :data-clipboard-text="item.url"
                      @click="copiedMsg">
                      <i class="el-icon-document-copy" style="position: relative;top: -1px;" />
                      {{ item.url }}
                    </span>
                  </showtooltip>
                </div>
              </div>
              <!-- <el-table :data="scope.row.clientData.slice(0,2)">
                <el-table-column prop="path" label="路径">
                  <template slot-scope="data">
                    <div class="flex">
                      <el-tag>{{ data.row.type }}</el-tag>
                        <el-tooltip content="复制" placement="top">
                          <showToolTip :text="data.row.url" use-slot>
                          <span slot="data" data-clipboard-action="copy" class="copyIcon" :data-clipboard-text="data.row.url">
                        {{ data.row.url }}
                          </span>
                        </showtooltip>
                      </el-tooltip>
                    </div>
                  </template>
</el-table-column>
</el-table> -->
              <span class="overText" @click="handleShare(scope.row)">
                ...
              </span>
            </div>
            <div v-else-if="scope.row.clientData.length > 0" style="padding-bottom: 0;" class="insertTable">
              <div class="rowFlex">
                <div v-for="item in scope.row.clientData" :key="item.name"
                  :style="renderSingleStyle(scope.row.clientData)"
                  :class="['flex', renderSingleClass(scope.row.clientData)]">
                  <el-tag>{{ item.type }}</el-tag>
                  <showToolTip :text="item.url" use-slot>
                    <span slot="data" data-clipboard-action="copy" class="copyIcon" :data-clipboard-text="item.url"
                      @click="copiedMsg">
                      <i class="el-icon-document-copy" style="position: relative;top: -1px;" />
                      {{ item.url }}
                    </span>
                  </showtooltip>
                </div>
              </div>
            </div>
            <!-- <el-table v-else-if="scope.row.clientData.length>0" :data="scope.row.clientData">
              <el-table-column prop="path" label="路径">
                <template slot-scope="data">
                  <div class="flex">
                    <el-tag>{{ data.row.type }}</el-tag>
                    <showToolTip :text="data.row.url" use-slot>
                      <span slot="data" data-clipboard-action="copy" class="copyIcon" :data-clipboard-text="data.row.url">
                      {{ data.row.url }}
                    </span>
                    </showtooltip>
                  </div>
                </template>
                </el-table-column>
            </el-table> -->
            <span v-else />
          </template>
        </el-table-column>
        <el-table-column :label="$ts('page.action')" width="200px" fixed="right">
          <template slot-scope="scope">
            <!-- <el-menu mode="horizontal" active-text-color="#8997a5" class="tableMenu">
              <el-submenu index="2" popper-append-to-body popper-class="tableSubMenu">
                <template slot="title">
                  <el-button type="primary" class="blue">
                    {{ $ts('page.action') }}<i class="el-icon-arrow-down el-icon--right" />
                  </el-button>
                </template>
  <el-menu-item index="2-1">
    <el-popover :ref="`popRef` + String(scope.row.fsId)" placement="left" width="600" trigger="click"
      @after-enter="handleResize">
      <p style="color: #d3d6d8;margin-bottom: 20px;font-size: 16px">客户端信息</p>
      <DataTable :table-data="clientFs" :loading="showPopover" :columns="clientColumns">
        <el-table-column slot="name" label="名称" prop="name">
          <template slot-scope="scope">
                          <showToolTip :text="scope.row.name" />
                        </template>
        </el-table-column>
      </DataTable>
      <span slot="reference" @click="viewClientFs(scope.row)">已分享客户端
      </span>
    </el-popover>
  </el-menu-item>
  <el-submenu index="2-4">
    <template slot="title">分享</template>
    <el-menu-item index="2-4-2" @click="handleShare('apply', scope.row)">新建分享</el-menu-item>
    <el-menu-item index="2-4-3" @click="handleShare('cancel', scope.row)">取消分享</el-menu-item>
  </el-submenu>
  </el-submenu>
  </el-menu> -->
            <el-dropdown size="small" trigger="hover">
              <el-button type="primary" class="blue">
                {{ $ts('page.action') }}<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleShare(scope.row)">{{ $ts('fileSystem.shareConfig')
                  }}</el-dropdown-item>
                <!-- <el-popover
                  :ref="`popRef` + String(scope.row.fsId)"
                  placement="left"
                  width="800"
                  trigger="click"
                  @after-enter="handleResize"
                >
                  <p style="color: #d3d6d8;margin-bottom: 20px;font-size: 16px">客户端信息</p>
                  <DataTable :max-height="500" :table-data="clientFs" :loading="showPopover" :columns="clientColumns">
                    <el-table-column slot="name" label="客户端名称" prop="name">
                      <template slot-scope="scope">
                        <showToolTip :text="scope.row.name" />
                      </template>
                    </el-table-column>
                    <el-table-column slot="url" label="共享路径">
                      <template slot-scope="scope">
                        <showToolTip :text="scope.row.url" />
                      </template>
                    </el-table-column>
                  </DataTable>
                  <el-dropdown-item slot="reference" @click.native="viewClientFs(scope.row)">查看共享</el-dropdown-item>
                </el-popover> -->
                <!-- <el-dropdown-item>取消共享</el-dropdown-item> -->
                <!-- <el-dropdown trigger="hover" placement="right-start">
                    <span class="el-dropdown-link">share</span>
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item>分析</el-dropdown-item>
                      <el-dropdown-item>取消分享</el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown> -->
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <div class="page_block">
        <el-pagination :current-page="pageIndex" :page-sizes="[5, 10, 50, 100]" :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
    <el-dialog :title="$ts('fileSystem.share')" class="shareDialog" :visible.sync="applyModal" width="800px">
      <el-form ref="form" :model="form" label-width="120px" style="padding:0 5%;" :rules="rules">
        <el-row>
          <el-col :span="12">
            <el-form-item :label="$ts('bucket.name')" prop="bucketName">
              <span>{{ form.bucketName }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="autoMount" :label="$ts('fileSystem.autoMount')">
              <el-radio-group v-model="form.autoMount">
                <el-radio :label="true">{{ $ts('page.Yes') }}</el-radio>
                <el-radio :label="false">{{ $ts('page.No') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <div>
          <el-form-item :label="$ts('fileSystem.shareClient')">
            <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
              <i class="right el-icon-refresh" @click="refreshList('apply')" />
            </el-tooltip>
          </el-form-item>
          <DataTable v-if="applyModal" :max-height="500" :table-data="clientFs" :loading="loadingSelectClient"
            :columns="selectClientColumn" selection :handle-selection-change="handleUnapplyChange"
            :get-row-key="val => val.name">
            <el-table-column slot="name" :label="$ts('client.name')" prop="name">
              <template slot-scope="scope">
                <showToolTip :text="scope.row.name" />
              </template>
            </el-table-column>
            <el-table-column slot="readOnly" :label="$ts('client.readonlyPermission')" width="80">
              <template slot-scope="scope">
                {{ scope.row.readOnly ? $ts('client.readonly') : $ts('client.readWrite') }}
              </template>
            </el-table-column>
            <el-table-column slot="sync" :label="$ts('client.sync') + '/' + $ts('client.async')" width="90">
              <template slot-scope="scope">
                {{ scope.row.sync ? $ts('client.sync') : $ts('client.async') }}
              </template>
            </el-table-column>
            <el-table-column slot="url" :label="$ts('fileSystem.url')" min-width="160">
              <template slot-scope="scope">
                <showToolTip :text="scope.row.url" use-slot>
                  <span slot="data" data-clipboard-action="copy" class="copyIcon" :data-clipboard-text="scope.row.url"
                    style="cursor: pointer;" @click="copiedMsg">
                    <i class="el-icon-document-copy" style="margin-left:10px" />
                    {{ scope.row.url }}
                  </span>
                </showToolTip>
              </template>
            </el-table-column>
          </DataTable>
          <el-row class="centerMenu">
            <el-button class="blue" :disabled="disabledApply" @click="confirmApply">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-Arrowup" />
              </svg>
            </el-button>
            <el-button class="red" type="danger" :disabled="disableUnapply" @click="confirmUnAppy">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-Arrowdown" />
              </svg>
            </el-button>
          </el-row>
          <el-form-item :label="$ts('fileSystem.notShareClient')">
            <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
              <i class="right el-icon-refresh" @click="refreshList('unapply')" />
            </el-tooltip>
          </el-form-item>
          <DataTable v-if="applyModal" ref="nfs" :table-data="allNFS" :loading="loadingNfs"
            :columns="selectClientColumn" :max-height="500" :get-row-key="val => val.name" selection pagination
            :total="nfsTotal" :select-init="setAvailbleClient" :handle-selection-change="handleApplyChange"
            :keep-selection="false" @renderPagination="renderNfsPagination">
            <el-table-column slot="readOnly" :label="$ts('client.readonlyPermission')" width="120">
              <template slot-scope="scope">
                {{ scope.row.readOnly ? $ts('client.readonly') : $ts('client.readWrite') }}
              </template>
            </el-table-column>
            <el-table-column slot="sync" :label="$ts('client.sync') + '/' + $ts('client.async')" width="120">
              <template slot-scope="scope">
                {{ scope.row.sync ? $ts('client.sync') : $ts('client.async') }}
              </template>
            </el-table-column>
          </DataTable>
        </div>
        <!-- <el-popover
            ref="popApplyRef"
            placement="bottom"
            width="800"
            trigger="click"
            destroy-on-close
            @hide="clearDataTable"
          >
            <p style="color: #d3d6d8;margin-bottom: 20px;font-size: 16px">添加客户端</p>
            <DataTable
              v-if="renderPopover"
              pagination
              :total="nfsTotal"
              :handle-selection-change="handleApplyChange"
              selection
              :table-data="allNFS"
              :loading="loadingNfs"
              :columns="selectClientColumn"
              :select-init="setAvailbleClient"
              :get-row-key="val => val.name"
              :max-height="500"
              @renderPagination="renderNfsPagination"
            />
            <div class="footer clearfix mt_20">
              <div class="right">
                <el-button class="blue" @click="cancelSelect">{{ $ts('page.cancel') }}</el-button>
                <el-button type="primary" class="golden" @click="confirmSelected">{{ $ts('page.confirm')
                }}</el-button>
              </div>
            </div>
            <el-button slot="reference" class="blue" @click="getClient">{{ $ts('page.add') }}</el-button>
          </el-popover> -->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="blue" @click="applyModal = false">{{ $ts('page.done') }}</el-button>
        <!-- <el-button type="primary" class="golden" @click="confirmApply">{{ $ts('page.confirm')
        }}</el-button> -->
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { debounce } from '@/utils/pass'
import ClipboardJS from 'clipboard'
import {
  listFSClient,
  getFsList,
  shareApply,
  shareUnapply,
  getUnusedClient
  // getNfsClientList,
} from '@/api/bucket'
export default {
  name: 'FileSystem',
  components: {
  },
  filters: {
    nameFilter: function (arr) {
      if (!arr && arr.length) return ''
      const names = arr.map(item => item.name).join(',')
      return names
    }
  },
  data () {
    return {
      loadingAdd: false,
      loadingRemove: false,
      selUnapplyClientList: [],
      selApplyClientList: [],
      selectedFs: {},
      loadingUnselectedClient: false,
      loadingSelectClient: false,
      clipboard: null,
      renderPopover: false, // 销毁table
      nfsTotal: 0,
      loadingNfs: false,
      allNFS: [],
      selectClientColumn: [
        {
          prop: 'name',
          label: this.$ts('client.name'),
          minWidth: 150
        },
        {
          prop: 'hostname',
          label: this.$ts('client.hostname'),
          minWidth: 120
        },
        {
          slot: 'readOnly',
          prop: 'readOnly',
          label: this.$ts('client.readonlyPermission'),
          width: '120',
          formatter: (__, _, val) => {
            return val ? this.$ts('client.readonly') : this.$ts('client.readWrite')
          }
        },
        {
          slot: 'sync',
          prop: 'sync',
          label: this.$ts('client.sync') + '/' + this.$ts('client.async'),
          width: '120',
          formatter: (__, _, val) => {
            return val ? this.$ts('client.sync') : this.$ts('client.async')
          }
        },
        {
          slot: 'url'
        }
      ],
      form: {
        bucketName: '',
        clientNames: [],
        autoMount: true
      },
      applyModal: false,
      value: ['share'],
      localPopRef: null,
      showPopover: false,
      clientFs: [],
      setQueryIndex: 0,
      setQuerySize: 1000,
      total: 0,
      pageIndex: 1,
      pageSize: 10,
      searchVal: '',
      loading: false,
      tableData: [],
      copyData: [],
      clientColumns: [
        {
          slot: 'name'
        },
        {
          prop: 'type',
          label: this.$ts('tempConfigFile.type')
        },
        {
          prop: 'hostname',
          label: this.$ts('client.hostname')
        },
        {
          slot: 'url'
        }
        // {
        //   prop: 'readOnly',
        //   label: '读写权限',
        //   formatter: (_, __, val) => {
        //     return val ? '只读' : '读写'
        //   }
        // },
        // {
        //   prop: 'sync',
        //   label: '同步/异步',
        //   formatter: (_, __, val) => {
        //     console.log(val,'123')
        //     return val ? '同步' : '异步'
        //   }
        // }
      ],
      columns: [
        {
          title: this.$ts('fileSystem.name'),
          prop: 'fsName',
          minWidth: '200px'
        },
        {
          title: this.$ts('bucket.name'),
          prop: 'bucketName',
          minWidth: '200px'
        },
        // {
        //   title: '是否本地挂载',
        //   prop: 'local'
        // },
        {
          slot: 'action'
        }
      ],
      rules: {
      }
    }
  },
  computed: {
    disabledApply () {
      return this.selApplyClientList.length === 0 || this.loadingAdd
    },
    disableUnapply () {
      return JSON.parse(JSON.stringify(this.selUnapplyClientList)).length === 0 || this.loadingRemove
    }
  },
  watch: {
    searchVal (cur, pre) {
      if (!cur && pre) {
        this.loading = true
        setTimeout(() => {
          this.tableData = JSON.parse(JSON.stringify(this.copyData))
          this.total = this.tableData.length
          this.pageIndex = 1
          this.loading = false
        }, 500)
      } else {
        this.tableData = this.tableData.filter(x => x.bucketName.toLowerCase().indexOf(this.searchVal.toLowerCase()) > -1)
        this.total = this.tableData.length
      }
    }
  },
  destroyed () {
    this.clipboard && this.clipboard.destroy()
  },
  mounted () {
    this.init()
    // this.loading = true
    // // const totalIterations = 100000000
    // // const iterationsPerChunk = 1000000
    // const totalIterations = 10000
    // const iterationsPerChunk = 1000

    // const totalChunks = totalIterations / iterationsPerChunk

    // for (let i = 0; i < totalChunks; i++) {
    //   for (let j = 0; j < iterationsPerChunk; j++) {
    //     this.tableData.push({
    //       label: 'label' + i + j,
    //       value: 'value' + i + j
    //     })
    //   }
    //   if (i == totalChunks - 1) {
    //     console.log(i, totalChunks - 1)
    //     this.loading = false
    //   }
    // }
  },

  methods: {
    copiedMsg: debounce.call(this, function () {
      this.$msg({
        type: 'success',
        text: this.$ts('page.copied')
      })
    }, 200),
    renderSingleStyle (data) {
      if (data.length === 1) {
        return {
          maxWidth: '100%',
          width: '100%'
        }
      }
    },
    renderSingleClass (data) {
      if (data.length == 3) {
        return 'tripleStyle'
      }
    },
    getClientData (clientInfo) {
      const info = clientInfo.nfsInfos
      const samba = clientInfo.sambaInfos
      // const samba = JSON.parse(JSON.stringify(clientInfo.nfsInfos))
      const data = []
      // nfs、samba、
      if (JSON.stringify(info) !== 'null' && info) {
        const nfs = Object.keys(info).reduce((pre, cur) => {
          const item = Object.keys(info[cur]).reduce((p, key) => {
            Object.assign(p, info[cur][key])
            return p
          }, {})
          item.type = 'nfs'
          pre.push(item)
          return pre
        }, [])
        data.push(...nfs)
        // if(index>2){
        //   for (let i = 0; i < index; i++) {
        //   data.push(...JSON.parse(JSON.stringify(nfs)))
        //  }
        // }
      }
      if (JSON.stringify(samba) !== 'null' && samba) {
        const samba = Object.keys(info).reduce((pre, cur) => {
          const item = Object.keys(info[cur]).reduce((p, key) => {
            Object.assign(p, info[cur][key])
            return p
          }, {})
          item.type = 'samba'
          pre.push(item)
          return pre
        }, [])
        data.push(...samba)
        // for (let i = 0; i < index; i++) {
        //   data.push(...JSON.parse(JSON.stringify(nfs)))
        // }
      }
      // console.log(data, clientInfo, 'client')
      return data
    },
    refreshList (type) {
      if (type === 'apply') {
        this.getAppliedClient()
      } else {
        if (this.$refs['nfs']) {
          const {
            pageSize,
            currentPage
          } = this.$refs['nfs']
          this.getNfsClient({
            pageIndex: currentPage,
            pageNum: pageSize
          })
        }
      }
    },
    // 调用getNFSList 需要获取表格分页信息
    confirmApply () {
      const {
        bucketName,
        autoMount
      } = this.form
      const data = {
        bucketName,
        clientNames: this.selApplyClientList.map(x => x.name),
        autoMount
      }
      this.loadingAdd = true
      shareApply(data).then(res => {
        const {
          failed,
          nfsSuccess
        } = res.data
        if (JSON.stringify(failed) === '{}' && JSON.stringify(nfsSuccess) !== '{}') {
          this.$msg({
            type: 'success',
            text: this.$ts('page.responseSuccess')
          })
        } else {
          const errorInfo = Object.keys(failed).reduce((pre, cur) => {
            const item = cur + ':' + this.$ts(failed[cur]) + '\n'
            return pre + item
          }, '')
          this.$msg({
            type: 'error',
            text: errorInfo,
            duration: 5000
          })
        }
      }).finally(() => {
        this.loadingAdd = false
        this.getAppliedClient()
        // this.getNfsClient()
        this.refreshList('unapply')
        // 刷新已选择和clientLisf
        // 刷新list
        this.init()
      })
    },
    confirmUnAppy () {
      const data = {
        bucketName: this.form.bucketName,
        clientNames: this.selUnapplyClientList.map(x => x.name)
      }
      this.loadingRemove = true
      shareUnapply(data).then(() => {
        this.$msg({
          type: 'success',
          text: this.$ts('page.responseSuccess')
        })
      })
        .finally(() => {
          // 刷新已选择和clientLisf
          // 刷新list
          this.loadingRemove = false
          this.getAppliedClient()
          this.refreshList('unapply')
          // this.getNfsClient()
          this.init()
        })
    },
    clearDataTable () {
      this.renderPopover = false
      // 清除表格选择数据及相关配置
    },
    handleApplyChange (val) {
      this.selApplyClientList = JSON.parse(JSON.stringify(val))
    },
    handleUnapplyChange (val) {
      // console.log(val,'1233')
      // 复选异常手动清除组件复选框
      this.selUnapplyClientList = JSON.parse(JSON.stringify(val))
    },
    // 分页
    renderNfsPagination (val) {
      const {
        pageSize,
        pageNumber
      } = val
      this.getNfsClient({
        pageIndex: pageNumber,
        pageNum: pageSize
      })
    },
    getNfsClient (pageReqBody) {
      pageReqBody = pageReqBody || {
        pageIndex: 1,
        pageNum: 10
      }
      const row = this.selectedFs
      pageReqBody.fsId = String(row.fsId)
      this.loadingNfs = true
      // nfs client 新增返回未选中的客户端、移除禁用逻辑
      getUnusedClient(pageReqBody).then(res => {
        this.allNFS = res.data.acls
        this.nfsTotal = res.data.totalCntInDb
      }).finally(() => {
        this.loadingNfs = false
      })
    },
    getClient () {
      // this.renderPopover = true
      this.getNfsClient()
      // 当前NFS、
    },
    cancelSelect () {
      this.$refs['popApplyRef'] && this.$refs['popApplyRef'].doClose()
    },
    setAvailbleClient (val) {
      return this.clientFs.every(x => x.name !== val.name)
    },
    handleShare (row) {
      if (this.localPopRef) {
        this.$refs[this.localPopRef] && this.$refs[this.localPopRef].doClose()
      }
      this.selectedFs = row
      this.form.bucketName = row.bucketName
      this.applyModal = true
      // this.form.clientNames = []
      this.form.autoMount = true
      this.getNfsClient()
      this.getAppliedClient()
      // Promise.allSettled([
      // ]).finally(()=>{
      //   console.log(123,'123')
      //   this.loadingSelectClient= false
      // })
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
        // 初次加载获取所有客户端
        // 获取已共享客户端：过滤未使用客户端到
      })
    },
    getAppliedClient () {
      const row = this.selectedFs
      this.loadingSelectClient = true
      this.clientFs = []
      listFSClient({
        fsId: String(row.fsId)
      }).then(res => {
        this.clientFs = this.getClientData(res.data || [])
      }).finally(() => {
        this.loadingSelectClient = false
      })
    },
    handleResize () {
      window.onresize = () => {
        this.$refs[this.localPopRef] && this.$refs[this.localPopRef].doClose()
      }
    },
    viewClientFs (row) {
      if (this.localPopRef) {
        this.$refs[this.localPopRef] && this.$refs[this.localPopRef].doClose()
      }
      this.showPopover = true
      this.clientFs = []
      this.localPopRef = 'popRef' + String(row.fsId)
      listFSClient({
        fsId: String(row.fsId)
      }).then(res => {
        this.clientFs = this.getClientData(res.data || [])
        // this.clientFs = res.data || []
        // console.log(res, '123')
        // todo
      }).finally(() => {
        this.showPopover = false
      })
    },
    renderAuth (auth) {
      switch (auth) {
        case true:
          return this.$ts('client.readonly')
        case false:
          return this.$ts('client.readWrite')
        default:
          return this.$ts('client.readonly')
      }
    },
    filterBucket (row) {
      this.$router.push({
        name: 'Bucket',
        params: { bucketName: row.bucketName }
      })
    },
    init () {
      // 初始化
      this.setQueryIndex = 0
      this.setQuerySize = 1000
      this.pageIndex = 1
      this.tableData = []
      this.getList({
        pageIndex: this.setQueryIndex,
        pageSize: this.setQuerySize
      })
    },
    getList (query) {
      this.loading = true
      getFsList(query).then((res) => {
        if (res.data.records && !res.data.records.length) {
          this.setQueryIndex = this.setQueryIndex ? this.setQueryIndex - 1 : 0
        }
        this.tableData = this.tableData.concat(res.data.records).map(x => {
          x.clientData = this.getClientData(x)
          return x
        })
        this.copyData = JSON.parse(JSON.stringify(this.tableData))
        this.total = this.tableData.length
        this.clipboard = new ClipboardJS('.copyIcon')
      })
        .finally(() => {
          this.loading = false
        })
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.pageIndex = 1
    },
    handleCurrentChange (val) {
      // 最后一页请求分页
      this.pageIndex = val
      if (Math.ceil(this.total / this.pageSize) === val) {
        this.setQueryIndex = this.setQueryIndex + 1
        this.getList({
          pageIndex: this.setQueryIndex,
          pageSize: this.setQuerySize
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .shareDialog {
  .el-dialog {
    margin-top: 5vh !important;
  }
}

.el-form {
  .el-form-item {
    margin-bottom: 10px;
  }

  .centerMenu {
    .el-button {
      margin-right: 10px;
      padding: 3px 10px;
    }

    margin: 30px 0 10px 0;
    display: flex;
    justify-content: center;

    svg {
      font-size: 18px;
    }
  }

  .el-icon-refresh {
    position: relative;
    top: 10px;
  }
}

::v-deep .el-table {
  .el-table__cell {
    padding: 3px 0;
  }

  .insertTable {
    padding-bottom: 20px;

    .rowFlex {
      display: flex;
      flex-wrap: wrap;

      .flex {
        max-width: 45%;
        width: 40%;
        margin-right: 20px;
        height: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        &.tripleStyle {
          &:nth-of-type(3) {
            max-width: 100%;
            width: 100%;
          }
        }

        .el-tag {
          color: #e39606 !important;
          background-color: #384348;
          border-color: transparent;
          height: 18px;
          line-height: 18px;
          border-radius: 20px;
          margin-right: 10px;
          width: fit-content;
          text-align: center;

          &+div {
            cursor: pointer;
            flex: 1;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;

            .text-box {
              height: 115% !important;
              top: -5px;
            }
          }
        }
      }
    }

    .overText {
      cursor: pointer;
      position: absolute;
      bottom: 30px;
      font-size: 20px;
      margin-left: 10px;
      padding: 3px;
      width: 20px;
      height: 2px;
    }
  }

  .el-table {
    thead {
      display: none;
    }

    .cell {
      line-height: 20px;
      padding-left: 0;

      .text-box {
        top: 0;
      }
    }

    .el-table__body td.el-table__cell {
      padding: 0;
    }
  }
}

// ::v-deep .tableMenu {
//   .el-submenu__title {
//     border-bottom: none !important;
//   }

//   .el-submenu__title {
//     padding: 0;
//     height: 30px;
//     line-height: 30px;

//     .el-button {
//       &+i {
//         display: none;
//       }

//       .el-icon-arrow-down {
//         font-size: 12px;
//         width: 12px;
//         margin-right: 0;
//       }
//     }
//   }
// }
</style>
<!-- <style>
.tableSubMenu {
  .el-menu--popup {
    background-color: #25373f !important;
  }

  ul.el-menu {
    background-color: #19272e !important;

    .el-menu-item:not(.is-disabled):hover {
      color: #d3d6d8 !important;
      background-color: #25373f !important;
    }

    .is-opened div {
      color: #d3d6d8 !important;
    }

    .el-menu-item {
      color: #d3d6d8!important;
      background-color: #19272e !important;
    }

    .el-submenu {
      .el-submenu__title {
        background-color: #19272e !important;
      }

      .el-menu-item {
        background-color: #19272e !important;
      }
    }
  }

  .el-menu--popup {
    min-width: unset;
    width: fit-content;

    .el-menu-item {
      width: fit-content;
      min-width: unset;
    }
  }

  left: 85% !important;
}
</style> -->
