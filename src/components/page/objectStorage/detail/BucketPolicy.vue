<template>
  <div class="bucket-panel param-box">
    <div class="param-hd">
      <h3>存储桶策略 </h3>
      <span
        v-if="editConfig"
        class="right"
      >
        <el-button
          class="medium blue"
          @click="editConfig = false; getBucketPolicy()"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          class="golden medium"
          @click="onSave"
        >
          保存策略
        </el-button>
      </span>
      <span
        v-if="!editConfig && !loading"
        class="editMenu"
      >
        <el-button
          v-access="'s3:PutBucketPolicy'"
          type="text"
          class="link-edit"
          @click="editPolicy"
        >
          <span style="color:#ff8746">编辑</span>
        </el-button>
        <el-button
          v-access="'s3:DeleteBucketPolicy'"
          type="text"
          class="delBtn link-edit"
          :disabled="disableDel"
          @click="deletePolicy"
        >
          <span style="color:#ff3d6b">删除</span>
        </el-button>
      </span>
    </div>
    <!-- jsonView && Strategy -->
    <div v-loading="loading">
      <div v-show="!loading">
        <div
          v-show="!editConfig && !nullPolicy"
          class="mt_10"
        >
          <json-viewer
            v-show="!editConfig && !nullPolicy"
            :value="dataList"
            preview-mode
            :show-array-index="false"
            boxed
            theme="my-awesome-json-theme"
            :copyable="{
              copyText: '复制', copiedText: '已复制'
            }"
          />
        </div>
        <p
          v-show="nullPolicy && !editConfig"
          style="font-size: 16px;"
          class="mt_20"
        >没有相关的存储桶策略</p>
        <Strategy
          v-if="editConfig && actionHandle"
          ref="strategy"
          v-model="strategy"
          :editable="editable"
          :action-config="actionConfig"
          style="margin-top:20px;"
          statement-action-merge-group
          :statement-action-label-width="'100px'"
          :statement-action-item-width="'300px'"
        />
      </div>
    </div>
    <el-dialog
      :title="nullPolicy ? '创建桶策略' : '修改桶策略'"
      :visible.sync="flag"
      width="40%"
    >
      <div style="width: 100%">
        <json-viewer
          :value="jsonString"
          preview-mode
          boxed
          :show-array-index="false"
          :copyable="{ 'copyText': '复制', 'copiedText': '已复制' }"
          theme="my-awesome-json-theme"
        />
      </div>
      <div slot="footer">
        <el-button
          class="blue"
          @click="flag = false"
        >{{ $ts("cancel") }}</el-button>
        <el-button
          type="primary"
          class="golden"
          @click="submitCreate"
        >{{ $ts("true") }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ActionList } from '@/api/policy'
