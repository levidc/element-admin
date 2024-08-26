<template>
  <div class="mv_10">
    <div v-access="'s3:ListBucket'">
      <el-header class="bdetail_header">
        <span
          class="bdetail_title"
          style="margin-top:-2px"
        >文件路径:</span>
        <span
          v-for="(item, index) in routeArr"
          :key="item + index"
          class="bdetail_title"
        >
          <router-link
            :is="disabledUrl ? 'span' : 'router-link'"
            v-if="index == 0"
            class="blue"
            :to="{ name: 'BucketList' }"
          >
            {{ item }}
            <span
              role="presentation"
              class="el-breadcrumb__separator"
            >&gt;</span>
          </router-link>
          <router-link
            :is="disabledUrl ? 'span' : 'router-link'"
            v-else-if="index !== 0 && index !== routeArr.length - 1"
            class="blue"
            :to="{ name: 'BucketList', query: { filename: directoryPath(item) + '/' } }"
          >
            {{ item + '/' }}
            <span
              role="presentation"
              class="el-breadcrumb__separator"
            >&gt;</span>
          </router-link>
          <span v-else>{{ item }}</span>
        </span>
      </el-header>
      <div class="bucket-detail">
        <div
          v-loading="loading"
          class="bucket-detail-inner"
        >
          <div
            v-show="!hideMenuFlag"
            class="mb_15 mt-10 clearfix"
          >
            <!-- <el-button v-access="'s3:PutObject'" type="primary" @click="clearFileInput();isCreate=true">上传文件</el-button> -->
            <!-- <el-button type="primary" :disabled="deleteButtonDisabled" @click="doMulDel()">批量删除</el-button> -->
            <div class="right">
              <el-tooltip
                content="刷新"
                placement="top"
                effect="dark"
              >
                <i
                  class="el-icon-refresh"
                  @click="refresh();searchVal=''"
                />
              </el-tooltip>
            </div>
            <el-input
              v-model="searchVal"
              class="search_style right mr_10"
              style="width:300px;top:-2px;"
              placeholder="支持前缀查找对象，按“Enter”键查询"
              clearable
              @input="val=>searchVal=val.replace(/\/\//g,'')"
              @keyup.enter.native="listObject"
            >
              <!-- <el-button
                slot="append"
                style="background: #ff8746;border-color: #ff8746;color: #3c4c54;position: relative;top:-1px;"
                type="primary"
                plain
                icon="fa fa-search"
                @click="listObject"
              /> -->
            </el-input>
            <span
              v-if="versionControl != 'Suspended'"
              v-access="'s3:GetBucketVersioning'"
            >
              <span style="margin:0 10px">列出历史版本</span>
              <el-switch
                v-model="showHistory"
                :disabled="disabledUrl"
                @change="changeShowStatus()"
              />
            </span>

          </div>
          <BucketVersionTable
            v-if="versionControl != 'Suspended' && showHistory"
            ref="bucketdetailtable"
            class="mt_10"
            :search-val="searchVal"
            @hideMenu="hideMenu"
            @disablePathClick="disablePathClick"
          />
          <BucketDetailTable
            v-else
            ref="bucketdetailtable"
            class="mt_10"
            :search-val="searchVal"
            @hideMenu="hideMenu"
            @disablePathClick="disablePathClick"
          />
        </div>
        <el-dialog

          title="上传文件"
          :visible.sync="isCreate"
          width="800px"
          @open="dialogOpen('tableFocus')"
        >
          <el-form
            ref="createForm"
            :model="createForm"
            size="mini"
            label-width="100px"
            style="padding:0 5%"
          >
            <el-form-item
              label=""
              prop="folderName"
            >
              <el-popover
                slot="label"
                placement="top"
                width="300"
                :open-delay="500"
                trigger="hover"
              >
                <p>
                  1. 可用数字、中英文和可见字符的组合<br>
                  2. 用 / 分割路径，可快速创建子目录<br>
                  3. 不允许: 文件夹为空；连续 / ；以 / 开头<br>
                  4. 不允许以 .. 作为文件夹名称
                </p>
                <span slot="reference">名称&nbsp;<i class="fa  fa-question-circle" /></span>
              </el-popover>
              <el-input
                ref="tableFocus"
                v-model="createForm.folderName"
                auto-complete="off"
                clearable
              />
            </el-form-item>
            <el-form-item
              label=""
              prop=""
            >
              <!-- :before-upload="validateFileRule" -->
              <!-- :accept=",,拼接可接受文件类型 image/* 任意图片文件" -->
              <!-- :http-request="uploadFile"  覆盖原生action上传方法-->
              <!-- var formData = new FormData();  //  用FormData存放上传文件 -->
              <!-- formData.append('paramsName','file') -->
              <el-upload
                ref="uploadFile"
                action="#"
                :auto-upload="false"
                :on-change="changeFile"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                multiple
                :show-file-list="false"
                :file-list="fileList"
              >
                <el-button
                  size="small"
                  type="primary"
                  @click="postFolder('file')"
                >上传文件</el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="postFolder('folder')"
                >上传文件夹</el-button>
              </el-upload>
              <!-- <input type="file" id="upload" ref="inputer" name="file" multiple /> -->
            </el-form-item>
            <el-table :data="fileListArr.slice((currentPage - 1) * pageSize, currentPage * pageSize)">
              <el-table-column
                label="名称"
                prop="name"
              />
              <el-table-column label="文件夹">
                <template slot-scope="scope">
                  {{ scope.row.raw.webkitRelativePath ? scope.row.raw.webkitRelativePath : '-' }}
                </template>
              </el-table-column>
              <el-table-column label="类型">
                <template slot-scope="scope">
                  {{ scope.row.raw.type }}
                </template>
              </el-table-column>
              <el-table-column label="大小">
                <template slot-scope="scope">
                  {{ byteConvert(scope.row.raw.size) }}
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              v-show="total"
              :current-page="currentPage"
              :page-sizes="[5, 10, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="createFile()">{{ $ts('button.confirm') }}</el-button>
            <el-button @click="isCreate = false;">{{ $ts('button.cancel') }}</el-button>
          </div>
        </el-dialog>
        <!-- <el-dialog  title="修改访问权限" :visible.sync="isModifyAccess" width="600px">
          <el-form ref="modifyAccessForm" :model="modifyAccessForm" size="mini" label-width="100px" style="padding:0 5%">
            <el-radio v-model="modifyAccessForm.publicRadio" label="1">继承权限</el-radio>
            <el-radio v-model="modifyAccessForm.publicRadio" label="2">私有读写</el-radio>
            <el-radio v-model="modifyAccessForm.publicRadio" label="3">公有读私有写</el-radio>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary">{{ $ts('button.confirm') }}</el-button>
            <el-button @click="isModifyAccess = false;">{{ $ts('button.cancel') }}</el-button>
          </div>
        </el-dialog> -->
        <!-- <el-dialog  title="删除文件" :visible.sync="isDeleteFile" width="600px">
          <el-row>
            <el-col :span="2">
              <div class="delete_icon_wrap">
                <i class="fa fa-exclamation-triangle" aria-hidden="true" />
              </div>
            </el-col>
            <el-col :span="22">
              <p class="delete_word_title">确定删除文件 "{{ deleteName }}" 吗？</p>
            </el-col>
          </el-row>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="deleteFile()">{{ $ts('button.confirm') }}</el-button>
            <el-button @click="isDeleteFile = false;">{{ $ts('button.cancel') }}</el-button>
          </div>
        </el-dialog> -->
        <!-- <el-dialog  title="批量删除文件" :visible.sync="isMulDel" width="600px">
          <el-row>
            <el-col :span="2">
              <div class="delete_icon_wrap">
                <i class="fa fa-exclamation-triangle" aria-hidden="true" />
              </div>
            </el-col>
            <el-col :span="22">
              <p class="delete_word_title">确定删除文件
              </p>
              <p v-for="(item,index) in chooseNameArr" :key="index" style="margin:10px 0">
                {{ item }}
              </p>
            </el-col>
          </el-row>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="deleteMulFile()">{{ $ts('button.confirm') }}</el-button>
            <el-button @click="isMulDel = false;">{{ $ts('button.cancel') }}</el-button>
          </div>
        </el-dialog> -->
      </div>
    </div>
    <h2
      v-if="!$store.state.user.api['s3:ListBucket']"
      style="font-size:16px;margin:20px 0 0 20px"
    >
      无对象列表权限
    </h2>
  </div>
