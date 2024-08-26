<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div
            id="basic-info-field"
            class="param-box"
          >
            <div class="param-hd">
              <h3>访问控制列表(ACL)</h3>
              <el-button
                v-show="!editStatus&&!loading"
                v-access="'s3:PutBucketAcl'"
                type="text"
                style="position:relative;top:3px"
                @click="editConfig"
              >
                <span style="color:#ff8746;">编辑</span>
              </el-button>
            </div>
            <el-form
              :model="formAcl"
              label-width="120px"
            >
              <el-form-item
                v-if="!editStatus&&!loading"
                label="桶ACL"
                style="width:50%"
              >
                <el-button type="text">{{ formAcl.readAcl }}</el-button>
              </el-form-item>

              <!-- 额外用户start -->
              <el-table
                v-show="!editStatus&&tableData.length"
                v-loading="loading"
                :data="tableData"
              >
                <el-table-column
                  prop="owner"
                  label="被授权者"
                  width="500px"
                >
                  <template slot-scope="scope">
                    {{ scope.row.userName }} {{ scope.row.owner?'(桶owner)' : '' }}
                  </template>
                </el-table-column>
                <el-table-column label="">
                  <template slot-scope="scope">
                    <!-- <div v-if="editStatus" class="reverseColumn">
                      <el-checkbox v-model="scope.row.objectRead">
                        列出
                      </el-checkbox>
                      <el-checkbox v-model="scope.row.objectWrite" :disabled="scope.row.key == 2 || scope.row.key == 3">
                        写入
                      </el-checkbox>
                    </div> -->
                    <span>{{ objectMap(scope.row) || '-' }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="owner"
                  label=""
                >
                  <template slot-scope="scope">
                    <!-- <div v-if="editStatus" class="reverseColumn">
                      <el-checkbox v-model="scope.row.bucketRead">
                        读取
                      </el-checkbox>
                      <el-checkbox v-model="scope.row.bucketWrite" :disabled="scope.row.key == 2 || scope.row.key == 3">
                        写入
                      </el-checkbox>
                    </div> -->
                    <span>{{ bucketMap(scope.row) || '-' }}</span>
                  </template>
                </el-table-column>
              </el-table>
              <!-- 额外用户end -->

              <el-form-item
                v-if="editStatus"
                label="桶ACL"
                prop="setAcl"
              >
                <el-radio-group v-model="formAcl.selectAcl">
                  <el-radio label="private">私有</el-radio>
                  <el-radio label="public-read">公共读</el-radio>
                  <el-radio label="public-read-write">公共读写</el-radio>
                  <el-radio label="authenticated-read">认证读</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-form>

            <div
              v-show="editStatus"
              v-access="'admin:ListUsers'"
              class="addOtherAccount"
            >
              <h3>其他账号的访问权限</h3>
              <el-button
                v-access="'admin:ListUsers'"
                class="golden"
                @click="flag=true"
              >添加授权用户</el-button>
              <el-form
                ref="form"
                :model="form"
              >
                <el-table
                  v-if="form.granteeTable&&form.granteeTable.length"
                  :data="form.granteeTable"
                >
                  <el-table-column
                    label="被授权者ID"
                    width="450px"
                  >
                    <template slot-scope="scope">
                      <!--  :rules="ruleId" -->
                      <el-form-item
                        :rules="ruleId"
                        :prop="'granteeTable.'+ scope.$index +'.userName'"
                      >
                        {{ scope.row.userName }} {{ scope.row.owner?'(桶owner)' : '' }}
                        <!-- <el-input style="margin-top:20px" v-model="scope.row.userName" placeholder="输入规范ID" readonly/> -->
                      </el-form-item>
                    </template>
                  </el-table-column>

                  <el-table-column label="">
                    <template slot-scope="scope">
                      <div class="">
                        <el-checkbox
                          v-model="scope.row.READ"
                          :disabled="scope.row.owner"
                        >
                          读
                        </el-checkbox>
                        <el-checkbox
                          v-model="scope.row.WRITE"
                          :disabled="scope.row.owner"
                        >
                          写
                        </el-checkbox>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="">
                    <template slot-scope="scope">
                      <div class="">
                        <el-checkbox
                          v-model="scope.row.READ_ACP"
                          :disabled="scope.row.owner"
                        >
                          读ACL
                        </el-checkbox>
                        <el-checkbox
                          v-model="scope.row.WRITE_ACP"
                          :disabled="scope.row.owner"
                        >
                          写ACL
                        </el-checkbox>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <i
                        v-if="!scope.row.owner"
                        title="删除"
                        class="fa fa-trash-o"
                        @click="form.granteeTable.splice(scope.$index,1)"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </el-form>
            </div>
            <div
              v-show="editStatus"
              class="bottomMenu"
            >
              <el-button
                class="blue"
                @click="editStatus=false;getBucketAcl()"
              >取消</el-button>
              <el-button
                type="primary"
                class="golden"
                @click="saveConfig"
              >保存</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      ref="userDialog"
      title="选择额外授权用户"
      :visible.sync="flag"
      @close="handleScroll('userDialog')"
    >
      <div class="clearfix">
        <el-row>
          <el-col :span="8">
            <el-select
              v-model="userGroup"
              style="width: 100%;"
              multiple
              collapse-tags
              placeholder="已选用户"
              @change="changeSelect"
            >
              <el-option
                v-for="item in listGroup"
                :key="item.userName"
                :label="item.userName"
                :value="item.userName"
              />
            </el-select>
          </el-col>
          <el-col
            :span="8"
            class="ipt"
          >
            <el-input
              v-model="userName"
              placeholder="用户名过滤"
              clearable
            />
          </el-col>
        </el-row>
      </div>
      <el-table
        ref="userTable"
        :data="userData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
        :row-key="(row)=>row.userName"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          reserve-selection
          width="55"
        />
        <el-table-column
          label="用户名"
          prop="userName"
        />
      </el-table>
      <div slot="footer">
        <el-button class="blue" @click="flag=false">{{ $ts('button.cancel') }}</el-button>
        <el-button type="primary" class="golden" @click="addAccount()">{{ $ts('button.confirm') }}</el-button>
      </div>
      <div
        v-show="total"
        class="page_block"
      >
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
    </el-dialog>
  </div>
</template>

<script>
import { listUsers } from '@/api/user'
export default {
  name: 'BucketAccess',
  components: {},
  filters: {},
  data() {
    const checkValidID = (rule, data, callback) => {
      const index = rule.field.match(/\d/)[0]
      const len = this.form.granteeTable.length
      for (let i = 0; i < len; i++) {
        if (i == index) continue
        if (
          data === this.form.granteeTable[i].userName ||
          data === this.tableData[0].ID
        ) {
          return callback('必须指定唯一的被授权者。')
        }
      }
      callback()
    }
    return {
      formAcl: {
        selectAcl: '',
        readAcl: '123'
      },
      selected: [],
      copy: [],
      total: 0,
      userName: '',
      currentPage: 1,
      pageSize: 10,
      flag: false,
      loading: false,
      userGroup: [], // v-model select
      listGroup: [], // option
      userData: [], // userTable
      form: {
        granteeTable: []
      },
      editStatus: false,
      tableData: [
        // {
        //   owner: '存储桶拥有者',
        //   key: 1,
        //   ID: ''
        // },
        // {
        //   owner: '所有人',
        //   key: 2
        // },
        // {
        //   owner: '经身份验证的用户组',
        //   key: 3
        // }
      ],
      ruleId: [
        {
          required: true,
          message: '被授权者不能为空。请指定或删除被授权者。',
          trigger: ['blur', 'change']
        },
        {
          validator: checkValidID,
          trigger: ['blur', 'change']
        }
      ]
    }
  },
  computed: {},
  watch: {
    userName(val) {
      this.userData = [...this.copy]
      this.total = this.userData.length
      this.currentPage = 1
      if (!val) return
      this.userData = this.userData.filter(item => {
        return item.userName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
      this.total = this.userData.length
    },
    flag(val) {
      if (val) {
        listUsers().then(res => {
          res.data = res.data.filter(item => item.userName !== 'superAdmin')
          // console.log('res', res)
          if (this.form.granteeTable && this.form.granteeTable.length) {
            this.userData = this.filterDiff(
              res.data,
              this.form.granteeTable,
              'userName'
            )
          } else {
            this.userData = res.data
          }
          this.copy = [...this.userData]
          this.total = this.userData.length
        })
      } else {
        // 去除v-model、option
        this.pageSize = 10
        this.currentPage = 1
        this.userName = ''
        this.listGroup = []
        this.userGroup = []
        this.$refs.userTable.clearSelection()
      }
    }
  },
  mounted() {
    this.getBucketAcl()
  },
  methods: {
    getBucketAcl() {
      this.loading = true
      this.form.granteeTable = []
      this.$store.state.user._S3.getBucketAcl(
        { Bucket: this.$route.params.id },
        (err, data) => {
          if (err) {
            this.showS3Msg(err)
            this.loading = false
          } else {
            this.loading = false
            // 筛选额外用户
            const temp = data.Grants.filter(item => {
              return (
                item.Grantee.Type === 'CanonicalUser'
                // &&
                // item.Grantee.DisplayName !== data.Owner.DisplayName
              )
            })
            console.log(data, 'getBucketAcl')
            const arr = []
            const obj = {}
            for (let i = 0; i < temp.length; i++) {
              // 过滤group及所有人
              if (temp[i].Grantee.ID && !obj[temp[i].Grantee.ID]) {
                obj[temp[i].Grantee.ID] = true
                arr.push({
                  userName: temp[i].Grantee.ID,
                  permission: [temp[i].Permission]
                })
              } else if (temp[i].Grantee.ID) {
                const index = arr.findIndex(
                  item => item.userName == temp[i].Grantee.ID
                )
                arr[index].permission.push(temp[i].Permission)
              }
            }

            // 处理私有、公共读、写、认证读展示
            const group = data.Grants.filter(
              item => item.Grantee.Type == 'Group'
            )
            // group暂时返回一个
            // 根据url区分公共读、写与认证读
            if (group && group.length) {
              const { URI } = group[0].Grantee
              // console.log(group, "123");
              if (URI === 'http://acs.amazonaws.com/groups/global/AllUsers') {
                const Permission = group[0].Permission
                if (Permission === 'READ') {
                  this.formAcl.readAcl = '公共读'
                  this.formAcl.selectAcl = 'public-read'
                } else if (Permission === 'WRITE') {
                  this.formAcl.readAcl = '公共读写'
                  this.formAcl.selectAcl = 'public-read-write'
                }
              } else if (
                URI ===
                'http://acs.amazonaws.com/groups/global/AuthenticatedUsers'
              ) {
                this.formAcl.readAcl = '认证读'
                this.formAcl.selectAcl = 'authenticated-read'
              }
            } else {
              this.formAcl.readAcl = '私有'
              this.formAcl.selectAcl = 'private'
            }
            // 处理同一用户多个权限、将通过前面的permission数组添加对应的数据
            for (let i = 0; i < arr.length; i++) {
              for (let j = 0; j < arr[i].permission.length; j++) {
                if (arr[i]['permission'][0] === 'FULL_CONTROL') {
                  arr[i]['READ'] = true
                  arr[i]['WRITE'] = true
                  arr[i]['READ_ACP'] = true
                  arr[i]['WRITE_ACP'] = true
                  arr[i]['owner'] = true
                  break
                }
                arr[i][arr[i]['permission'][j]] = true
              }
            }
            // for (let i = 0; i < this.tableData.length; i++) {
            //   for (let j = 0; this.tableData[i].permission.length; j++) {
            //     this.txtSwitch(this.tableData[i].permission[j], i)
            //   }
            // }
            this.tableData = [...arr]
            console.log(this.tableData, '111')
          }
        }
      )
    },
    changeSelect(val) {
      console.log(val, 'val')
      const restGroup = this.userGroup.map(item => {
        return {
          userName: item
        }
      })
      const users = this.filterDiff(this.selected, restGroup, 'userName') // 切换表格勾选数据
      console.log(users, 'users')
      users.forEach(item => {
        this.$refs.userTable.toggleRowSelection(item)
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleSelectionChange(val) {
      // console.log(val, 'val')
      this.selected = val
      this.listGroup = [...val]
      this.userGroup = this.listGroup.map(item => item.userName)
      // this.userGroup = [...val]
    },
    handleScroll(ref) {
      this.$refs[ref].$el.scrollTop = 0
    },
    bucketMap(val) {
      if (val.READ_ACP && val.WRITE_ACP) {
        return '读写ACL'
      } else if (val.READ_ACP) {
        return '读ACL'
      } else if (val.WRITE_ACP) {
        return '写ACL'
      } else {
        return ''
      }
    },
    objectMap(val) {
      if (val.READ && val.WRITE) {
        return '读写'
      } else if (val.WRITE) {
        return '写'
      } else if (val.READ) {
        return '读'
      } else {
        return '-'
      }
    },
    txtSwitch(permission, index) {
      index = Number(index)
      switch (permission) {
        case 'READ':
          this.$set(this.tableData[index], 'READ', true)
          break
        case 'WRITE':
          this.$set(this.tableData[index], 'WRITE', true)
          break
        case 'READ_ACP':
          this.$set(this.tableData[index], 'READ_ACP', true)
          break
        case 'WRITE_ACP':
          this.$set(this.tableData[index], 'WRITE_ACP', true)
          break
        case 'FULL_CONTROL':
          this.$set(this.tableData[index], 'READ', true)
          this.$set(this.tableData[index], 'WRITE', true)
          this.$set(this.tableData[index], 'READ_ACP', true)
          this.$set(this.tableData[index], 'WRITE_ACP', true)
          break
      }
    },
    editConfig() {
      this.editStatus = true
      // 排序恢复默认排序、tableData移除外部账户，多余归到授权表格granteeTable
      // this.tableData.sort((a, b) => a.key - b.key)
      this.form.granteeTable = [...this.tableData]
    },
    saveConfig() {
      const permission = ['READ', 'READ_ACP', 'WRITE', 'WRITE_ACP']
      const Grants = []
      for (let i = 0; i < this.form.granteeTable.length; i++) {
        for (let j = 0; j < permission.length; j++) {
          if (this.form.granteeTable[i][permission[j]]) {
            // 若都勾选、则full-ctrl、故第一次满足条件时就对剩余做判断是否有权限、有就break
            if (j !== 0) {
              Grants.push({
                Grantee: {
                  Type: 'CanonicalUser',
                  DisplayName: this.form.granteeTable[i].userName
                  // EmailAddress: 'STRING_VALUE',
                  // URI: 'STRING_VALUE'
                },
                Permission: permission[j]
              })
            } else {
              const rest = ['READ_ACP', 'WRITE', 'WRITE_ACP']
              let flag = 0
              const temp = [
                {
                  Grantee: {
                    Type: 'CanonicalUser',
                    DisplayName: this.form.granteeTable[i].userName
                  },
                  Permission: 'READ'
                }
              ]
              for (let k = 0; k < rest.length; k++) {
                if (this.form.granteeTable[i][rest[k]]) {
                  temp.push({
                    Grantee: {
                      Type: 'CanonicalUser',
                      DisplayName: this.form.granteeTable[i].userName
                    },
                    Permission: rest[k]
                  })
                  flag++
                }
              }
              if (flag == 3) {
                Grants.push({
                  Grantee: {
                    Type: 'CanonicalUser',
                    DisplayName: this.form.granteeTable[i].userName
                  },
                  Permission: 'FULL_CONTROL'
                })
              } else {
                Grants.push(...temp)
              }
              break
              //
            }
          }
        }
      }
      // Grants.push(...this.Owner)
      // console.log(Grants, 'qs')
      // Grants.push(...[
      //   {
      //     'Grantee': {
      //       'Type': 'Group',
      //       'URI': 'http://acs.amazonaws.com/groups/global/AllUsers'
      //     },
      //     'Permission': 'WRITE'
      //   },
      //   {
      //     'Grantee': {
      //       'Type': 'Group',
      //       'URI': 'http://acs.amazonaws.com/groups/global/AllUsers'
      //     },
      //     'Permission': 'READ'
      //   }
      // ])
      // console.log(Grants, 'grant')
      this.$store.state.user._S3.putBucketAcl(
        {
          Bucket: this.$route.params.id,
          ACL: this.formAcl.selectAcl,
          AccessControlPolicy: {
            Grants
          }
        },
        (err, data) => {
          if (err) {
            this.showS3Msg(err)
            console.error(err)
          } else {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.getBucketAcl()
            this.editStatus = false
          }
        }
      )
      // this.$refs['form'].validate(valid => {
      //   console.log(valid, 'valid')
      // })
    },
    addAccount() {
      for (let i = 0; i < this.selected.length; i++) {
        this.form.granteeTable.push({
          userName: this.selected[i].userName
        })
      }
      this.flag = false
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-form {
  label.el-form-item__label {
    width: 136px !important;
  }
}

::v-deep .clearfix {
  margin-bottom: 20px;
  .el-select {
    float: left;
    .el-select__tags-text {
      color: #e39606;
    }
    .el-icon-close {
      background-color: #909399;
      &:hover {
        background-color: #ff8746;
      }
    }
  }

  .ipt {
    float: right;
  }
}

.reverseColumn {
  .el-checkbox {
    margin-bottom: 10px;
  }
}

.bottomMenu {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.addOtherAccount {
  margin: 20px;

  h3 {
    margin-bottom: 20px;
  }
}
</style>
