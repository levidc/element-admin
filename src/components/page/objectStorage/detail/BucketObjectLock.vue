<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div class="param-box">
            <div class="param-hd">
              <h3>{{ $ts('bucket.objectLock') }}</h3>
              <span style="margin-left:15px;vertical-align:bottom">
                {{ $ts('bucket.wormTip') }}
              </span>
            </div>
            <div v-loading="loading">
              <el-button v-show="!switchOn" v-access="'s3:PutBucketObjectLockConfiguration'" class="modBtn" type="text"
                :disabled="!objectLockEnable" @click="showOption">
                <span style="color:#ff8746;">
                  {{ $ts('page.edit') }}
                </span>
              </el-button>
              <p class="title">{{ $ts('bucket.objectLock') }}</p>
              <p>{{ objectLockEnable ? $ts('page.enable') : $ts('page.disable') }}</p>
              <div v-if="!switchOn">
                <!-- 对象锁定未启用、隐藏默认保留期 -->
                <div v-if="objectLockEnable">
                  <p class="title">{{ $ts('bucket.defaultRetention') }}</p>
                  <p>{{ Retention }}</p>
                </div>
                <div v-if="Retention !== $ts('page.disable')">
                  <p class="title">{{ $ts('bucket.defaultRetentionMode') }}</p>
                  <p>{{ mode }}</p>
                  <p class="title">{{ $ts('bucket.defaultRetention') }}</p>
                  <p>{{ timeNumData }}</p>
                </div>
              </div>
              <div v-if="switchOn">
                <el-form ref="form" :model="form" :rules="rules">
                  <el-row>
                    <p class="title">
                      {{ $ts('bucket.defaultRetention') }}
                    </p>
                    <span class="tip">{{ $ts('bucket.defaultRetentionTip') }}</span>
                    <el-radio-group v-model="form.defaultTime" class="reverseColumn">
                      <el-radio label="disable">{{ $ts('page.disable') }}</el-radio>
                      <el-radio label="enable">{{ $ts('page.enable') }}</el-radio>
                    </el-radio-group>
                  </el-row>
                  <el-row v-if="form.defaultTime !== 'disable'">
                    <p class="title">
                      {{ $ts('bucket.defaultRetentionMode') }}
                    </p>
                    <el-radio-group v-model="form.mode" class="reverseColumn">
                      <el-radio class="modePosition" label="GOVERNANCE">{{ $ts('bucket.GOVERNANCE') }}
                        <span class="modeTip">
                          {{ $ts('bucket.GOVERNANCETip') }}
                        </span>
                      </el-radio>
                      <el-radio class="modePosition" label="COMPLIANCE">{{ $ts('bucket.COMPLIANCE') }}
                        <span class="modeTip">{{ $ts('bucket.COMPLIANCETip') }}</span>
                      </el-radio>
                    </el-radio-group>
                    <p class="title">
                      {{ $ts('bucket.defaultRetention') }}
                    </p>
                    <el-form-item prop="timeNum">
                      <el-input @input="val => form.timeNum = val.replace(/(^0+)|\D/g, '')" v-model="form.timeNum"
                        style="width:500px;margin-right:20px" size="mini" :placeholder="$ts('validate.positiveNumber')"
                        clearable />
                      <el-select v-model="expireTime" size="mini" @change="chanageExpireTime">
                        <el-option v-for="(item, index) in timeRange" :key="index" :label="item.name"
                          :value="item.value" />
                      </el-select>
                    </el-form-item>
                  </el-row>
                  <el-row style="width:730px;display:flex;justify-content:flex-end;margin-top:30px">
                    <el-button @click="switchOn = false; getObjectLock()">{{ $ts('page.cancel') }}</el-button>
                    <el-button type="primary" class="golden" @click="saveObjectLockConfig">{{ $ts('page.applySet')
                      }}</el-button>
                  </el-row>
                </el-form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    const validatorTimeNum = (rule, data, callback) => {
      const reg = new RegExp('^[0-9]+(\.[0-9]+)?$')
      if (!reg.test(data)) {
        return callback(this.$ts('validate.positiveNumber'))
      } else if (String(data)[0] == '0' && String(data)[1] !== '.') {
        return callback(this.$ts('validate.positiveNumber'))
      }
      if (this.expireTime == 'year') {
        if (data > 99) {
          return callback(this.$ts('bucket.yearRange'))
        } else {
          return callback()
        }
      }
      if (this.expireTime == 'day') {
        if (data > 36135) {
          return callback(this.$ts('bucket.dayRange'))
        } else {
          return callback()
        }
      }
    }
    return {
      loading: false,
      objectLockEnable: false,
      Retention: false,
      switchOn: false,
      mode: '',
      form: {
        mode: 'COMPLIANCE',
        defaultTime: 'enable',
        timeNum: ''
      },
      expireTime: '',
      timeNumData: '',
      timeRange: [
        { name: this.$ts('page.day'), value: 'day' },
        { name: this.$ts('page.year'), value: 'year' }
      ],
      rules: {
        timeNum: {
          trigger: ['change', 'blur'], validator: validatorTimeNum
        }
      }
    }
  },
  mounted () {
    this.getObjectLock()
  },
  methods: {
    chanageExpireTime (val) {
      if (val == 'day') {
        this.form.timeNum = ''
      } else {
        this.form.timeNum = ''
      }
    },
    saveObjectLockConfig () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          var Days = ''
          var Years = ''
          var params
          if (this.expireTime == 'day') {
            Days = Number(this.form.timeNum)
            Years = undefined
          } else {
            Years = Number(this.form.timeNum)
            Days = undefined
          }
          // 默认保留期 禁用
          if (this.form.defaultTime === 'disable') {
            params = {
              Bucket: this.$route.params.id,
              ObjectLockConfiguration: {
                ObjectLockEnabled: 'Enabled' // 禁用只传ObjectLockEnabled
              }
            }
          } else {
            params = {
              Bucket: this.$route.params.id,
              ObjectLockConfiguration: {
                ObjectLockEnabled: 'Enabled',
                Rule: {
                  DefaultRetention: {
                    Days,
                    Mode: this.form.mode,
                    Years
                  }
                }
              }
            }
          }
          // console.log(params, 'number')
          // 调用 putObjectLockConfiguration 操作
          this.$store.state.user._S3.putObjectLockConfiguration(
            params,
            (err, data) => {
              if (err) {
                this.showS3Msg(err)
                console.dir(err)
              } else {
                this.$msg({
                  type: 'success',
                  text: this.$ts('page.responseSuccess')
                })
                this.switchOn = false
                console.log(data, 'putobjectlockconfiguration')
                this.getObjectLock()
              }
            }
          )
        }
      })
    },
    getObjectLock () {
      this.loading = true
      this.$store.state.user._S3.getObjectLockConfiguration(
        {
          Bucket: this.$route.params.id
        },
        (err, data) => {
          if (err) {
            this.loading = false
            this.showS3Msg(err)
            console.dir(err)
          } else {
            this.loading = false
            console.log(data, 'objectlock')
            if (!Object.keys(data.ObjectLockConfiguration).length) {
              this.Retention = this.$ts('page.disable')
              return
            }
            this.objectLockEnable =
              data.ObjectLockConfiguration.ObjectLockEnabled === 'Enabled'

            this.Retention = data.ObjectLockConfiguration.Rule.DefaultRetention
              .Mode
              ? this.$ts('page.enable')
              : this.$ts('page.disable')
            // 默认保留期 开启 、关闭
            this.form.defaultTime = data.ObjectLockConfiguration.Rule
              .DefaultRetention.Mode
              ? 'enable'
              : 'disable'
            // console.log(
            //   Object.keys(data.ObjectLockConfiguration).length,
            //   'length'
            // )
            // 默认保留模式
            this.mode =
              data.ObjectLockConfiguration.Rule.DefaultRetention.Mode ===
                'GOVERNANCE'
                ? this.$ts('bucket.GOVERNANCE')
                : this.$ts('bucket.COMPLIANCE')

            this.timeNumData = data.ObjectLockConfiguration.Rule
              .DefaultRetention.Days
              ? data.ObjectLockConfiguration.Rule.DefaultRetention.Days + ' ' + this.$ts('page.day')
              : data.ObjectLockConfiguration.Rule.DefaultRetention.Years + ' ' + this.$ts('page.year')

            this.form.mode =
              data.ObjectLockConfiguration.Rule.DefaultRetention.Mode ||
              'GOVERNANCE'
            // console.log(this.timeNumData, 'timenum')
            // 默认保留期 天/年
            this.form.timeNum = Number(this.timeNumData.split(' ')[0])
              ? this.timeNumData.split(' ')[0]
              : ''
            this.expireTime =
              this.timeNumData.split(' ')[1] === this.$ts('page.day') ? 'day' : 'year'
          }
        }
      )
    },
    showOption () {
      this.switchOn = true
    }
  }
}
</script>
<style lang="scss" scoped>
.el-radio {
  margin: 8px 0;
}

.title {
  font-size: 14px;
  margin: 15px 0 4px 0;
  color: #d3d6d8;
}

.tip {
  color: #d3d6d8;
}

.modePosition {
  position: relative;
  margin-bottom: 20px;
}

.modeTip {
  position: absolute;
  top: 20px;
  left: 25px;
  font-size: 12px;
  color: #d3d6d8;
}

.modBtn.is-disabled {
  span {
    color: #ad6c48 !important;
  }
}
</style>