</template>

<script>
import BucketDetailTable from '@/components/page/objectStorage/detail/BucketDetailTable'
import BucketVersionTable from '@/components/page/objectStorage/detail/BucketVersionTable'
export default {
  name: 'BucketList',
  components: {
    BucketDetailTable,
    BucketVersionTable
  },
  filters: {},
  data() {
    return {
      hideMenuFlag: false,
      currentPage: 1,
      tableData: [],
      searchVal: '',
      isCreate: false,
      showHistory: false,
      deleteButtonDisabled: true,
      isModifyAccess: false,
      isMulDel: false,
      isDeleteFile: false,
      createForm: {
        folderName: ''
      },
      modifyAccessForm: {
        publicRadio: '1'
      },
      routeArr: [],
      deleteName: '',
      chooseNameArr: [],
      chooseObjArr: [],
      deleteVersionId: '',
      versionControl: '',
      fileList: [],
      fileListArr: [],
      total: 0,
      pageSize: 10,
      loading: false,
      disabledUrl: true
    }
  },
  computed: {
  },
  watch: {
    '$route.query.filename': function(oldVal, newVal) {
      this.routeArr = []
      this.routeArr.push(this.$route.params.id)
      if (this.$route.query.filename) {
        const fileArr = this.$route.query.filename.split('/')
        this.routeArr = this.routeArr.concat(fileArr).filter(item => item)
        // routerArr面包屑导航
        this.$refs.bucketdetailtable.listObject()
      } else {
        this.$refs.bucketdetailtable.listObject()
      }
    },
    $route(to, from) {
      if (this.searchVal) {
        // 如发生跳转则是有文件夹调到对应下面的对象下、需要情况搜索条件
        this.searchVal = ''
      }
    }
  },
  mounted() {
    if (this.$store.state['user']['api']['s3:GetBucketVersioning']) {
      // 无接口权限、不调用版本开关接口
      this.getVersionControl()
    } else {
      this.versionControl = 'Suspended'
    }
    this.routeArr = []
    this.routeArr.push(this.$route.params.id)
    this.showHistory = sessionStorage.getItem('showHistory') == 'true'
    if (this.$route.query.filename) {
      const fileArr = this.$route.query.filename.split('/')
      this.routeArr = this.routeArr.concat(fileArr).filter(item => item)
      this.$refs.bucketdetailtable.listObject()
    }
    // console.log(this.routeArr, 'menuarrr')
  },
  destroyed() { },
  methods: {
    directoryPath(path) {
      let index = this.routeArr.findIndex(x => x === path)
      index = index > 1 ? index + 1 : 2
      var temp = [...this.routeArr].slice(1, index).join('/')
      return temp
    },
    disablePathClick(val) {
      this.disabledUrl = val
    },
    hideMenu(val) {
      this.hideMenuFlag = val
    },
    postFolder(type) {
      // if (type === 'file') {
      //   $('.el-upload__input')[0].webkitdirectory = false
      // } else {
      //   $('.el-upload__input')[0].webkitdirectory = true
      // }
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleRemove(file, fileList) {
      console.log(file, fileList)
    },
    handlePreview(file) {
      console.log(file)
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    changeFile(file, fileList) {
      this.fileListArr = fileList
      this.total = this.fileListArr.length
      console.log(file, fileList, 'changeFileFun')
    },
    listObject() {
      this.$refs.bucketdetailtable.searchPrefix()
    },
    refresh() {
      this.$refs.bucketdetailtable.listObject()
    },
    // buttonControl (selection) {
    //   if (selection.length > 0) {
    //     this.deleteButtonDisabled = false
    //   } else {
    //     this.deleteButtonDisabled = true
    //   }
    //   this.chooseNameArr = []
    //   this.chooseObjArr = []
    //   console.log(selection)
    //   for (var i = 0; i < selection.length; i++) {
    //     this.chooseNameArr.push(selection[i].Key)
    //     this.chooseObjArr.push(selection[i])
    //   }
    // },
    changeShowStatus() {
      sessionStorage.setItem('showHistory', this.showHistory)
    },
    dialogOpen(e) {
      const ipt = e
      this.$nextTick(function() {
        this.$refs[ipt].$el.querySelector('input').focus()
      })
    },
    resetForm(formName) {
      console.log('resetForm')
      if (this.$refs[formName] != undefined) {
        this.$refs[formName].resetFields()
      }
    },
    clearFileInput() {
      this.resetForm('createForm')
      if (document.getElementById('upload')) {
        document.getElementById('upload').value = ''
      }
    },
    // doModifyAccess (row) {
    //   this.resetForm('modifyAccessForm')
    //   this.isModifyAccess = true
    // },
    doMulDel(selection) {
      this.isMulDel = true
    },
    // doDeleteFile (row) {
    //   this.isDeleteFile = true
    //   if (this.$route.query.filename) {
    //     console.log(this.$route.query.filename, 'query:FileName')
    //     this.deleteName = this.$route.query.filename + row.Key
    //   } else {
    //     this.deleteName = row.Key
    //   }
    //   this.deleteVersionId = row.VersionId || ''
    // },
    // deleteFile () {
    //   const temp = this
    //   temp.isDeleteFile = false
    //   let params
    //   if (!temp.showHistory) {
    //     params = {
    //       Bucket: this.$route.params.id,
    //       Key: this.deleteName
    //     }
    //   } else {
    //     params = {
    //       Bucket: this.$route.params.id,
    //       Key: this.deleteName,
    //       VersionId: this.deleteVersionId
    //     }
    //   }
    //   console.log(params)
    //   this.loading = true
    //   this.$store.state.user._S3.deleteObject(params, (err, data) => {
    //     if (err) {
    //       this.showS3Msg(err)
    //       console.dir(err)
    //       this.loading = false
    //     } else {
    //       this.$ts({
    //         type: 'success',
    //         text: this.$ts('response.success')
    //       })
    //       this.loading = false
    //     }
    //     temp.$refs.bucketdetailtable.listObject()
    //   })
    // },
    // deleteMulFile () {
    //   const temp = this
    //   const deleteLastestArr = []
    //   if (!temp.showHistory) {
    //     for (let i = 0; i < temp.chooseNameArr.length; i++) {
    //       console.log(temp.chooseNameArr[i])
    //       deleteLastestArr.push({
    //         Key: (temp.$route.query.filename || '') + temp.chooseNameArr[i]
    //       })
    //     }
    //   } else {
    //     console.log(temp.chooseObjArr)
    //     for (let i = 0; i < temp.chooseObjArr.length; i++) {
    //       deleteLastestArr.push({
    //         Key: (temp.$route.query.filename || '') + temp.chooseObjArr[i].Key,
    //         VersionId: temp.chooseObjArr[i].VersionId
    //       })
    //     }
    //   }

    //   temp.isMulDel = false
    //   const params = {
    //     Bucket: this.$route.params.id,
    //     Delete: { Objects: deleteLastestArr }
    //   }
    //   // console.log(params)
    //   this.$store.state.user._S3.deleteObjects(params, function (err, data) {
    //     console.log(err, data, 'deleteobjects')
    //     temp.$refs.bucketdetailtable.listObject()
    //   })
    // },
    validateFileRule(file) {
      const that = this
      const isSize = new Promise(function(resolve, reject) {
        const width = 750
        const height = 1334
        const _URL = window.URL || window.webkitURL
        const image = new Image()
        image.onload = function() {
          console.log(image, 'image')
          console.log(_URL)
          const valid = image.width < width || image.height < height
          if (valid) {
            // 不符合
            that
              .$confirm('图片尺寸小于750*1334, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
              .then(() => {
                resolve()
              })
              .catch(() => {
                reject()
              })
          } else {
            resolve()
          }
        }
        //
        image.src = _URL.createObjectURL(file)
      }).then(
        () => {
          // resolve
          return file
        },
        () => {
          // 取消上传 reject
          return Promise.reject()
        }
      )
      console.log(isSize, 'return')
      return isSize
    },
    createFile() {
      const temp = this
      // const form = new FormData()
      // this.fileListArr.forEach(item => {
      //   form.append('file', item.raw)
      // })
      // form.append('file', JSON.stringify(this.fileListArr))
      // console.log(form, 'form文件')
      // temp.isCreate=false;
      // const file = temp.$refs.inputer.files[0] // 通过DOM取文件数据
      console.log(this.fileListArr[0])
      console.log(this.fileListArr[0].raw.webkitRelativePath, 'path')
      // var fileStream
      // var reader = new FileReader()
      // reader.readAsDataURL(this.fileListArr[0].raw) // 把选择的文件读出来
      // reader.onload = function () {
      //   // 读完文件之后的回调
      //   console.log('read')
      //   var fileData = this.result
      //   // console.log(fileData)
      //   fileStream = fileData.split(',')[1]
      // }
      const Key = this.fileListArr[0].raw.webkitRelativePath
        ? this.fileListArr[0].raw.webkitRelativePath
        : this.fileListArr[0].name
      // putObject 传递buffer、blob
      // console.log(fileStream, 'stream')
      const file = new Blob([this.fileListArr[0].raw])
      const arrayCopy = JSON.parse(JSON.stringify(this.routeArr))
      arrayCopy.splice(0, 1)
      // console.log(arrayCopy, 'pathKey')
      var params = {
        Bucket: this.$route.params.id,
        Key,
        // (arrayCopy.length > 0 ? arrayCopy.join('/') : '') +
        // this.createForm.folderName,
        Body: file
      }
      console.log(params, '123', params.Key)
      this.$store.state.user._S3.putObject(params, function(err, response) {
        if (err) {
          console.log(err)
        } else {
          console.log(response, 'response')
          temp.fileListArr = []
          temp.total = 0
          temp.isCreate = false
          temp.$refs.uploadFile.clearFiles()
          temp.$refs.bucketdetailtable.listObject()
        }
      })
    },
    getVersionControl() {
      const temp = this
      var params = {
        Bucket: this.$route.params.id
      }
      this.$store.state.user._S3.getBucketVersioning(params, function(
        err,
        response
      ) {
        if (err) {
          console.dir(err)
          temp.versionControl = 'Suspended'
        } else {
          // versionControl 控制版本列表开关
          // console.log(response, 'versionControl')
          temp.versionControl = response.Status || 'Suspended'
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
.fa:hover::after {
  display: none;
}

.bdetail_header {
  margin: 10px 0;
  line-height: 50px;
  height: auto !important;

  span {
    color: #d3d6d8;

    a {
      color: #ff8746;
    }
  }
}

.bdetail_title {
  font-size: 14px;
  display: inline-block;
  color: #444;
  height: 50px;
  line-height: 50px;
  margin-right: 10px;
  vertical-align: middle;
  text-decoration: none;
  font-weight: 700;
}

.mv_10 {
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.2);
  margin: 20px;
}
</style>
