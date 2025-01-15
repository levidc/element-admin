<template>
  <div>
    <div v-loading="loading" class="container page_content_wrap">
      <div v-show="!loading" class="globalstyle">
        <h2 style="font-size: 17px;">{{ $ts('globalConfig.title') }}</h2>
        <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
          <i class="el-icon-refresh" @click="getConfig()" />
        </el-tooltip>
      </div>
      <el-form v-show="!loading" ref="form" :model="form" class="form" label-width="150px" :rules="rules">
        <el-form-item prop="notSafeAuth">
          <span slot="label">
            {{ $ts('globalConfig.LowSecurityLevelAuthentication') }}
            <el-popover width="360" trigger="hover" placement="top-start" :open-delay="200"
              :content="$ts('globalConfig.LowSecurityLevelAuthenticationDesc')">
              <svg slot="reference" class="icon icon-question" aria-hidden="true">
                <use xlink:href="#icon-question" />
              </svg>
            </el-popover>
          </span>
          <el-radio-group v-model="form.notSafeAuth" :disabled="formControl.editAuthSafe">
            <el-radio :label="false">{{ $ts('page.close') }}</el-radio>
            <el-radio :label="true">{{ $ts('page.open') }}</el-radio>
          </el-radio-group>
          <i v-show="disabledEdit('editAuthSafe')" class="el-icon-edit-outline" @click="edit('editAuthSafe')" />
        </el-form-item>
        <el-form-item prop="openQos">
          <span slot="label">
            {{ $ts('globalConfig.qosControl') }}
          </span>
          <el-radio-group v-model="form.openQos" :disabled="formControl.editQos">
            <el-radio :label="false">{{ $ts('page.close') }}</el-radio>
            <el-radio :label="true">{{ $ts('page.open') }}</el-radio>
          </el-radio-group>
          <i v-show="disabledEdit('editQos')" class="el-icon-edit-outline" @click="edit('editQos')" />
        </el-form-item>
        <el-form-item prop="gatewayCount" :label="$ts('globalConfig.NumberofGatewayNodes')">
          <el-input v-model="form.gatewayCount" :placeholder="$ts('validate.positiveNumberRange', { min: 1, max: 200 })"
            style="width:250px" :disabled="formControl.editGateway" @input="renderPositiveNum()" clearable />
          <i v-show="disabledEdit('editGateway')" class="el-icon-edit-outline" @click="edit('editGateway')" />
        </el-form-item>
        <el-form-item v-show="golden" label=" ">
          <el-row class="mv_20">
            <el-button type="default" class="blue" @click="editVersionControls('form')">{{ $ts('page.cancel') }}
            </el-button>
            <el-button class="golden" :loading="loading" @click="onCheckSave">{{ $ts('page.save') }}
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
  data () {
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
            if (Number(val) == 0 || Number(val) > 200) {
              return cb(this.$ts('validate.positiveNumberRange', { min: 1, max: 200 }))
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
  mounted () {
    this.getConfig()
  },
  methods: {
    disabledEdit (key) {
      return Object.keys(this.formControl).filter(x => x !== key).every(x => this.formControl[x])
    },
    renderPositiveNum () {
      this.form.gatewayCount = Number(String(this.form.gatewayCount)
        .replace(/(^0+)|\D/g, '')
        .replace(/\b(20[1-9]|2[1-9][0-9]|[3-9][0-9]{2}|[1-9][0-9]{3,})\b/g, '200')) ||
        ''
    },
    getConfig () {
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
        err.msg && this.$msg(
          {
            type: 'error',
            text: this.$ts(err.msg)
          }
        )
      }).finally(() => {
        this.loading = false
      })
    },
    onCheckSave () {
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
                this.$msg({
                  type: 'success',
                  text: this.$ts('page.responseSuccess')
                })
              }
              this.golden = false
              // console.log(res)
            }).catch((err) => {
              if (err.msg) {
                this.$msg(
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
    edit (editKey) {
      this.golden = true
      this.formControl[editKey] = false
    },
    editVersionControls () {
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
  width: 250px;

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
