<template>
  <div>
    <div
      v-loading="loading"
      class="container page_content_wrap"
    >
      <div
        v-show="!loading"
        class="globalstyle"
      >
        <h2 style="font-size: 17px;">全局配置</h2>
        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            class="el-icon-refresh"
            @click="getConfig()"
          />
        </el-tooltip>
      </div>
      <el-form
        v-show="!loading"
        ref="form"
        :model="form"
        class="form"
        label-width="150px"
        :rules="rules"
      >
        <el-form-item prop="notSafeAuth">
          <span slot="label">
            低安全等级鉴权
            <el-popover
              width="360"
              trigger="hover"
              placement="top-start"
              :open-delay="200"
              content="统一认证中心服务不可用时，会影响console用户无法登录控制台，以及会影响token即将到期的gateway用户无法进行put、get等需要进行S3鉴权的操作。开启后，可以让以上描述的console用户和gateway用户能正常使用。"
            >
              <i
                slot="reference"
                class="fa fa-question-circle"
              />
            </el-popover>
          </span>
          <el-radio-group
            v-model="form.notSafeAuth"
            :disabled="formControl.editAuthSafe"
          >
            <el-radio :label="false">关闭</el-radio>
            <el-radio :label="true">开启</el-radio>
          </el-radio-group>
          <i
            v-show="disabledEdit('editAuthSafe')"
            class="el-icon-edit-outline"
            @click="edit('editAuthSafe')"
          />
        </el-form-item>
        <el-form-item prop="openQos">
          <span slot="label">
            QoS管理开关
          </span>
          <el-radio-group
            v-model="form.openQos"
            :disabled="formControl.editQos"
          >
            <el-radio :label="false">关闭</el-radio>
            <el-radio :label="true">开启</el-radio>
          </el-radio-group>
          <i
            v-show="disabledEdit('editQos')"
            class="el-icon-edit-outline"
            @click="edit('editQos')"
          />
        </el-form-item>
        <el-form-item
          prop="gatewayCount"
          label="Gateway节点数"
        >
          <el-input
            v-model="form.gatewayCount"
            placeholder="请输入正整数"
            style="width:134px"
            :disabled="formControl.editGateway"
            @input="renderPositiveNum()"
          />
          <i
            v-show="disabledEdit('editGateway')"
            class="el-icon-edit-outline"
            @click="edit('editGateway')"
          />
        </el-form-item>
        <el-form-item
          v-show="golden"
          label=" "
        >
          <el-row class="mv_20">
            <el-button
              type="default"
              class="blue"
              @click="editVersionControls('form')"
            >取消
            </el-button>
            <el-button class="golden" :loading="loading" @click="onCheckSave">{{ $ts('save') }}
            </el-button>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import { getGlobalConfig, setGlobalConfig } from '@/api/dashboard'
export default {
  name: 'GlobalConifg',
  data() {
    return {
      formControl: {
        editAuthSafe: true,
        editQos: true,
        editGateway: true
      },
      golden: false,
      form: {
        notSafeAuth: false,
        openQos: false,
        gatewayCount: 1
      },
      loading: false,
      rules: {
        gatewayCount: {
          validator: (_, val, cb) => {
            if (Number(val) == 0) {
              return cb('请输入1-200的整数')
            } else if (Number(val) > 200) {
              return cb('请输入1-200的整数')
            } else {
              return cb('')
            }
          }
        }
      }
    }
  },
  computed: {
  },
  watch: {
  },
  mounted() {
    this.getConfig()
  },
  methods: {
    disabledEdit(key) {
      return Object.keys(this.formControl).filter(x => x !== key).every(x => this.formControl[x])
    },
    renderPositiveNum() {
      this.form.gatewayCount = Number(String(this.form.gatewayCount)
        .replace(/(^0+)|\D/g, '')
        .replace(/\b(20[1-9]|2[1-9][0-9]|[3-9][0-9]{2}|[1-9][0-9]{3,})\b/g, '200')) ||
        ''
    },
    getConfig() {
      this.formControl = {
        editAuthSafe: true,
        editQos: true,
        editGateway: true
      }
      this.loading = true
      getGlobalConfig().then((res) => {
        const {
          notSafeAuth,
          openQos,
          gatewayCount
        } = res.data
        this.form.notSafeAuth = notSafeAuth || false
        this.form.openQos = openQos || false
        this.form.gatewayCount = gatewayCount || 1
      }).catch((err) => {
        err.msg && this.$ts(
          {
            type: 'error',
            text: this.$ts(err.msg)
          }
        )
      }).finally(() => {
        this.loading = false
      })
    },
    onCheckSave() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          const { notSafeAuth, openQos, gatewayCount } = this.form
          setGlobalConfig({
            notSafeAuth,
            openQos,
            gatewayCount
          })
            .then((res) => {
              if (res.msg === 'success') {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
              }
              this.golden = false
              // console.log(res)
            }).catch((err) => {
              if (err.msg) {
                this.$ts(
                  {
                    type: 'error',
                    text: this.$ts(err.msg)
                  }
                )
              }
              console.log(err, 'err')
            }).finally(() => {
              this.getConfig()
            })
        }
      })
    },
    edit(editKey) {
      this.golden = true
      this.formControl[editKey] = false
    },
    editVersionControls() {
      this.golden = false
      this.getConfig()
    }
  }
}
</script>
<style scoped lang="scss">
::v-deep .form {
  padding: 15px 0 20px 0;
  label.el-form-item__label {
    width: auto !important;
    margin-left: 0 !important;
  }
}

::v-deep .value-input {
  margin-left: 22px !important;
  margin-top: -3px !important;
}
::v-deep .el-form-item {
  margin-bottom: 5px;
}
::v-deep .el-form-item__content {
  margin-left: 170px !important;
}
.globalstyle {
  display: flex;
  justify-content: space-between;
  position: relative;
}
.editestyle {
  position: absolute;
  left: 70px;
  color: rgb(255, 135, 70);
  margin-top: 6px;
  margin-left: 10px;
}

.container {
  min-height: 100px;
  margin: 20px 50px 0;
  box-shadow: 0 4px 15px 0 rgb(0, 0, 0, 0.4);
}

:deep(.el-input-number) {
  width: 134px;
  .el-input-number__decrease {
    height: 15px !important;
    bottom: 2px;
    line-height: 14px;
    right: 0px;
  }
  .el-input-number__increase {
    line-height: 15px;
    height: 16px !important;
    top: 5px;
    right: 0px;
  }
}

.el-icon-edit-outline {
  font-size: 22px;
  cursor: pointer;
  color: #ff8746;
  position: relative;
  top: 3px;
  left: 15px;
}
</style>
