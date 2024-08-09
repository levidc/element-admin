<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div class="param-box">
            <div class="param-hd">
              <h3>对象锁定</h3>
              <span style="margin-left:15px;vertical-align:bottom">使用一次写入多次读取(WORM)模型存储对象，防止对象在固定的时间段内或无限期地被删除或覆盖。</span>
            </div>
            <div v-loading="loading">
              <el-button
                v-show="!switchOn"
                v-access="'s3:PutBucketObjectLockConfiguration'"
                class="modBtn"
                type="text"
                :disabled="!objectLockEnable"
                @click="showOption"
              >
                <span style="color:#ff8746;">
                  编辑
                </span>
              </el-button>
              <p class="title">对象锁定</p>
              <p>{{ objectLockEnable?'已启用':'已禁用' }}</p>
              <div v-if="!switchOn">
                <!-- 对象锁定未启用、隐藏默认保留期 -->
                <div v-if="objectLockEnable">
                  <p class="title">默认保留期</p>
                  <p>{{ Retention }}</p>
                </div>
                <div v-if="Retention!=='未启用'">
                  <p class="title">默认保留模式</p>
                  <p>{{ mode }}</p>
                  <p class="title">默认保留期</p>
                  <p>{{ timeNumData }}</p>
                </div>
              </div>
              <div v-if="switchOn">
                <el-form
                  ref="form"
                  :model="form"
                  :rules="rules"
                >
                  <el-row>
                    <p class="title">
                      默认保留期
                    </p>
                    <span class="tip">自动保护置入此存储桶的新对象，保证其不被删除或覆盖。</span>
                    <el-radio-group
                      v-model="form.defaultTime"
                      class="reverseColumn"
                    >
                      <el-radio label="disable">禁用</el-radio>
                      <el-radio label="enable">启用</el-radio>
                    </el-radio-group>
                  </el-row>
                  <el-row v-if="form.defaultTime!=='disable'">
                    <p class="title">
                      默认保留模式
                    </p>
                    <el-radio-group
                      v-model="form.mode"
                      class="reverseColumn"
                    >
                      <el-radio
                        class="modePosition"
                        label="GOVERNANCE"
                      >监管
                        <span class="modeTip">
                          在保留期内，具有特定权限的用户可以覆盖或删除受保护的对象版本。
                        </span>
                      </el-radio>
                      <el-radio
                        class="modePosition"
                        label="COMPLIANCE"
                      >合规
                        <span class="modeTip">在保留期内，任何用户都不能覆盖或删除受保护的对象版本。</span>
                      </el-radio>
                    </el-radio-group>
                    <p class="title">
                      默认保留期
                    </p>
                    <el-form-item prop="timeNum">
                      <el-input
                        v-model="form.timeNum"
                        style="width:500px;margin-right:20px"
                        size="mini"
                        placeholder="输入数字"
                        clearable
                      />
                      <el-select
                        v-model="expireTime"
                        size="mini"
                        @change="chanageExpireTime"
                      >
                        <el-option
                          v-for="(item,index) in timeRange"
                          :key="index"
                          :label="item.name"
                          :value="item.value"
                        />
                      </el-select>
                    </el-form-item>
                  </el-row>
                  <el-row style="width:730px;display:flex;justify-content:flex-end;margin-top:30px">
                    <el-button @click="switchOn=false;getObjectLock()">取消</el-button>
                    <el-button
                      type="primary"
                      class="golden"
                      @click="saveObjectLockConfig"
                    >保存更改</el-button>
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
        return callback('请输入有效的数值')
      } else if (String(data)[0] == '0' && String(data)[1] !== '.') {
        return callback('请输入有效的数值')
      }
      if (this.expireTime == 'year') {
        if (data > 99) {
          return callback(`当前配置的保留期不能大于99年`)
        } else {
          return callback()
        }
      }
      if (this.expireTime == 'day') {
        if (data > 36135) {
          return callback(`当前配置的保留期不能大于36135天`)
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
        { name: '天', value: 'day' },
        { name: '年', value: 'year' }
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
          this.$store.state._S3.putObjectLockConfiguration(
            params,
            (err, data) => {
              if (err) {
                this.showS3Msg(err)
                console.dir(err)
              } else {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
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
      this.$store.state._S3.getObjectLockConfiguration(
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
              this.Retention = '未启用'
              return
            }
            this.objectLockEnable =
              data.ObjectLockConfiguration.ObjectLockEnabled === 'Enabled'

            this.Retention = data.ObjectLockConfiguration.Rule.DefaultRetention
              .Mode
              ? '已启用'
              : '未启用'
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
                ? '监管'
                : '合规'

            this.timeNumData = data.ObjectLockConfiguration.Rule
              .DefaultRetention.Days
              ? data.ObjectLockConfiguration.Rule.DefaultRetention.Days + ' 天'
              : data.ObjectLockConfiguration.Rule.DefaultRetention.Years + ' 年'

            this.form.mode =
              data.ObjectLockConfiguration.Rule.DefaultRetention.Mode ||
              'GOVERNANCE'
            console.log(this.timeNumData, 'timenum')
            // 默认保留期 天/年
            this.form.timeNum = Number(this.timeNumData.split(' ')[0])
              ? this.timeNumData.split(' ')[0]
              : ''
            this.expireTime =
              this.timeNumData.split(' ')[1] === '天' ? 'day' : 'year'
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
