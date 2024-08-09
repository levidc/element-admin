<template>
  <div>
    <div class="page_content_wrap">
      <div class="mb_15 clearfix">
        <el-button v-access="'admin:CreateBucket'" class="golden" type="primary" @click="handleCreate">{{ $ts("CREATE") }}</el-button>
        <div class="right">
          <el-tooltip
            content="刷新"
            placement="top"
            effect="dark"
          >
            <i
              class="el-icon-refresh"
              @click="searchVal = ''; listBucket()"
            />
          </el-tooltip>
        </div>
        <el-input
          v-model="searchVal"
          class="search_style search_btn right with_search mr_10"
          placeholder="存储桶名过滤"
          clearable
        />
      </div>
      <BucketTable ref="buckettable" :search-val="searchVal" @buttonControl="buttonControl" @handleRouteParams="handleRouteParams" @deleteBucket="deleteBucket" @updateBucket="updateBucket" />
    </div>

    <el-dialog
      :title="isAdd?'创建存储桶':'修改存储桶'"
      :visible.sync="isCreate"
      width="680px"
      @open="dialogOpen('tableFocus');showPoint = false;"
    >
      <el-form
        ref="createForm"
        :model="createForm"
        :rules="createRules"
        size="mini"
        label-width="100px"
        style="padding:0 5%;"
      >
        <el-form-item
          label="名称"
          prop="bucketName"
        >
          <el-input
            ref="tableFocus"
            v-model="createForm.bucketName"
            auto-complete="off"
            clearable
            :disabled="!isAdd"
            placeholder="存储桶名称必须唯一，并且不能包含空格或大写字母。"
          />
          <div
            v-if="isAdd"
            class="popover"
          >
            <el-popover
              placement="right"
              width="350"
              trigger="hover"
            >
              <p style="line-height:1.6;">名称只能由小写字母、数字、点 (.) 和连字符 (-) 组成。</p>
              <p style="line-height:1.6;">名称需以数字字母开头结尾</p>
              <p style="line-height:1.6;">名称不能包含两个相邻的句点(.)</p>
              <p style="line-height:1.6;">不能以'xn--'开头和以-s3alias结尾</p>
              <p style="line-height:1.6;">存储桶名称不能与 IP 地址相似</p>
              <p style="line-height:1.6;">名称长度为3-63位字符</p>
              <i
                slot="reference"
                class="fa fa-question-circle"
                style="margin-left: -20px !important;"
              />
            </el-popover>
          </div>
          <!-- <p v-if="isAdd" class="input_tip_font">存储桶名称必须唯一，并且不能包含空格或大写字母。</p> -->
        </el-form-item>
        <!-- <el-form-item label="设置拥有者" prop="objectOwnership">
          <el-select v-model="createForm.objectOwnership" clearable>
            <el-option v-for="item in ownerShipOptions" :key="item.value" :label="item.key" :value="item.value"/>
          </el-select>superAdmint" auto-complete="off" clearable />
        </el-form-item> -->
        <!-- <div>
          <label for="volumeType" class="el-form-item__label" style="width: 100px;">存储桶配额</label>
          <el-form-item label="储桶容量" prop="bucketSize" label-position="right" class="link_input">
            <el-input v-model="createForm.bucketSize" auto-complete="off" clearable placeholder="无限制">
              <template slot="append">G</template>
            </el-input>
          </el-form-item>
          <el-form-item label="对象数量" prop="bucketObjAccount" label-position="right" class="link_input">
            <el-input v-model="createForm.bucketObjAccount" auto-complete="off" clearable placeholder="无限制">
              <template slot="append">万</template>
            </el-input>
          </el-form-item>
        </div> -->
        <!-- <el-form-item label="设置写保护" prop="writeProtect">
          <el-radio v-model="createForm.writeProtect" label="on">开启</el-radio>
          <el-radio v-model="createForm.writeProtect" label="off">关闭</el-radio>
        </el-form-item> -->
        <!-- <el-form-item label="设置多版本" prop="multiVersion">
          <el-radio-group v-model="createForm.multiVersion" :disabled="createForm.objectLock==='on'">
            <el-radio label="on">开启</el-radio>
            <el-radio label="off">关闭</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item
          v-if="isAdd"
          label="对象锁定"
          prop="objectLock"
        >
          <el-radio
            v-model="createForm.objectLock"
            label="on"
          >开启</el-radio>
          <el-radio
            v-model="createForm.objectLock"
            label="off"
          >关闭</el-radio>
          <p class="input_tip_font">使用一次写入多次读取(WORM)模型存储对象，以帮助您防止对象在固定的时间段内或无限期地被删除或覆盖。</p>
        </el-form-item>

        <p
          v-if="createForm.objectLock == 'on'"
          class="mt_m10 mb_20"
        ><i class="el-icon-warning-outline" /> 对象锁定只对受版本控制的存储桶有效。启用对象锁定会自动启用存储桶版本控制。</p>

        <el-form-item
          v-if="showOwner"
          label="桶拥有者"
          prop="userName"
        >
          <div style="display: flex;">
            <el-select
              v-model="createForm.userName"
              placeholder="请选择拥有者"
              filterable
              style="width: 191px;"
              @change="changeOwner"
              @click.native="reqUserName"
            >
              <el-option
                v-for="item in searchSels"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <p
              v-if="showPoint"
              class="point"
            >&nbsp; <i class="el-icon-warning pointStyle" />&nbsp;创建后不能修改桶拥有者</p>
          </div>
        </el-form-item>

        <!-- <el-form-item label="添加访问用户">
          <el-autocomplete v-model="createForm.userName" placeholder="用户名称过滤" clearable :fetch-suggestions="searchUserNames" />
          <el-button class="golden ml_10" :disabled="validateName" @click="addUser">添加</el-button>
        </el-form-item> -->
        <!-- <el-form-item v-if="createForm.users && createForm.users.length" label="已关联的可见用户" prop="users">
          <el-tag v-for="(item,index) in createForm.users" :key="item" closable @close="removeUser(index)">
            {{ item }}
          </el-tag>
        </el-form-item> -->
        <el-row v-if="createForm.unknownUsers && createForm.unknownUsers.length">
          <el-form-item prop="unknownUsers">
            <el-tag
              v-for="(item,index) in createForm.unknownUsers"
              :key="item"
              style="color: crimson;"
            >
              {{ item }}
            </el-tag>
          </el-form-item>
          <p class="mt_m10">
            <i class="el-icon-warning-outline" />
            红字的关联用户已不存在，提交修改后将自动移除
          </p>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button class="blue" @click="isCreate = false; showPoint = false; resetForm('createForm')">{{ $ts('button.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="createBucket('createForm')">{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog
      v-if="isDelete"
      title="删除存储桶"
      :visible.sync="isDelete"
      width="30%"
    >
      <p>确定删除下面的存储桶吗？</p>
      <span class="dialogDrag_Obj">{{ detBucked }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button class="blue" @click="isDelete = false">{{ $ts('button.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="isDelete = false; doDelete()">{{ $ts('button.confirm') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
import BucketTable from '@/components/page/objectStorage/BucketTable'
import { listUserNames } from '@/api/user'
import { validBucketName } from '@/utils/validate'
import { setBucketOwner } from '@/api/bucket'
import {
  UpdateBucketQuota
} from '@/api/storage'
export default {
  name: 'Bucket',
  components: {
    BucketTable
  },
  filters: {
    nameFilter: function(arr) {
      if (!arr && arr.length) return ''
      const names = arr.map(item => item.name).join(',')
      return names
    }
  },
  data() {
    return {
      ownerShipOptions: [
        {
          key: '强制存储桶拥有者',
          value: 'BucketOwnerEnforced'
        },
        {
          key: '存储桶拥有者优先',
          value: 'BucketOwnerPreferred'
        },
        {
          key: '对象编写者',
          value: 'ObjectWriter'
        }
      ],
      owner: '',
      params: {},
      searchSels: [],
      opertate: 'add',
      isCreate: false,
      showPoint: false,
      isDeleteDis: true,
      isDelete: false,
      searchVal: '',
      searchType: 'bucket',
      chooseObj: [],
      checkList: ['存储桶名称', '创建时间', '所属地域', '操作', '访问'],
      userNameArr: [],
      createForm: {
        bucketName: '',
        objectOwnership: 'BucketOwnerEnforced',
        locationConstraint: '',
        bucketSize: '',
        bucketObjAccount: '',
        writeProtect: '',
        // multiVersion: 'off',
        ownerAcl: '',
        allUserAcl: '',
        objectLock: 'off',
        userName: '',
        users: [],
        unknownUsers: []
      },
      createRules: {
        bucketName: [
          {
            required: true,
            message: '请填写存储桶名称',
            trigger: ['blur', 'change']
          },
          { validator: validBucketName, trigger: ['blur', 'change'] }
        ],
        userName: [
          {
            required: true,
            message: '请填写桶的拥有者',
            trigger: ['blur', 'change']
          }
        ]
      },
      flag: false
    }
  },
  computed: {
    showOwner() {
      // return JSON.parse(localStorage.getItem('user')).name == 'superAdmin'
      return ['superAdmin', 'fullPolicyAdmin'].includes(this.$store.state.role)
    },
    validateName() {
      return this.createForm.userName && this.createForm.users.includes(this.createForm.userName)
    },
    isAdd() {
      return this.opertate === 'add'
    },
    detBucked() {
      return this.chooseObj.map((r) => r.BucketName).join(',')
    }

  },
  watch: {
    // 'createForm.objectLock' (val) {
    //   if (val === 'on') {
    //     this.$set(this.createForm, 'multiVersion', 'on')
    //   }
    // }
  },
  mounted() {
    sessionStorage.setItem('showHistory', false)
    // console.log(JSON.parse(localStorage.getItem('user')).name, 'rgrgr')
  },

  destroyed() { },

  methods: {
    handleRouteParams() {
      this.searchVal = this.$route.params.bucketName
    },
    async openDialog(cb) {
      const res = await listUserNames()
      if (res.data && res.data.length) {
        this.searchSels = res.data.map(item => {
          return { key: item, value: item }
        })
        cb()
        this.isCreate = true
      }
    },
    remoteMethod(query) {
      listUserNames().then(res => {
        this.searchSels = (res.data || [])
          .filter(item => item.toLowerCase()
            .indexOf(query.toLowerCase()) > -1)
          .map(item => {
            return { key: item, value: item }
          })
        console.log(this.searchSels, 'searchSels')
      })
      // .catch(err => {
      //   this.searchSels = (['admin', '11111'] || [])
      //     .filter(item => item.toLowerCase()
      //       .indexOf(query.toLowerCase()) > -1)
      //     .map(item => {
      //       return { key: item, value: item }
      //     })
      // })
    },
    reqUserName() {
      //  搜索空值且远程搜索不生效 需重新请求下拉
      if (!this.createForm.userName && this.searchSels && this.searchSels.length == 0) {
        listUserNames().then(res => {
          this.searchSels = (res.data || [])
            .map(item => {
              return { key: item, value: item }
            })
        })
      }
    },
    changeOwner(val) {
      this.showPoint = true
      this.createForm.userName = val
      console.log(this.createForm.userName, 'efefef')
    },
    handleCreate() {
      this.openDialog(() => {
        this.resetForm('createForm')
        this.opertate = 'add'
      })
    },
    filterSame(all, target) {
      return all.filter(x => {
        return target.some(y => {
          return x == y
        })
      })
    },
    filterDiff(all, target) {
      return all.filter(x => {
        return target.every(y => {
          return x !== y
        })
      })
    },
    updateBucket(row) {
      // 更新updateList
      this.opertate = 'modify'
      listUserNames().then((res) => {
        res.data = res.data || []
        this.searchSels = res.data.map(item => {
          return { key: item, value: item }
        })
        const { BucketName } = row
        // // this.createForm.unknownUsers = this.filterDiff(row.viewableUsers, res.data)
        // // this.createForm.users = this.filterSame(res.data, row.viewableUsers)
        this.createForm.bucketName = BucketName // 桶名称
        // getBucket({ bucketName: this.createForm.bucketName }).then((res) => {
        //   console.log(res.data, 'wdwd')
        //   console.log(res.data.user)
        //   this.createForm.userName = res.data.user
        //   this.owner = res.data.user
        // })

        this.isCreate = true
      })
    },
    removeUser(index) {
      this.createForm.users.splice(index, 1)
    },
    searchUserNames(_, cb) {
      listUserNames('').then((res) => {
        const searchVal = (res.data || [])
          // .concat(res.data).concat(res.data)
          .filter(item => item.toLowerCase()
            .indexOf(this.createForm.userName.toLowerCase()) > -1)
        this.userNameArr = [...searchVal]
        cb(searchVal.map(item => ({ value: item })))
      })
      // console.log('cb', cb)
    },
    resetForm(formName) {
      if (this.$refs[formName] != undefined) {
        this.$refs[formName].resetFields()
        // this.createForm.bucketName = ''
        this.createForm.userName = ''
        this.createForm.users = []
        this.createForm.unknownUsers = []
      }
    },
    dialogOpen(e) {
      const ipt = e
      this.$nextTick(function() {
        this.$refs[ipt].$el.querySelector('input').focus()
      })
    },
    buttonControl(selection) {
      if (selection.length > 0) {
        this.isDeleteDis = false
      } else {
        this.isDeleteDis = true
      }
    },
    getNames() {
      this.chooseObj = this.$refs.buckettable.multipleSelection
      // console.log(JSON.stringify(this.chooseObj))
    },
    listBucket() {
      this.$refs.buckettable.listBuckets()
    },
    createBucket(form) {
      this.$refs['createForm'].validate(valid => {
        //   if (valid) {
        //     if (this.isAdd) {
        //       createBucket({
        //         bucketName: this.createForm.bucketName,
        //         amzBucketObjectLockEnabled: this.createForm.objectLock === 'on',
        //         // ObjectLockEnabledForBucket: this.createForm.objectLock === 'on',
        //         viewableUsers: this.createForm.users
        //       }).then((res) => {
        //         if (localStorage.getItem('isHtGateway') == 'true') {
        //           UpdateBucketQuota({ bucketName: this.createForm.bucketName,
        //             openStatic: true }).then((res) => {
        //             this.$refs.buckettable.listBuckets()
        //           })
        //         }

        //         this.$ts({
        //           type: 'success',
        //           text: this.$ts('response.success')
        //         })
        //         this.isCreate = false
        //       }).finally(() => {
        //         this.$refs.buckettable.listBuckets()
        //       })
        //     } else {
        //       updateBucket({
        //         bucketName: this.createForm.bucketName,
        //         viewableUsers: this.createForm.users
        //       }).then(() => {
        //         this.$ts({
        //           type: 'success',
        //           text: this.$ts('response.success')
        //         })
        //         this.isCreate = false
        //       }).finally(() => {
        //         this.$refs.buckettable.listBuckets()
        //       })
        //     }
        //   }
      })
      this.params = {
        Bucket: this.createForm.bucketName,
        ObjectLockEnabledForBucket: this.createForm.objectLock === 'on'
      }
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          this.$store.state._S3.createBucket(this.params, (err, data) => {
            if (err) {
              this.showS3Msg(err)
            } else {
              const asyncArr = []
              if (localStorage.getItem('isHtGateway') == 'true') {
                asyncArr.push(UpdateBucketQuota({
                  bucketName: this.createForm.bucketName,
                  openStatic: true
                }))
              }
              if (this.createForm.userName != '') {
                asyncArr.push(setBucketOwner({ bucketName: this.createForm.bucketName, owner: this.createForm.userName }))
              }
              Promise.allSettled(asyncArr).then(() => {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                this.showPoint = false
                this.isCreate = false
                this.createForm.bucketName = ''
              }).finally(() => {
                this.$refs.buckettable.listBuckets()
              })
            }
          })
        }
      })
      // }
    },
    deleteBucket(row) {
      this.isDelete = true
      this.chooseObj = []
      this.chooseObj.push(row)
    },
    associatedcluster(row) {
    },
    doDelete() {
      // localStorage.removeItem('isHtGateway')
      const params = {
        Bucket: this.chooseObj[0].BucketName
      }
      this.$store.state._S3.deleteBucket(params, (err, data) => {
        if (err) {
          if (err.code === 409) {
            this.$ts({
              type: 'error',
              text: '此存储桶不为空,必须先清空存储桶，然后才能将其删除。'
            })
          } else {
            this.showS3Msg(err)
          }
          console.dir(err)
        } else {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
          this.$refs.buckettable.listBuckets()
        }
      })
    }

  }
}
</script>
<style lang="scss" scoped>
.ownerStyle {
  display: flex;
}
.point {
  vertical-align: middle;
  color: #ff8746;
}

.el-autocomplete {
  width: 55%;
}
.el-tag {
  color: #e39606;
  background-color: #292f32;
  border-color: transparent;
  margin: 0 10px 10px 0;
}
.el-dialog__body {
  position: relative !important;
}

.popover {
  position: absolute !important;
  right: -29px;
  top: 2px;
}

.bucketAclTable {
  width: 100%;
  border-collapse: collapse;
}

.bucketAclTable,
.bucketAclTable td,
.bucketAclTable th {
  text-align: center;
  border: 1px solid #dcdfe6;
}

.bucketAclTable th {
  font-weight: normal;
}

.search_btn {
  width: 190px;
}

.dialogDrag_Obj {
  color: #ff8746;
  line-height: 38px;
}
</style>
