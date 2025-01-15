<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 clearfix">
        <el-button v-access="'admin:CreateBucket'" class="golden" type="primary" @click="handleCreate">{{
          $ts("page.create")
        }}</el-button>
        <div class="right">
          <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
            <i class="el-icon-refresh" @click="searchVal = ''; refreshList(true)" />
          </el-tooltip>
        </div>
        <!-- <el-input v-model="searchVal" class="search_style search_btn right with_search mr_10" placeholder="存储桶名过滤"
          clearable /> -->
      </div>
      <!-- <el-tabs v-model="tagName" /> -->
      <DataTable ref="DataTable" :table-data="tableData" pagination :columns="columns" :loading="loading"
        style="width: 100%;" :page-obj="{ currentPage: 1, pageSize: 10 }" :total="total"
        @renderPagination="renderPagination">
        <el-table-column slot="action" :label="$ts('page.action')" width="150px" fixed="right">
          <template slot-scope="scope">
            <el-dropdown size="small">
              <el-button type="primary" class="blue">
                {{ $ts('page.action') }}<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-popover :ref="`popRef` + String(scope.row.id)" placement="left" width="600" trigger="click"
                  @after-enter="handleResize">
                  <p style="color: #d3d6d8;margin-bottom: 20px;font-size: 16px">{{ $ts('client.fileSystem') }}</p>
                  <DataTable :table-data="clientFs" :loading="showPopover" :columns="fsColumns" />
                  <el-dropdown-item slot="reference" @click.native="viewClientFs(scope.row)">{{
                    $ts('client.viewClientFs') }}</el-dropdown-item>
                </el-popover>
                <el-dropdown-item @click.native="handleDelete(scope.row)">{{ $ts('page.delete') }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </DataTable>
    </div>
    <el-dialog v-if="isDelete" :title="$ts('client.deleteClient')" :visible.sync="isDelete" width="30%">
      <p>{{ $ts('client.deleteTip') }}</p>
      <span class="dialogDrag_Obj">IP:{{ selectedData.name }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button class="blue" @click="isDelete = false">{{ $ts('page.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="isDelete = false; doDelete()">{{ $ts('page.confirm')
          }}</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="$ts('client.createClient')" :visible.sync="modal" width="680px" @open="dialogOpen('tableFocus')">
      <el-form ref="createForm" :model="createForm" :rules="createRules" size="mini" label-width="100px"
        style="padding:0 5%;">
        <el-form-item :label="$ts('client.name')" prop="name">
          <el-input ref="tableFocus" v-model="createForm.name"
            :placeholder="$ts('validate.iptItem', { name: $ts('client.name') })" />
        </el-form-item>
        <el-form-item :label="$ts('client.hostname')" prop="hostname">
          <el-input v-model="createForm.hostname" auto-complete="off" clearable
            :placeholder="$ts('validate.iptItem', { name: $ts('client.hostname') })" />
        </el-form-item>
        <el-row>
          <el-col :span="24">
            <el-form-item :label="$ts('client.readonlyPermission')" prop="readonly">
              <el-radio v-model="createForm.readonly" :label="true">{{ $ts('client.readonly') }}</el-radio>
              <el-radio v-model="createForm.readonly" :label="false">{{ $ts('client.readWrite') }}</el-radio>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="$ts('client.sync') + '/' + $ts('client.async')" prop="sync">
              <el-radio-group v-model="createForm.sync">
                <el-radio :label="true">{{ $ts('client.sync') }}</el-radio>
                <el-radio :label="false">{{ $ts('client.async') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="blue" @click="modal = false">{{ $ts('page.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmCreate('createForm')">{{ $ts('page.confirm')
          }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import {
  getNfsClientList,
  createNfsClient,
  getNfsClient,
  deleteNfsClient,
  listClientFS
}
  from '@/api/bucket'
// let count = 0
export default {
  name: '',
  components: {},
  props: {},
  data () {
    return {
      localPopRef: null,
      clientFs: [],
      showPopover: false,
      selectedData: {},
      isDelete: false,
      total: 0,
      tableData: [],
      loading: false,
      modal: false,
      searchVal: '',
      tagName: 'nfs',
      createForm: {
        hostname: '',
        readonly: false,
        sync: true,
        name: ''
      },
      fsColumns: [
        {
          prop: 'fsName',
          label: this.$ts('fileSystem.name')
        },
        {
          prop: 'ro',
          label: this.$ts('client.readWritePermission'),
          formatter: (_, __, val) => {
            switch (val) {
              case true:
                return this.$ts('client.readonly')
              case false:
                return this.$ts('client.readWrite')
              default:
                return this.$ts('client.readonly')
            }
          }
        }
      ],
      columns: [
        {
          prop: 'name',
          label: this.$ts('client.name'),
          fixed: 'left',
          minWidth: 150
        },
        {
          prop: 'hostname',
          label: this.$ts('client.hostname'),
          minWidth: 140
        },
        {
          prop: 'readOnly',
          label: this.$ts('client.readonlyPermission'),
          minWidth: 100,
          formatter: (__, _, val) => {
            return val ? this.$ts('client.readonly') : this.$ts('client.readWrite')
          }
        },
        {
          prop: 'sync',
          label: this.$ts('client.sync') + '/' + this.$ts('client.async'),
          minWidth: 100,
          formatter: (__, _, val) => {
            return val ? this.$ts('client.sync') : this.$ts('client.async')
          }
        },
        {
          slot: 'action'
        }
      ],
      createRules: {
        name: {
          required: true,
          message: this.$ts('validate.iptItem', this.$ts('client.name')),
          trigger: ['blur', 'change']
        },
        hostname: [
          {
            required: true,
            trigger: ['blur', 'change'],
            validator: (_, val, cb) => {
              const reg = /^((http|https):\/\/)?((([0-9]{1,3}\.){3}[0-9]{1,3})|(([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}))(:(([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])))?$/
              if (!val) {
                return cb(this.$ts('validate.iptItem', this.$ts('client.hostname')))
              } else if (!reg.test(val)) {
                return cb(this.$ts('client.hostnameReg'))
              } else {
                return cb()
              }
            }
          }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created () { },
  mounted () {
    // this.mock()
    this.init()
  },
  methods: {
    handleResize () {
      window.onresize = () => {
        this.$refs[this.localPopRef] && this.$refs[this.localPopRef].doClose()
      }
    },
    mock () {
      const length = 52
      this.tableData = Array.from({ length }, (i, d) => {
        // console.log(i, 'd', d)
        return {
          name: d,
          hostname: d,
          readonly: d % 2 == 0,
          sync: d % 2 != 0
        }
      })
      this.total = this.tableData.length
      this.tableData = this.tableData.slice(0, 10)
    },
    doDelete () {
      deleteNfsClient({
        nfsClientName: this.selectedData.name
      }).then(res => {
        this.$msg({
          type: 'success',
          text: this.$ts('page.responseSuccess')
        })
      }).finally(() => {
        this.isDelete = false
        this.refreshList()
      })
    },
    handleDelete (row) {
      this.selectedData = row
      this.isDelete = true
    },
    renderPagination (val) {
      const {
        pageSize,
        pageNumber
      } = val
      this.init({
        pageIndex: pageNumber,
        pageNum: pageSize
      })
    },
    init (pageReqBody) {
      pageReqBody = pageReqBody || {
        pageIndex: 1,
        pageNum: 10
      }
      this.loading = true
      getNfsClientList(pageReqBody).then(res => {
        this.tableData = res.data.acls
        this.total = res.data.totalCntInDb
      }).finally(() => {
        this.loading = false
        // const length = 52 - count * 10
        // this.tableData = Array.from({ length }, (i, d) => {
        //   // console.log(i, 'd', d)
        //   return {
        //     hostname: d,
        //     readonly: d % 2 == 0,
        //     sync: d % 2 != 0
        //   }
        // })
        // this.total = this.tableData.length
        // this.tableData = this.tableData.slice(0, 10)
        // count += 1
      })
    },
    handleCreate () {
      this.modal = true
      this.createForm = {
        hostname: '',
        readonly: false,
        sync: true,
        name: ''
      }
      this.$nextTick(() => {
        this.$refs['createForm'].clearValidate()
      })
    },
    dialogOpen (e) {
      this.$nextTick(function () {
        this.$refs[e].$el.querySelector('input').focus()
      })
    },
    confirmCreate (e) {
      this.$refs[e].validate((valid) => {
        const {
          hostname,
          readonly,
          sync, name
        } = this.createForm
        createNfsClient({
          hostname,
          readonly,
          sync,
          name
        }).then(res => {
          this.$msg({
            type: 'success',
            text: this.$ts('page.responseSuccess')
          })
          console.log(res, '123')
          this.modal = false
        }).finally(() => {
          this.refreshList()
        })
      })
    },
    // 测试刷新后、数据减少、导致当前currentPage不存在场景、自动跳转?
    // 创建或者更新删除数据跳转1页、需同步分页器数据
    refreshList (flag = false) {
      if (this.$refs['DataTable']) {
        const {
          pageSize,
          currentPage
        } = this.$refs['DataTable']
        this.init({
          pageIndex: flag ? currentPage : 1,
          pageNum: pageSize
        })
        if (!flag) {
          this.$refs['DataTable'].currentPage = 1
        }
      }
    },
    // 查看关联fs
    viewClientFs (row) {
      // this.showPopover = true
      // setTimeout(() => {
      //   this.clientFs = [{

      //   }]
      //   this.showPopover = false
      // }, 1500);
      if (this.localPopRef) {
        this.$refs[this.localPopRef] && this.$refs[this.localPopRef].doClose()
      }
      this.showPopover = true
      this.localPopRef = 'popRef' + String(row.id)
      this.clientFs = []
      listClientFS({
        clientName: row.name
      }).then(res => {
        this.clientFs = res.data || []
        // this.clientFs.push(...Array.from({ length: 10 }, (_, i) => { return { id: i } }))
        // console.log(res, '123')
      }).finally(() => {
        this.showPopover = false
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