import Strategy from '@/components/strategy/Strategy'
import JsonViewer from 'vue-json-viewer'
export default {
  components: {
    JsonViewer,
    Strategy
  },
  data () {
    return {
      editConfig: false,
      jsonString: '',
      disableDel: true,
      dataList: '',
      nullPolicy: false,
      loading: true,
      editable: false,
      actionConfig: [],
      strategy: {},
      flag: false,
      actionHandle: false,
      verobject: ''
    }
  },
  watch: {
    editConfig (val) {
      if (val) {
        this.getAction()
      }
    }
  },
  mounted () {
    this.getBucketPolicy()
  },
  methods: {
    getAction () {
      this.loading = true
      ActionList()
        .then(res => {
          const arr = [
            {
              key: 's3',
              label: 's3权限',
              children: []
            }
          ]
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].indexOf('s3:') > -1) {
              arr[0].children.push(res.data[i])
            }
          }
          arr[0].children = [...new Set(arr[0].children)]
            .sort((a, b) => {
              return a.localeCompare(b)
            })
            .map(item => {
              return {
                key: item,
                label: item
              }
            })
          this.actionConfig = arr
          this.actionHandle = true
          this.$nextTick(() => {
            this.$refs['strategy'].openAll()
          })
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getBucketPolicy () {
      this.loading = true
      this.$store.state._S3.getBucketPolicy(
        {
          Bucket: this.$route.params.id
        },
        (err, data) => {
          this.loading = false
          if (err) {
            if (err.code !== 'InternalError') {
              this.showS3Msg(err)
            } else {
              this.$set(this, 'jsonString', {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Action: [], // 具体操作api
                    Resource: [], // 访问存储桶中的资源
                    Condition: {},
                    Principal: '' // 授权多个S3账户
                  }
                ]
              })
              this.strategy = this.jsonString
            }
            this.nullPolicy = true
            console.log(err)
          } else {
            console.log('policy', data)
            if (data.Policy == '') {
              this.$set(this, 'jsonString', {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Action: [], // 具体操作api
                    Resource: [], // 访问存储桶中的资源
                    Condition: {},
                    Principal: '' // 授权多个S3账户
                  }
                ]
              })
              this.strategy = this.jsonString
              this.nullPolicy = true
              this.disableDel = true
            } else {
              const policy = JSON.parse(data.Policy)
              const jsonString = JSON.parse(data.Policy)
              policy.Statement.forEach(item => {
                // 处理 Principal、 Resource 单个传递str、多个list
                // item.Action = JSON.parse(item.Action)
                // 返回字符串传递需list 临时转变
                if (typeof item.Principal === 'string') {
                  item.Principal = [item.Principal]
                } // item.Principal = [item.Principal]
                if (typeof item.Resource === 'string') {
                  item.Resource = [item.Resource]
                } // item.Principal = [item.Principal]
                if (typeof item.Action === 'string') {
                  item.Action = [item.Action]
                } // item.Principal = [item.Principal]
                // item.Resource = [item.Resource]
              })
              this.jsonString = {
                Version: jsonString.Version,
                Statement: jsonString.Statement
              }
              this.strategy = policy
              // this.Strategy.name = 'random'
              this.nullPolicy = false
              this.disableDel = false
              this.dataList = this.jsonString
              // console.log(data, policy, 'getBucketPolicy')
            }
          }
        }
      )
    },
    deletePolicy () {
      this.$confirm('删除当前存储桶的策略', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.state._S3.deleteBucketPolicy(
          {
            Bucket: this.$route.params.id
          },
          (err, data) => {
            if (err) {
              this.showS3Msg(err)
              console.dir(err)
            } else {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.dataList = ''
              this.editConfig = false
              // console.log(data, "deleteBucketPolicy");
              this.getBucketPolicy()
            }
          }
        )
      })
    },
    submitCreate () {
      // str 空值为'',空{}为json字符串,保证最基本有效的校验
      // const str = this.$refs['jsonEditor'].editor.getText()
      // const isValid = Object.keys(JSON.parse(str || '{}')).length
      // if (!isValid) {
      //   return this.$ts({
      //     type: 'error',
      //     text: '策略内容不合法'
      //   })
      // }
      // if (this.hasJsonFlag == false) {
      //   return this.$ts({
      //     type: 'error',
      //     text: 'json格式不正确'
      //   })
      // } else {

      this.$store.state._S3.putBucketPolicy(
        {
          Bucket: this.$route.params.id,
          Policy: JSON.stringify(this.jsonString)
          // Policy: JSON.stringify(this.$refs['jsonEditor'].editor.getText())
        },
        (err, data) => {
          if (err) {
            this.showS3Msg(err)
            console.dir(err)
          } else {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.editConfig = !this.editConfig
            this.flag = false
            this.getBucketPolicy()
            // console.log(data, 'data')
          }
        }
      )
    },
    editPolicy () {
      // 切换编辑
      this.editConfig = !this.editConfig
      this.editable = true
    },
    async onSave () {
      for (let i = 0; i < this.strategy.Statement.length; i++) {
        try {
          if (!this.strategy.Statement[i].Principal.length) {
            await this.$message.error('每个授权语句至少需要设置一个授权用户').then(() => Promise.reject())
            return
          }
          const reg = /^([0-9a-zA-Z-_.?*][/]?)+$/
          this.strategy.Statement[i].Resource.find(item => {
            // 需要截取第一个'/'
            const str = item.substring(item.indexOf('/') + 1)
            // console.log(str,'reg')
            if (!reg.test(str)) {
              this.$message.error(`对象格式错误，仅支持英文、数字和/-_.?*且不能以"/"开头或者连续"/"`).then(() => Promise.reject())
              return
            }
          })
          if (!this.strategy.Statement[i].Resource.length) {
            await this.$message.error('每个授权语句至少需要设置一个资源配置').then(() => Promise.reject())
            return
          }
          if (!this.strategy.Statement[i].Action.length) {
            await this.$message.error('每个授权语句至少需要分配一个权限').then(() => Promise.reject())
            return
          }
          if ([...(new Set(this.strategy.Statement[i].Resource))].length < this.strategy.Statement[i].Resource.length) {
            await this.$message.error('资源配置重复，请检查').then(() => Promise.reject())
            return
          }
        } catch (error) {
          return
        }
      }

      this.jsonString = {
        Version: '2012-10-17',
        Statement: this.strategy.Statement
      }
      this.flag = true
    }
  }
}
</script>
<style lang="scss" scoped>
.bucket-detail {
  .param-hd {
    .clearfix {
      h3 {
        margin-right: 20px;
      }

      .bucketName {
        font-size: 24px;
        font-weight: 600;
        color: #ff8746;
        margin-bottom: 10px;
      }

      .editMenu {
        display: inline-block;
        vertical-align: middle;
      }
    }
  }

  // border
}

.tip {
  color: #d3d6d8;
}

.delBtn.is-disabled {
  span {
    color: #b1546a !important;
  }
}

.enableACL {
  display: flex;
  flex-direction: column;
  margin: 20px 0;

  .el-radio {
    margin-bottom: 15px;
  }
}

.bottomMenu {
  display: flex;
  justify-content: flex-end;
  margin-top: -30px;
  cursor: pointer;
  margin-right: 5px;

  i {
    border: 1px solid #ccc;
    padding: 5px;
    z-index: 99;
    font-size: 16px;
    margin-left: 10px;
  }
}

::v-deep .jv-container {
  .jv-push {
    .jv-node {
      line-height: 16px;
    }
  }

  .jv-code.boxed {
    max-height: 500px !important;
  }
}
.bucket-panel {
  padding: 20px;
  margin: 20px;
}
:deep(.strategy) {
  .topMenu + div {
    height: auto !important;
  }
}
</style>
