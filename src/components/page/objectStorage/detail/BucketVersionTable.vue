<template>
  <div>
    <el-table
      v-if="!showFileConfig"
      id="bdtable"
      ref="multipleTable"
      v-loading="loading"
      :data="tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
      tooltip-effect="dark"
      style="width: 100%"
      row-key="rowKey"
      max-height="600"
      @sort-change="sortFunction"
    >
      <el-table-column width="40px">
        <template slot-scope="scope">
          <el-tooltip
            placement="top"
            content="复制"
            :open-delay="300"
          >
            <i
              class="el-icon-document-copy"
              style="font-size:15px;"
              @click="copyCode(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="文件名"
        prop="Key"
        min-width="150px"
        sortable
      >
        <template slot-scope="scope">
          <!-- 文件及文件夹 -->
          <!-- 添加文件图标 、树形图示 删除标记的无跳转-->
          <showToolTip
            v-if="scope.row.type=='f'"
            :text="scope.row.Key"
            use-slot
          >
            <a
              v-if="!scope.row.delMarker"
              slot="data"
              class="blue"
              @click="jumpToDetail(scope)"
            >
              <i
                class="fa fa-file-o"
                aria-hidden="true"
              />
              {{ scope.row.Key }}
            </a>
            <span
              v-else
              slot="data"
            >
              <i
                class="fa fa-file-o"
                aria-hidden="true"
              />
              {{ scope.row.Key }}
            </span>
          </showToolTip>

          <showToolTip
            v-if="scope.row.type=='d'"
            :text="scope.row.Prefix"
            use-slot
          >
            <router-link
              slot="data"
              class="blue"
              :to="{ name: 'BucketList', query: { file: false, filename: $route.query.filename ? $route.query.filename + scope.row.Prefix : scope.row.Prefix } }"
            >
              <i
                class="fa fa-folder-open-o"
                aria-hidden="true"
              />{{ scope.row.Prefix }}
            </router-link>
          </showToolTip>

        </template>
      </el-table-column>
      <el-table-column
        label="类型"
        prop="type"
        width="150px"
        sortable="custom"
      >
        <template slot-scope="scope">
          {{ scope.row.delMarker ? '删除标记' : scope.row.type == 'd' ? '文件夹' : getFileType(scope.row.Key) }}
        </template>
      </el-table-column>
      <el-table-column
        label="版本ID"
        prop="VersionId"
        width="200px"
        sortable
      >
        <template slot-scope="scope">
          {{ scope.row.VersionId || '/' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="Size"
        label="大小"
        sortable="custom"
        width="150px"
      >
        <template slot-scope="scope">
          {{ scope.row.delMarker? '/': byteConvert(scope.row.Size) || '/' }}
        </template>
      </el-table-column>
      <!-- <el-table-column
				prop="storageType"
				label="存储类型">
			</el-table-column> -->
      <el-table-column
        prop="LastModified"
        label="修改时间"
        sortable="custom"
        min-width="120px"
      >
        <template slot-scope="scope">
          {{ formatDate(scope.row.LastModified) }}
        </template>
      </el-table-column>

      <!-- <el-table-column
        :label="$ts('action')"
      >
        <template slot-scope="scope">
          <div v-if="scope.row.type=='f'&&scope.row.Key">
            <el-dropdown size="small">
              <el-button type="text">
                更多操作<i class="el-icon-arrow-down el-icon--right" />
              </el-button>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="doDeleteFile(scope.row)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

        </template>
      </el-table-column> -->
    </el-table>
    <div
      v-show="total && !showFileConfig"
      class="page_block"
    >
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="pageSize"
        layout="total,sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 详情页 -->
    <!-- <ObjectDetail v-if="showFileConfig" type="delete" /> -->

    <el-dialog
      v-dialogDrag
      title="添加标签"
      :visible.sync="isAddInfo"
      width="800px"
    >
      <el-row class="mb_15">
        <el-col :span="24">
          <el-table
            ref="addTagTable"
            :data="tableDataInfo"
            border
            tooltip-effect="dark"
            style="width: 100%"
          >
            <el-table-column prop="tagKey">
              <template
                slot="header"
                slot-scope="scope"
              >
                <el-popover
                  slot="label"
                  placement="top"
                  width="300"
                  :open-delay="500"
                  trigger="hover"
                  content="标签键区分大小写，支持 中文, a-z, A-Z, 0-9, +, -, _, =, /, ., :, @ 等字符"
                >
                  <span slot="reference">名称&nbsp;<i class="fa  fa-question-circle" /></span>
                </el-popover>
              </template>
              <template slot-scope="scope">
                <p v-show="!scope.row.isEdit">
                  {{ scope.row.tagKey }}
                </p>
                <el-input
                  v-show="scope.row.isEdit"
                  placeholder=""
                  :value="scope.row.tagKey"
                  size="mini"
                />
              </template>
            </el-table-column>
            <el-table-column prop="tagValue">
              <template
                slot="header"
                slot-scope="scope"
              >
                <el-popover
                  slot="label"
                  placement="top"
                  width="300"
                  :open-delay="500"
                  trigger="hover"
                  content="标签值区分大小写，支持 中文, a-z, A-Z, 0-9, +, -, _, =, /, ., :, @ 等字符"
                >
                  <span slot="reference">标签值&nbsp;<i class="fa  fa-question-circle" /></span>
                </el-popover>
              </template>
              <template slot-scope="scope">
                <p v-show="!scope.row.isEdit">
                  {{ scope.row.tagValue }}
                </p>
                <el-input
                  v-show="scope.row.isEdit"
                  placeholder=""
                  :value="scope.row.tagValue"
                  size="mini"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div
                  v-show="scope.row.isEdit"
                  class="tag_table_a"
                >
                  <el-button
                    type="text"
                    size="mini"
                    @click="scope.row.isEdit = !scope.row.isEdit"
                  >保存</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="scope.row.isEdit = !scope.row.isEdit"
                  >取消</el-button>
                </div>
                <div
                  v-show="!scope.row.isEdit"
                  class="tag_table_a"
                >
                  <el-button
                    type="text"
                    size="mini"
                    @click="doEdit(scope.$index, scope.row)"
                  >编辑</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="doDelete(scope.$index, scope.row)"
                  >删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <p class="moreTag"><el-button
            type="text"
            @click="handleAdd()"
          >添加标签</el-button></p>
        </el-col>
      </el-row>
    </el-dialog>
    <el-dialog
      v-dialogDrag
      title="权限设置"
      :visible.sync="isSetAccess"
      width="800px"
    >
      <h3 class="mb_15">公共权限</h3>
      <el-row class="mb_15">
        <el-col :span="24">
          <el-table
            ref="accessTable"
            :data="tableDataInfo"
            border
            tooltip-effect="dark"
            style="width: 100%"
          >
            <el-table-column prop="tagKey">
              <template
                slot="header"
                slot-scope="scope"
              >
                <el-popover
                  slot="label"
                  placement="top"
                  width="300"
                  :open-delay="500"
                  trigger="hover"
                  content="标签键区分大小写，支持 中文, a-z, A-Z, 0-9, +, -, _, =, /, ., :, @ 等字符"
                >
                  <span slot="reference">名称&nbsp;<i class="fa  fa-question-circle" /></span>
                </el-popover>
              </template>
              <template slot-scope="scope">
                <p v-show="!scope.row.isEdit">
                  {{ scope.row.tagKey }}
                </p>
                <el-input
                  v-show="scope.row.isEdit"
                  placeholder=""
                  :value="scope.row.tagKey"
                  size="mini"
                />
              </template>
            </el-table-column>
            <el-table-column prop="tagValue">
              <template
                slot="header"
                slot-scope="scope"
              >
                <el-popover
                  slot="label"
                  placement="top"
                  width="300"
                  :open-delay="500"
                  trigger="hover"
                  content="标签值区分大小写，支持 中文, a-z, A-Z, 0-9, +, -, _, =, /, ., :, @ 等字符"
                >
                  <span slot="reference">标签值&nbsp;<i class="fa  fa-question-circle" /></span>
                </el-popover>
              </template>
              <template slot-scope="scope">
                <p v-show="!scope.row.isEdit">
                  {{ scope.row.tagValue }}
                </p>
                <el-input
                  v-show="scope.row.isEdit"
                  placeholder=""
                  :value="scope.row.tagValue"
                  size="mini"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div
                  v-show="scope.row.isEdit"
                  class="tag_table_a"
                >
                  <el-button
                    type="text"
                    size="mini"
                    @click="scope.row.isEdit = !scope.row.isEdit"
                  >保存</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="scope.row.isEdit = !scope.row.isEdit"
                  >取消</el-button>
                </div>
                <div
                  v-show="!scope.row.isEdit"
                  class="tag_table_a"
                >
                  <el-button
                    type="text"
                    size="mini"
                    @click="doEdit(scope.$index, scope.row)"
                  >编辑</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="doDelete(scope.$index, scope.row)"
                  >删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <hr class="table_hr">
      <h3 class="mb_15">用户权限</h3>
      <el-row class="mb_15">
        <el-col :span="24">
          <el-table
            ref="userAclTable"
            :data="tableDataInfo"
            border
            tooltip-effect="dark"
            style="width: 100%"
          >
            <el-table-column prop="tagKey">
              <template
                slot="header"
                slot-scope="scope"
              >
                <el-popover
                  slot="label"
                  placement="top"
                  width="300"
                  :open-delay="500"
                  trigger="hover"
                  content="标签键区分大小写，支持 中文, a-z, A-Z, 0-9, +, -, _, =, /, ., :, @ 等字符"
                >
                  <span slot="reference">名称&nbsp;<i class="fa  fa-question-circle" /></span>
                </el-popover>
              </template>
              <template slot-scope="scope">
                <p v-show="!scope.row.isEdit">
                  {{ scope.row.tagKey }}
                </p>
                <el-input
                  v-show="scope.row.isEdit"
                  placeholder=""
                  :value="scope.row.tagKey"
                  size="mini"
                />
              </template>
            </el-table-column>
            <el-table-column prop="tagValue">
              <template
                slot="header"
                slot-scope="scope"
              >
                <el-popover
                  slot="label"
                  placement="top"
                  width="300"
                  :open-delay="500"
                  trigger="hover"
                  content="标签值区分大小写，支持 中文, a-z, A-Z, 0-9, +, -, _, =, /, ., :, @ 等字符"
                >
                  <span slot="reference">标签值&nbsp;<i class="fa  fa-question-circle" /></span>
                </el-popover>
              </template>
              <template slot-scope="scope">
                <p v-show="!scope.row.isEdit">
                  {{ scope.row.tagValue }}
                </p>
                <el-input
                  v-show="scope.row.isEdit"
                  placeholder=""
                  :value="scope.row.tagValue"
                  size="mini"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div
                  v-show="scope.row.isEdit"
                  class="tag_table_a"
                >
                  <el-button
                    type="text"
                    size="mini"
                    @click="scope.row.isEdit = !scope.row.isEdit"
                  >保存</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="scope.row.isEdit = !scope.row.isEdit"
                  >取消</el-button>
                </div>
                <div
                  v-show="!scope.row.isEdit"
                  class="tag_table_a"
                >
                  <el-button
                    type="text"
                    size="mini"
                    @click="doEdit(scope.$index, scope.row)"
                  >编辑</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="doDelete(scope.$index, scope.row)"
                  >删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="isSetAccess = false;">关闭</el-button>
      </div>
    </el-dialog>
    <el-dialog
      v-dialogDrag
      title="重命名对象"
      :visible.sync="isRenameFile"
      width="550px"
    >
      <el-row>
        <el-col :span="4">
          <div class="rename_icon_wrap">
            <i
              class="fa fa-pencil-square-o "
              aria-hidden="true"
            />
          </div>
        </el-col>
        <el-col :span="20">
          <p class="rename_word_title">您即将重命名 <strong>{{ oldFileName }}</strong> 为：</p>
          <el-input
            ref="tableFocus"
            v-model="newFileName"
            size="mini"
            class="rename_input"
            auto-complete="off"
            clearable
          />
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary">{{ $ts('button.confirm') }}</el-button>
        <el-button @click="isRenameFile = false;">{{ $ts('button.cancel') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import ObjectDetail from '@/components/page/objectStorage/detail/ObjectDetail'
export default {
  components: {
    // ObjectDetail
  },
  filters: {
    toVersionWord: function(id) {
      if (id == '1') {
        return '版本ID: null'
      } else {
        return '版本ID: ' + id
      }
    }
  },
  props: {
    searchVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      isAddInfo: false,
      isSetAccess: false,
      isRenameFile: false,
      tableDataInfo: [],
      tableData: [],
      copyData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      order: '',
      prop: '',
      col: [],
      newFileName: '',
      oldFileName: '',
      NextKeyMarker: '',
      VersionIdMarker: '',
      perCount: 1000
    }
  },
  computed: {
    showFileConfig() {
      if (
        this.$route.query.filename &&
        String(this.$route.query.file) == 'true'
      ) {
        this.$emit('hideMenu', true)
        return true
      } else {
        this.$emit('hideMenu', false)
        return false
      }
    }
  },
  watch: {
    $route(to, from) {
      this.currentPage = 1
    },
    loading(val) {
      if (val) {
        this.$emit('disablePathClick', true)
      } else {
        this.$emit('disablePathClick', false)
      }
    },
    searchVal(cur, pre) {
      if (!cur && pre) {
        this.listObject()
        // this.loading = true
        // setTimeout(() => {
        //   this.tableData = JSON.parse(JSON.stringify(this.copyData))
        //   this.total = this.tableData.length
        //   this.currentPage = 1
        //   this.loading = false
        // }, 500)
      }
    }
  },
  mounted: function() {
    this.listObject()
  },
  methods: {
    copyCode(row) {
      const str = row.type == 'f' ? row.Key : row.type == 'd' ? row.Prefix : ''
      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        this.$ts({
          type: 'success',
          text: '复制成功'
        })
        return navigator.clipboard.writeText(str)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = str
        document.body.append(textarea)
        textarea.select()
        this.$ts({
          type: 'success',
          text: '复制成功'
        })
        return new Promise((res, rej) => {
          document.execCommand('copy') ? res() : rej()
          textarea.remove()
        })
      }
    },
    jumpToDetail(scope) {
      this.$router.push({
        name: 'ObjectDetail',
        query: {
          filename: this.$route.query.filename
            ? this.$route.query.filename + scope.row.Key
            : scope.row.Key,
          file: true,
          IsLatest: scope.row.IsLatest,
          VersionId: scope.row.VersionId,
          type: 'delete'
        }
      })
    },
    cellcb(row) {
      // 文件夹禁用删除、先隐藏不显示
      // 隐藏版本id的row
      // && row.row.type !== 'd'
      if (!row.row.Key) {
        // 隐藏同一版本
        return 'myCell'
      }
    },
    dialogOpen(e) {
      const ipt = e
      this.$nextTick(function() {
        this.$refs[ipt].$el.querySelector('input').focus()
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      console.log(
        this.VersionIdMarker,
        this.NextKeyMarker,
        val,
        Math.floor(this.total / this.pageSize)
      )
      if (this.NextKeyMarker && val === Math.ceil(this.total / this.pageSize)) {
        this.listObject(true)
      }
      this.currentPage = val
    },
    toggleSelection(rows) {
      // 切换勾选看状态,传递绑定table的item
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    sortFunction(val) {
      this.prop = val.prop
      this.order = val.order
      this.tableData.sort(this.sortMethod(val.prop, val.order))
    },
    sortMethod(prop, order, props) {
      const _this = this
      return function(obj1, obj2) {
        if (prop == '' || order == '') {
          return 0
        }
        const propArr = prop && prop.split('.')
        let val1
        let val2
        if (propArr && propArr.length > 1) {
          val1 = obj1[propArr[0]] && obj1[propArr[0]][propArr[1]]
          val2 = obj2[propArr[0]] && obj2[propArr[0]][propArr[1]]
        } else if (prop === 'type') {
          val1 = _this.getFileType(obj1['Key'])
          val2 = _this.getFileType(obj2['Key'])
        } else {
          val1 = obj1[prop] || obj1[props]
          val2 = obj2[prop] || obj2[props]
        }
        if (val1 == null) {
          val1 = ''
        }
        if (val2 == null) {
          val2 = ''
        }
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
          val1 = Number(val1)
          val2 = Number(val2)
        }
        if (val1 < val2) {
          if (order == 'ascending') {
            return -1
          } else {
            return 1
          }
        } else if (val1 > val2) {
          if (order == 'ascending') {
            return 1
          } else {
            return -1
          }
        } else {
          return 0
        }
      }
    },
    doModifyAccess: function(row) {
      this.$emit('doModifyAccess', row)
    },
    doDeleteFolder: function(row) {
      this.$emit('doDeleteFolder', row)
    },
    // doDeleteFile: function (row) {
    //   this.$emit('doDeleteFile', row)
    // },
    doAddInfo: function(row) {
      this.isAddInfo = true
    },
    doSetAccess: function(row) {
      this.isSetAccess = true
    },
    doRenameFile: function(row) {
      this.isRenameFile = true
      this.oldFileName = row.name
      this.newFileName = row.name
    },
    searchPrefix() {
      this.currentPage = 1
      this.listObject()
      // this.tableData = this.filterSearch(this.copyData, this.searchVal)
      // this.total = this.tableData.length
      // this.currentPage = 1
    },
    listObject(flag) {
      this.loading = true
      let params = {}
      const searchVal = this.searchVal[this.searchVal.length - 1] === '/' ? this.searchVal.substring(0, this.searchVal.length - 1) : this.searchVal

      const Prefix = this.$route.query.filename ? this.$route.query.filename + searchVal : searchVal
      if (flag) {
        params = {
          Bucket: this.$route.params.id,
          Prefix,
          Delimiter: '/',
          KeyMarker: this.NextKeyMarker,
          VersionIdMarker: this.VersionIdMarker || null,
          MaxKeys: this.perCount
        }
      } else {
        params = {
          Bucket: this.$route.params.id,
          Prefix,
          Delimiter: '/',
          MaxKeys: this.perCount
          // KeyMarker: "",
          // VersionIdMarker: ""
          // IsTruncated: true
          // KeyMarker: 'plainText1',
          // VersionIdMarker: '1767973390947749080'
        }
      }
      // console.log(params, "123");
      this.$store.state._S3.listObjectVersions(params, (err, response) => {
        if (err) {
          this.showS3Msg(err)
          this.loading = false
          console.log(err)
        } else {
          if (!flag) {
            this.tableData = []
            this.currentPage = 1
          }
          let pathStrArr = []

          // CommonPrefixes对应文件夹
          // tpye区分文件目录D 和 单独文件F，根据所有数据重复的key过滤
          for (let i = 0; i < response.CommonPrefixes.length; i++) {
            response.CommonPrefixes[i].type = 'd'
            pathStrArr = response.CommonPrefixes[i].Prefix.split('/')
            response.CommonPrefixes[i].Prefix =
              pathStrArr[pathStrArr.length - 2] + '/'
            response.CommonPrefixes[i].rowKey =
              response.CommonPrefixes[i].Prefix
            this.tableData.push(response.CommonPrefixes[i])
          }

          // 删除标记的file
          for (let i = 0; i < response.DeleteMarkers.length; i++) {
            response.DeleteMarkers[i].type = 'f'
            pathStrArr = response.DeleteMarkers[i].Key.split('/')
            response.DeleteMarkers[i].Key = pathStrArr[pathStrArr.length - 1]
            if (!response.DeleteMarkers[i].Key) continue
            // response.DeleteMarkers[i].ObjName = this.getShort(
            //   response.DeleteMarkers[i].Key
            // )
            // IsLatest true 指定对象是不是对象的最新版本
            // if (response.DeleteMarkers[i].IsLatest) {
            //   response.DeleteMarkers[i].ObjName
            // }
            response.DeleteMarkers[i].delMarker = true
            response.DeleteMarkers[i].rowKey =
              response.DeleteMarkers[i].VersionId
            this.tableData.push(response.DeleteMarkers[i])
          }
          // 文件的版本信息
          for (let j = 0; j < response.Versions.length; j++) {
            response.Versions[j].type = 'f'
            pathStrArr = response.Versions[j].Key.split('/')
            // 返回Key 带有当前object 目录前缀
            response.Versions[j].Key = pathStrArr[pathStrArr.length - 1]
            if (!response.Versions[j].Key) continue
            // response.Versions[j].ObjName = this.getShort(
            //   response.Versions[j].Key
            // )
            // if (response.Versions[j].IsLatest) {
            //   response.Versions[j].ObjName += ' (最新版本)'
            //   console.log(response.Versions[j], '')
            // }
            response.Versions[j].VersionId = response.Versions[j].VersionId == 'null' ? '' : response.Versions[j].VersionId
            response.Versions[j].rowKey = response.Versions[j].Key + '__' + response.Versions[j].VersionId
            this.tableData.push(response.Versions[j])
          }
          // console.log(this.tableData, 'version')
          this.NextKeyMarker = response.NextKeyMarker
          this.VersionIdMarker = response.NextVersionIdMarker
          // this.tableData = this.filterSearch(this.tableData, this.searchVal)
          // this.forMateTableData(this.tableData)
          // this.copyData = JSON.parse(JSON.stringify(this.tableData))
          this.tableData.sort(this.sortMethod(this.prop, this.order))
          this.total = this.tableData.length
          this.loading = false
          if (
            this.total &&
            Math.ceil(this.total / this.pageSize) < this.currentPage
          ) {
            this.currentPage = Math.ceil(this.total / this.pageSize)
          }
        }
      })
    },
    // forMateTableData (data) {
    //   const result = []
    //   const obj = {}
    //   for (let i = 0; i < data.length; i++) {
    //     // console.log(data[i].VersionId, 'verions')
    //     if (data[i].Prefix) {
    //       obj[data[i].Prefix] = true
    //     }
    //     if (data[i].Key) {
    //       obj[data[i].Key] = true
    //     }
    //     if (data[i].VersionId) {
    //       obj[data[i].VersionId] = true
    //     }
    //   }
    //   for (const key in obj) {
    //     for (let i = 0; i < data.length; i++) {
    //       if ((data[i].VersionId || data[i].Key || data[i].Prefix) === key) {
    //         //  无prefix 匹配
    //         data[i].rowKey = data[i].Key
    //           ? data[i].VersionId + data[i].Key
    //           : data[i].Prefix
    //         result.push(data[i])
    //         break
    //       }
    //     }
    //   }
    //   // console.log(result);
    //   this.tableData = result
    //   // // 过滤key后的list resultKeyArrKey 确保唯一
    //   // resultKeyArr = this.unique(resultKeyArr);
    //   // for (let i = 0; i < resultKeyArr.length; i++) {
    //   //   // const childrenArr = []
    //   //   // const markerObj = Object.create(null)
    //   //   // markerObj.rowKey = i + 1
    //   //   // markerObj.type = 'f'
    //   //   // markerObj.ObjName = resultKeyArr[i]
    //   //   for (let j = 0; j < data.length; j++) {
    //   //     // 通过唯一key，找到对应data中 删除和容器中两条数据
    //   //     if (resultKeyArr[i] == data[j].Key) {
    //   //       data[j].rowKey = data[j].VersionId + data[j].Key;
    //   //       // childrenArr.push(data[j])
    //   //       result.push(data[j]);
    //   //     }
    //   //   }
    //   //   // markerObj.children = childrenArr
    //   //   // result.push(markerObj)
    //   // }
    //   // this.tableData = result;
    // },
    unique(arr) {
      if (!Array.isArray(arr)) {
        return
      }
      var array = []
      for (var i = 0; i < arr.length; i++) {
        if (array.indexOf(arr[i]) === -1) {
          array.push(arr[i])
        }
      }
      return array
    },
    // getShort (str) {
    //   if (!str) {
    //     return ''
    //   }
    //   return str.length > 60 ? str.substring(0, 60) + '...' : str
    // },
    filterSearch: function(tableData, searchVal) {
      const search = searchVal.toLowerCase()
      if (search) {
        return tableData.filter(data => {
          if (data.type == 'f') {
            return data.Key.toLowerCase().indexOf(search) > -1
          } else if (data.type == 'd') {
            return data.Prefix.toLowerCase().indexOf(search) > -1
          }
        })
      }
      return tableData
    }
  }
}
</script>
<style scoped lang="scss">
.fa:hover::after {
  display: none;
}

.fa-pencil {
  display: none;
  cursor: pointer;
  margin-left: 5px;
  font-size: 14px;
}

.fa-folder-open-o,
.fa-file-o {
  margin-right: 5px;
  font-size: 14px;
  color: #b3c0cd;
}

#bdtable tr:hover .fa-pencil {
  display: inline-block;
}
</style>
