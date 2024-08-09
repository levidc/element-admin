<template>
  <div>
    <el-table
      v-if="!showFileConfig"
      id="bdtable"
      ref="multipleTable"
      v-loading="loading"
      :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      tooltip-effect="dark"
      style="width: 100%"
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
        sortable="custom"
        prop="Prefix"
        min-width="150px"
      >
        <template slot-scope="scope">
          <showToolTip
            v-if="scope.row.type=='f'"
            :text="scope.row.Key"
            use-slot
          >
            <a
              slot="data"
              class="blue"
              @click="goToFile(scope.row)"
            >
              <i
                class="fa fa-file-o"
                aria-hidden="true"
              />
              {{ scope.row.Key }}
            </a>
          </showToolTip>
          <showToolTip
            v-if="scope.row.type=='d'"
            :text="scope.row.Prefix"
            use-slot
          >
            <router-link
              slot="data"
              class="blue"
              :to="{name: 'BucketList',query:{file:false,filename:$route.query.filename?$route.query.filename+scope.row.Prefix:scope.row.Prefix}}"
            >
              <i
                class="fa fa-folder-open-o"
                aria-hidden="true"
              />
              {{ scope.row.Prefix }}
            </router-link>
          </showToolTip>
        </template>
      </el-table-column>
      <el-table-column
        prop="type"
        label="类型"
        sortable="custom"
        width="200px"
      >
        <template slot-scope="scope">
          {{ scope.row.type=='f'?getFileType(scope.row.Key): '文件夹' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="Size"
        label="大小"
        sortable="custom"
        width="200px"
      >
        <template slot-scope="scope">
          {{ byteConvert(scope.row.Size) }}
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
          <div v-if="scope.row.type=='f'">
            <el-dropdown size="small">
              <el-button type="text" style="margin-left:-10px">
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
      v-show="total&&!showFileConfig"
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

    <!-- 对象详情页 -->
    <!-- <ObjectDetail v-if="showFileConfig" type="content" /> -->
    <el-dialog
      v-dialogDrag
      title="添加标签"
      :visible.sync="isAddInfo"
      width="800px"
    >
      <el-row class="mb_15">
        <el-col :span="24">
          <el-table
            ref="multipleTable"
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
                    @click="scope.row.isEdit=!scope.row.isEdit"
                  >保存</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="scope.row.isEdit=!scope.row.isEdit"
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
            ref="multipleTable"
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
                    @click="scope.row.isEdit=!scope.row.isEdit"
                  >保存</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="scope.row.isEdit=!scope.row.isEdit"
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
            ref="multipleTable"
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
                    @click="scope.row.isEdit=!scope.row.isEdit"
                  >保存</el-button>
                  <el-button
                    type="text"
                    size="mini"
                    @click="scope.row.isEdit=!scope.row.isEdit"
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
  props: {
    searchVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      rDetail: false,
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
      nextToken: '',
      StartAfter: '',
      perCount: 1000
    }
  },
  computed: {
    showFileConfig() {
      // 控制显示对象详情页
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
  mounted() {
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
    goToFile(row) {
      this.$router.push({
        name: 'ObjectDetail',
        query: {
          filename: this.$route.query.filename
            ? this.$route.query.filename + row.Key
            : row.Key,
          file: true,
          type: 'content'
        }
      })
    },
    cellcb(row) {
      // 删除文件 区分 对象和文件夹？
      // if (row.row.type === 'd' && row.columnIndex === 0) {
      //   return 'myCell'
      // }
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
      if (this.StartAfter && val == Math.ceil(this.total / this.pageSize)) {
        // console.log('lastPage', this.StartAfter)
        this.listObject(true)
      }
      this.currentPage = val
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    sortFunction(val) {
      this.prop = val.prop || ''
      this.order = val.order || ''
      this.tableData.sort(this.sortMethod(this.prop, this.order, 'Key'))
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
    // doDeleteFolder: function (row) {
    //   this.$emit('doDeleteFolder', row)
    // },
    // doDeleteFile: function (row) {
    //   this.$emit('doDeleteFile', row)
    // },
    // doAddInfo: function (row) {
    //   this.isAddInfo = true
    // },
    doSetAccess: function(row) {
      this.isSetAccess = true
    },
    doRenameFile: function(row) {
      this.isRenameFile = true
      this.oldFileName = row.name
      this.newFileName = row.name
    },
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
    },
    // 过滤接口接入不到、超过1000、本地缓存数据、做过滤
    searchPrefix() {
      this.currentPage = 1
      this.listObject()
      // this.tableData = this.filterSearch(JSON.parse(JSON.stringify(this.copyData)), this.searchVal)
      // this.total = this.tableData.length
      // this.currentPage = 1
    },
    listObject(flag) {
      // flag 重置不做缓存
      this.loading = true
      // 跳转需要重置页数、当请求超过最大对象数量时、需要在此时判断其页数
      // this.currentPage = 1
      const searchVal = this.searchVal[this.searchVal.length - 1] === '/' ? this.searchVal.substring(0, this.searchVal.length - 1) : this.searchVal

      const Prefix = this.$route.query.filename ? this.$route.query.filename + searchVal : searchVal
      let params = {}
      if (flag) {
        params = {
          Bucket: this.$route.params.id,
          Prefix,
          Delimiter: '/',
          StartAfter: this.StartAfter,
          MaxKeys: this.perCount
          // MaxKeys: 100
        }
      } else {
        params = {
          Bucket: this.$route.params.id,
          Prefix,
          Delimiter: '/',
          MaxKeys: this.perCount
          // MaxKeys: 100
          // StartAfter: this.StartAfter
        }
      }
      // console.log('%c StartAfter', 'color:lime;font-size:20px')
      // console.log(this.StartAfter)
      this.$store.state._S3.listObjectsV2(params, (err, data) => {
        if (err) {
          if (err.code === 'NoSuchBucket') {
            this.$router.push({ name: 'Bucket' })
            return
          }
          this.showS3Msg(err)
          this.loading = false
          console.dir(err)
        } else {
          if (!flag) {
            this.tableData = []
            this.currentPage = 1
          }
          let pathStrArr = []

          for (let i = 0; i < data.CommonPrefixes.length; i++) {
            data.CommonPrefixes[i].type = 'd'
            pathStrArr = data.CommonPrefixes[i].Prefix.split('/')
            // 路径都取相当于根目录的一级路径prefix
            data.CommonPrefixes[i].Prefix =
              pathStrArr[pathStrArr.length - 2] + '/'
            this.tableData.push(data.CommonPrefixes[i])
          }
          for (let i = 0; i < data.Contents.length; i++) {
            data.Contents[i].type = 'f'
            // pathStrArr = data.Contents[i].Key.split('/')
            // 请求prefix作为分隔当前key的存在、匹配第一个
            try {
              const flag = JSON.parse(data.Contents[i].ETag) === 'null' || JSON.parse(data.Contents[i].ETag) === 'empty' || !data.Contents[i].Key
              if (flag) {
                continue
              }
            } catch (error) {
              continue
            }
            // 特殊校验 Prefix 此处为空Content
            if (Prefix && data.Contents[i].Key === Prefix && data.Contents[i].Size == 0 && data.Contents[i].Key[data.Contents[i].Key.length - 1] === '/') continue
            data.Contents[i].Key = this.$route.query.filename ? data.Contents[i].Key.split(this.$route.query.filename)[1] : data.Contents[i].Key
            // data.Contents[i].Key = data.Contents[i].Key + Math.random() + Math.random()
            this.tableData.push(data.Contents[i])
          }
          // 后续请求无超过maxKey,则表示无后续数据
          if (
            (data.CommonPrefixes && data.CommonPrefixes.length) +
            (data.Contents && data.Contents.length) == this.perCount
          ) {
            this.StartAfter =
              this.tableData &&
              this.tableData.length &&
              (this.tableData[this.tableData.length - 1].Key ||
                this.tableData[this.tableData.length - 1].Prefix)
          } else {
            this.StartAfter = ''
          }
          // this.tableData = this.filterSearch(this.tableData, this.searchVal)
          this.tableData.sort(this.sortMethod(this.prop, this.order))
          // this.forMateTableData(this.tableData)
          // this.copyData = JSON.parse(JSON.stringify(this.tableData))
          // this.tableData[0].type = 'd'
          // this.tableData[0].Prefix = this.tableData[0].Key + Math.random() + Math.random()
          this.total = this.tableData.length

          if (
            this.total &&
            Math.ceil(this.total / this.pageSize) < this.currentPage
          ) {
            this.currentPage = Math.ceil(this.total / this.pageSize)
          }
          // console.log(this.tableData, 'table')
          this.loading = false
        }
      })
    },
    forMateTableData(data) {
      //
      const result = []
      const obj = {}
      for (let i = 0; i < data.length; i++) {
        if (data[i].Prefix) {
          obj[data[i].Prefix] = true
        } else if (data[i].Key) {
          obj[data[i].Key] = true
        }
        // 文件夹prefix、对象Key 确保唯一
      }
      // console.log("%c length", "color:lime");
      // console.log(obj);
      // console.log(Object.keys(obj).length);
      for (const key in obj) {
        for (let i = 0; i < data.length; i++) {
          if ((data[i].Key || data[i].Prefix) === key) {
            result.push(data[i])
            break
          }
        }
      }
      // console.log(result);
      this.tableData = result
    }
  }
}
</script>
<style lang="scss" scoped>
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
