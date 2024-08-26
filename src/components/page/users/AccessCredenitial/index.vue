<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mb_15">
        <el-button
          v-access="'admin:CreateAccessCredential'"
          size="small"
          type="primary"
          class="golden"
          @click="serviceDialog = true"
        >创建</el-button>
        <!-- <el-button
          size="small"
          type="primary"
          @click="passwordDialog=true"
        >更改密码</el-button> -->
        <!-- <el-button
          class="deleteBtn"
          size="small"
          type="danger"
          :disabled="multipleSelection.length==0"
          @click="deleteAccount"
        >删除凭证</el-button> -->
        <!-- <el-button
          class="right tab_search_btn"
          type="primary"
          @click="
            searchVal = '';
            listAccounts()
          "
        >{{ $ts("REFRESH") }}</el-button> -->
        <el-tooltip content="刷新" placement="top" effect="dark">
          <i class="el-icon-refresh right" @click=" searchVal = '';listAccounts()" />
        </el-tooltip>
        <el-input
          v-model="searchVal"
          class="search_style right"
          placeholder="访问凭证过滤"
          width="14"
          clearable
          @input="validateReg"
        />
      </el-row>
      <el-table
        v-loading="loading"
        :data="pageTable"
        border
      >
        <!-- <el-table-column type="selection" align="center" /> -->
        <el-table-column
          label="key"
          prop="key"
          sortable
        >
          <!-- <template slot-scope="scope">
            <a class="blue" @click="openModDialog(scope.row)">{{ scope.row.key }}</a>
          </template> -->
        </el-table-column>
        <el-table-column :label="$ts('volume.dt.createtime')" prop="createTime" sortable>
          <template slot-scope="scope">
            {{ scope.row.createTime.replace(/-/g,'/') }}
          </template>
        </el-table-column>
        <el-table-column
          label="创建人"
          prop="createUser"
          sortable
        />
        <el-table-column
          label="所属用户"
          class-name="table-style"
          sortable
        >
          <template slot-scope="scope">
            <el-tooltip
              popper-class="table-tooltip"
              :content="ownerStr(scope.row)"
              placement="top"
            >
              <div class="long_title">
                <span>{{ ownerStr(scope.row) }}</span>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          prop="name"
          align="center"
        >
          <template slot-scope="scope">
            <i
              v-access="'admin:RemoveAccessCredential'"
              class="fa fa-trash-o"
              title="删除凭证"
              @click="deleteAccount(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[5, 10, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <el-dialog
      :title="serviceCreateDone?'新的访问凭证已创建':'创建访问凭证'"
      :visible.sync="serviceDialog"
      width="650px"
      style="padding:0 5%"
      class="serviceAccount"
      @opened="clearServiceValidate"
    >
      <div v-if="!serviceCreateDone">
        <el-form
          ref="serviceForm"
          :model="serviceForm"
          :rules="rules"
        >
          <!-- Customize Credentials -->
          <el-form-item
            label="自定义凭证"
            class="clearfix"
          >
            <el-popover
              placement="top-start"
              width="250"
              trigger="hover"
              content="若不启用自定义凭证则启用随机账户"
            >
              <i
                slot="reference"
                class="fa fa-question-circle"
                style="margin-left:-100px"
              />
            </el-popover>
            <el-switch
              v-model="serviceForm.credentials"
              class="right"
              active-text="启用"
              inactive-text="未启用"
            />
          </el-form-item>
          <el-row v-if="serviceForm.credentials">
            <el-form-item
              label="Access Key"
              prop="accessKey"
            >
              <el-input
                v-model="serviceForm.accessKey"
                placeholder="enter Access Key"
              />
            </el-form-item>
            <el-form-item
              label="Secret Key"
              prop="secretKey"
            >
              <el-input
                v-model="serviceForm.secretKey"
                placeholder="enter secret Key"
              />
            </el-form-item>
          </el-row>

        </el-form>
        <div slot="footer" style="display:flex;justify-content:flex-end;margin-top:40px">
          <el-button type="primary" class="golden" @click="createServiceAccount">{{ $ts('create') }}</el-button>
          <el-button @click="serviceDialog = false">{{ $ts('cancel') }}</el-button>
        </div>
      </div>
      <div v-else>
        <!-- <p>A new Service Account has been created with the following details:</p>
        <h3>Console Credentials -->
        <!-- </h3> -->
        <div>
          <span>Access Key:</span>
          <el-input
            v-model="serviceForm.accessKey"
            readonly
          />
          <i
            class="el-icon-document-copy copyText"
            title="复制到剪贴板"
            @click="copyCode(serviceForm.accessKey)"
          />
        </div>
        <div>
          <span>Secret Key:</span>
          <el-input
            v-model="serviceForm.secretKey"
            readonly
          />
          <i
            class="el-icon-document-copy copyText"
            title="复制到剪贴板"
            @click="copyCode(serviceForm.secretKey)"
          />
        </div>
        <p class="red">
          <i class="fa el-icon-warning-outline red" />
          将其保存下来，secret Key只会展示当前这一次
        </p>
        <div slot="footer" style="display:flex;justify-content:flex-end;margin-top:40px">
          <el-button @click="serviceDialog=false">{{ $ts('wtstype.none') }}</el-button>
          <el-button type="primary" class="golden" @click="downloadSecretAccount"> 下载 </el-button>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      title="删除访问凭证"
      :visible.sync="deleteFlag"
      width="650px"
    >
      <p>删除如下的访问凭证:
        {{ selectAccount }}
      </p>
      <div slot="footer">
        <el-button @click="deleteFlag = false">{{ $ts('cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="confirmDelete">{{ $ts('delete') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  listAccessCredentials,
  createAccessCredential,
  removeAccessCredential
} from '@/api/accessCredential'
export default {
  data() {
    const checkKeyReg = (rule, data, callback) => {
      const reg = /^[0-9a-zA-Z]{10,40}$/
      if (!reg.test(data)) {
        return callback('只能输入英文及数字，长度限制为10-40位')
      }
      return callback()
    }
    const checkSecretReg = (rule, data, callback) => {
      const reg = /^[0-9a-zA-Z]{10,40}$/
      if (!reg.test(data)) {
        return callback('只能输入英文及数字，长度限制为10-40位')
      }
      return callback()
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$ts('please.enter.pwd')))
      } else {
        if (this.modifyForm.confirmPwd !== '') {
          this.$refs.modifyPassword.validateField('confirmPwd')
        }
        callback()
      }
    }
    var validateConfirmPwd = (rule, value, callback) => {
      if (value === '') {
        callback(new Error(this.$ts('please.enter.pwd.again')))
      } else if (value !== this.modifyForm.newPwd) {
        callback(new Error(this.$ts('pwd.confirm.error')))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      deleteFlag: false,
      multipleSelection: [],
      selectAccount: '',
      total: 0,
      pageSize: 10,
      currentPage: 1,
      tableData: [],
      cloneData: [],
      hasJsonFlag: false,
      jsonString: '',
      searchVal: '',
      serviceCreateDone: false,
      serviceDialog: false,
      serviceForm: {
        credentials: false,
        policy: false,
        accessKey: '',
        secretKey: ''
      },
      modifyForm: {
        currentPwd: '',
        newPwd: '',
        confirmPwd: ''
      },
      passwordDialog: false,
      modDialog: false,
      rules: {
        accessKey: {
          validator: checkKeyReg,
          trigger: ['change', 'blur']
        },
        secretKey: {
          validator: checkSecretReg,
          trigger: ['change', 'blur']
        },
        newPwd: [
          { validator: validatePass, trigger: ['change', 'blur'] },
          {
            validator: this.nameValidate(8, 20),
            trigger: ['change', 'blur']
          }
        ],
        confirmPwd: [
          {
            validator: validateConfirmPwd,
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  computed: {
    pageTable() {
      return this.tableData.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
    }
  },
  watch: {
    searchVal(val) {
      this.tableData = [...this.cloneData]
      this.total = this.tableData.length
      this.currentPage = 1
      if (!val) return
      this.tableData = this.tableData.filter(item => {
        return item.key.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
      this.total = this.tableData.length
    },
    serviceDialog(val) {
      if (!val) {
        this.serviceCreateDone = false
        this.serviceForm.credentials = false
        this.serviceForm.policy = false
      }
    },
    passwordDialog(val) {
      if (!val) {
        this.$refs['modifyForm'].resetFields()
      }
    }
  },
  mounted() {
    this.listAccounts()
  },
  methods: {
    ownerStr(row) {
      // 含有多个拥有者
      return row.ownerUser
    },
    validateReg(val) {
      // var reg = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/im
      var reg = /[~!@#$%^&*()-+={}\[\]、:;'"<>?,\|.\/\\]/
      if (reg.test(val)) {
        console.log('errorr')
      }
    },
    deleteAccount(row) {
      this.deleteFlag = true
      this.selectAccount = row.key
    },
    confirmDelete() {
      const accessKeyList = [this.selectAccount]
      removeAccessCredential({
        accessKeyList,
        username: this.user
      })
        .then(res => {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
        })
        .then(res => {
          this.deleteFlag = false
          this.listAccounts()
        })
    },
    openModDialog(row) {
      this.modDialog = true
      this.jsonString = JSON.parse(row.policy)
    },
    cancelMod() {
      this.modDialog = false
    },
    copyCode(data) {
      navigator.clipboard.writeText(data)
      this.$ts({
        type: 'success',
        text: '复制成功'
      })
    },
    modPolicy() {
      // if() valida
      var json = this.$refs['jsonEditor'].editor.getText()
      var type = Object.prototype.toString.call(JSON.parse(json || '{}'))
      if (!json || type == '[object Object]') {
        this.hasJsonFlag = true
      } else {
        this.hasJsonFlag = false
      }
      if (!this.hasJsonFlag) {
        return this.$ts({
          type: 'error',
          text: 'json格式不正确'
        })
      }
      console.log('success')
    },
    listAccounts() {
      this.loading = true
      listAccessCredentials()
        .then(res => {
          this.tableData = res.data
          this.cloneData = [...this.tableData]
          this.total = this.tableData.length
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    clearServiceValidate() {
      this.$nextTick(() => {
        this.serviceForm.accessKey = ''
        this.serviceForm.secretKey = ''
        this.$refs['serviceForm'].resetFields()
      })
    },
    eslintJson() {
      this.$refs['jsonEditor'].editor.format()
    },
    copyJSON() {
      var str = this.$refs['jsonEditor'].editor.getText()
      navigator.clipboard.writeText(str)
      this.$ts({
        type: 'success',
        text: '复制成功'
      })
    },
    downloadSecretAccount() {
      // {"console":[{"url":"undefined","access_key":"aptx789","secret_key":"policyTable123","api":"s3v4","path":"auto"}]}
      const json = {
        console: [
          {
            access_key: this.serviceForm.accessKey,
            secret_key: this.serviceForm.secretKey
            // url: undefined,
            // api: 's3v4',
            // path: 'auto'
          }
        ]
      }
      // JSON.stringify(data,(key,value)=>typeof value ==='undefined'?'':value)
      const Link = document.createElement('a')
      Link.download = 'credentials.json'
      Link.style.display = 'none'
      var blob = new Blob([JSON.stringify(json)])
      Link.href = URL.createObjectURL(blob)
      document.body.appendChild(Link)
      Link.click()
      document.body.removeChild(Link)
    },
    createServiceAccount() {
      // json 正确的值 {}包裹的 json 字符串
      // 若空值或空对象则正确
      // Object.prototype.toString.call({})
      // var json = this.$refs['jsonEditor']?.editor.getText()
      // var type = Object.prototype.toString.call(JSON.parse(json || '{}'))
      // if (!json || type == '[object Object]') {
      //   this.hasJsonFlag = true
      // } else {
      //   this.hasJsonFlag = false
      // }
      this.$refs['serviceForm'].validate(valid => {
        if (valid) {
          // if (!this.hasJsonFlag) {
          //   return this.$ts({
          //     type: 'error',
          //     text: 'json格式不正确'
          //   })
          // }
          // json填写正确就传递json，否则中断
          if (!this.serviceForm.accessKey || !this.serviceForm.secretKey) {
            this.serviceForm.accessKey = Math.random()
              .toString(36)
              .substring(2, 12)
            this.serviceForm.secretKey = Math.random()
              .toString(36)
              .substring(2, 12)
          }
          // this.$ts({
          //   type: 'success',
          //   text: '填写校验通过'
          // })
          // api
          createAccessCredential({
            key: this.serviceForm.accessKey,
            secret: this.serviceForm.secretKey
          }).then(res => {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.serviceCreateDone = true
            this.listAccounts()
          })
        }
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>
<style scoped lang="scss">
::v-deep .serviceAccount {
  .el-dialog__header {
    border: none;
  }

  .el-dialog__body {
    padding: 20px 40px;

    .el-form-item {
      margin: 10px 0;

      .el-form-item__label {
        margin-left: 0;
        text-align: left;
        width: 180px !important;
      }

      .el-form-item__content {
        margin-bottom: 20px;

        .el-form-item__error {
          left: 33%;
        }
      }

      .el-switch {
        margin-top: 10px;
      }

      .el-input {
        width: 65%;
      }
    }

    p,
    h3 {
      margin-bottom: 20px;
    }

    i.copyText {
      position: relative;
      top: -30px;
      right: -95%;
      font-size: 20px;
      cursor: pointer;
    }
  }
}

::v-deep .bottomMenu {
  display: flex;
  justify-content: flex-end;
  margin-top: -30px;
  cursor: pointer;
  margin-right: 5px;

  i {
    top: unset;
    right: unset;
    border: 1px solid #ccc;
    padding: 5px;
    z-index: 99;
    font-size: 16px;
    margin-left: 10px;
  }
}

::v-deep .passwordDialog {
  .el-form-item__label {
    margin-left: 0;
    text-align: left;
  }
}
</style>
<style>
.table-tooltip {
  max-width: 500px;
  word-break: break-word;
}

.table-style .cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
