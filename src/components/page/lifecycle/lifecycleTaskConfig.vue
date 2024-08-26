<template>
  <div>
    <div
      v-loading="loading"
      class="container page_content_wrap"
    >
      <div v-show="!loading">
        <div class="globalstyle">
          <h2 style="font-size: 17px;">配置</h2>
          <span
            v-show="isshow"
            class="editestyle"
            @click="edit()"
          ><a>编辑</a></span>
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
          ref="form"
          :model="form"
          :rules="rules"
          class="form"
          hide-required-asterisk
          label-width="150px"
        >
          <el-form-item
            prop="expireDays"
            class="expire-days"
          >
            <span slot="label">
              <span>回收站</span>
              <el-popover
                width="300"
                trigger="hover"
                placement="top-start"
                :open-delay="200"
              >
                <span>删除的对象会进入回收站（逻辑删除），可在删除留痕里查看和恢复，超出设置的过期时间后会进行物理删除，物理删除后不可恢复。</span>
                <p> 关闭回收站时，会在设置的时间段（闭市后）进行物理删除。</p>
                <i
                  slot="reference"
                  class="fa fa-question-circle"
                  style="margin-left:5px"
                />
              </el-popover>
            </span>
            <QuickDefault
              v-model="form.expireDays"
              :default-value="0"
              label-of-default="关闭"
              label-of-value="开启"
              class="defaultstyle"
              :disabled="disableds"
            >
              <template #default="{ data, onChange: onExpireDaysChange }">
                删除留痕过期时间
                <el-input
                  v-model="data.value"
                  placeholder="请输入"
                  style="width: 100px;"
                  :min="1"
                  :disabled="disableds"
                  @input="value => {data.value = Number(value) > 36135 ? 36135 : value.replace(/(^0+)|\D/g, '');onExpireDaysChange() }"
                >
                  <span slot="suffix">天</span>
                </el-input>
              </template>
            </QuickDefault>
          </el-form-item>
          <el-form-item prop="enableTask">
            <div slot="label">
              <span>定时任务</span>
            </div>
            <el-radio-group
              v-model="form.enableTask"
              :disabled="disableds"
            >
              <el-radio :label="false">关闭</el-radio>
              <el-radio :label="true">开启</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-show="form.enableTask"
            label="物理删除任务执行时间"
            class="paddingForm"
          >
            <div class="timeSelect">
              <el-form-item prop="startTime">
                <el-select
                  v-model="form.startTime"
                  placeholder="起始时间"
                  :disabled="disableds"
                  clearable
                >
                  <el-option
                    v-for="item in timeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled"
                  />
                </el-select>
              </el-form-item>
              <span class="separator"> ~ </span>
              <el-form-item prop="endTime">
                <el-select
                  v-model="form.endTime"
                  placeholder="结束时间"
                  :disabled="disableds"
                  clearable
                  @change="validateStartTime('physics')"
                >
                  <el-option
                    v-for="item in timeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item
            v-show="form.enableTask"
            label="生命周期任务执行时间"
            class="paddingForm"
          >
            <div class="timeSelect">
              <el-form-item prop="startLifycle">
                <el-select
                  v-model="form.startLifycle"
                  placeholder="起始时间"
                  :disabled="disableds"
                  clearable
                >
                  <el-option
                    v-for="item in timeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled"
                  />
                </el-select>
              </el-form-item>
              <span class="separator"> ~ </span>
              <el-form-item prop="endLifecycle">
                <el-select
                  v-model="form.endLifecycle"
                  placeholder="结束时间"
                  :disabled="disableds"
                  clearable
                  @change="validateStartTime('lifecycle')"
                >
                  <el-option
                    v-for="item in timeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.disabled"
                  />
                </el-select>
              </el-form-item>
            </div>
          </el-form-item>
          <el-form-item
            v-show="golden"
            label=" "
          >
            <el-row>
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
  </div>
</template>
<script>
import { getGlobalConfig, setGlobalConfig } from '@/api/dashboard'
import { getRule, updateRule, setRuleOpen } from '@/api/lifecycle'
import QuickDefault from '@/components/QuickDefault'
export default {
  name: 'LifecycleTaskConfig',
  components: {
    QuickDefault
  },
  data() {
    return {
      editFlag: false,
      isshow: true,
      disableds: true,
      cancel: false,
      golden: false,
      form: {
        enableTask: false,
        expireDays: 0,
        startTime: '',
        endTime: '',
        startLifycle: '',
        endLifecycle: ''
      },
      isEnable: false,
      loading: false,
      rules: {
        expireDays: [
          {
            trigger: ['change', 'blur'], validator: (_, data, callback) => {
              if (data === '') {
                return callback('请输入有效的数值')
              } else {
                return callback()
              }
            }
          }
        ],
        startTime: {
          trigger: ['change', 'blur'],
          validator: (_, __, cb) => {
            const endTime = this.form.endTime
            // 计算时间范围、第一天0-24、第二天默认按24+0-24计算
            const val = this.form.startTime
            const start = Number(val.substring(0, 2))
            const end = Number(endTime.substring(0, 2))
            if (val === '') {
              return cb('请选择开始时间')
            } else if (val && endTime) {
              if (start > end) {
                return cb('开始时间不能晚于结束时间')
              } else if (end - start > 24) {
                return cb('最大可配置时间段不能超过24h，请修改')
              } else {
                return cb()
              }
            } else {
              return cb()
            }
          }
        },
        startLifycle: {
          trigger: ['change', 'blur'],
          validator: (_, __, cb) => {
            const val = this.form.startLifycle
            const endTime = this.form.endLifecycle
            const start = Number(val.substring(0, 2))
            const end = Number(endTime.substring(0, 2))
            if (val === '') {
              return cb('请选择开始时间')
            } else if (val && endTime) {
              if (start > end) {
                return cb('开始时间不能晚于结束时间')
              } else if (end - start > 24) {
                return cb('最大可配置时间段不能超过24h，请修改')
              } else {
                return cb()
              }
            } else {
              return cb()
            }
          }
        },
        endTime: [
          { trigger: ['change', 'blur'], required: true, message: '请选择结束时间' }
        ],
        endLifecycle: [
          { trigger: ['change', 'blur'], required: true, message: '请选择结束时间' }
        ]
      },
      timeList: [
        { value: '00:00', label: '当日 00:00' },
        { value: '01:00', label: '当日 01:00' },
        { value: '02:00', label: '当日 02:00' },
        { value: '03:00', label: '当日 03:00' },
        { value: '04:00', label: '当日 04:00' },
        { value: '05:00', label: '当日 05:00' },
        { value: '06:00', label: '当日 06:00' },
        { value: '07:00', label: '当日 07:00' },
        { value: '08:00', label: '当日 08:00' },
        { value: '09:00', label: '当日 09:00' },
        { value: '10:00', label: '当日 10:00' },
        { value: '11:00', label: '当日 11:00' },
        { value: '12:00', label: '当日 12:00' },
        { value: '13:00', label: '当日 13:00' },
        { value: '14:00', label: '当日 14:00' },
        { value: '15:00', label: '当日 15:00' },
        { value: '16:00', label: '当日 16:00' },
        { value: '17:00', label: '当日 17:00' },
        { value: '18:00', label: '当日 18:00' },
        { value: '19:00', label: '当日 19:00' },
        { value: '20:00', label: '当日 20:00' },
        { value: '21:00', label: '当日 21:00' },
        { value: '22:00', label: '当日 22:00' },
        { value: '23:00', label: '当日 23:00' },
        { value: '24:00', label: '次日 00:00' },
        { value: '25:00', label: '次日 01:00' },
        { value: '26:00', label: '次日 02:00' },
        { value: '27:00', label: '次日 03:00' },
        { value: '28:00', label: '次日 04:00' },
        { value: '29:00', label: '次日 05:00' },
        { value: '30:00', label: '次日 06:00' },
        { value: '31:00', label: '次日 07:00' },
        { value: '32:00', label: '次日 08:00' },
        { value: '33:00', label: '次日 09:00' },
        { value: '34:00', label: '次日 10:00' },
        { value: '35:00', label: '次日 11:00' },
        { value: '36:00', label: '次日 12:00' },
        { value: '37:00', label: '次日 13:00' },
        { value: '38:00', label: '次日 14:00' },
        { value: '39:00', label: '次日 15:00' },
        { value: '40:00', label: '次日 16:00' },
        { value: '41:00', label: '次日 17:00' },
        { value: '42:00', label: '次日 18:00' },
        { value: '43:00', label: '次日 19:00' },
        { value: '44:00', label: '次日 20:00' },
        { value: '45:00', label: '次日 21:00' },
        { value: '46:00', label: '次日 22:00' },
        { value: '47:00', label: '次日 23:00' },
        { value: '48:00', label: '次日 24:00' }
      ],
      Unit: [
        { label: 'GB', value: 'GB' },
        { label: 'TB', value: 'TB' }
      ]
    }
  },
  computed: {
    // startTimeSel () {
    //   return function (type) {
    //     if (type === 'physics') {
    //       if (!this.form.endTime) return this.timeList
    //       else {
    //         const index = this.timeList.findIndex(x => x.value === this.form.endTime)
    //         // return this.timeList.filter((x, i) => i < index && index - i <= 24)
    //         return this.timeList.map((x, i) => {
    //           return {
    //             ...x,
    //             disabled: i >= index || index - i > 24
    //             // 禁用条件、开始时间在结束时间之后 及 开始时间范围超过24h
    //           }
    //         })
    //       }
    //     } else {
    //       if (!this.form.endLifecycle) return this.timeList
    //       else {
    //         const index = this.timeList.findIndex(x => x.value === this.form.endLifecycle)
    //         // return this.timeList.filter((x, i) => i < index && index - i <= 24)
    //         return this.timeList.map((x, i) => {
    //           return {
    //             ...x,
    //             disabled: i >= index || index - i > 24
    //           }
    //         })
    //       }
    //     }
    //   }
    // },

    // endTimeSel () {
    //   // 结束时间 0-24
    //   return function (type) {
    //     if (type === 'physics') {
    //       if (!this.form.startTime) return this.timeList
    //       else {
    //         const index = this.timeList.findIndex(x => x.value === this.form.startTime)
    //         // return this.timeList.filter((x, i) => i > index && i - index <= 24)
    //         return this.timeList.map((x, i) => {
    //           return {
    //             ...x,
    //             disabled: i <= index || i - index > 24
    //             // 禁用条件、结束时间在开始时间前或大于24h时间段
    //           }
    //         })
    //       }
    //     } else {
    //       if (!this.form.startLifycle) return this.timeList
    //       else {
    //         const index = this.timeList.findIndex(x => x.value === this.form.startLifycle)
    //         // return this.timeList.filter((x, i) => i > index && i - index <= 24)
    //         return this.timeList.map((x, i) => {
    //           return {
    //             ...x,
    //             disabled: i <= index || i - index > 24
    //           }
    //         })
    //       }
    //     }
    //   }
    // },
  },
  watch: {
  },
  mounted() {
    this.getConfig()
  },
  methods: {
    validateStartTime(type) {
      if (type === 'physics') {
        this.$refs['form'].validateField('startTime')
      } else {
        this.$refs['form'].validateField('startLifycle')
      }
    },
    inputPositiveNum(val, ipt) {
      this.$set(this.form, ipt, val.replace(/(^0+)|\D/g, ''))
    },
    getConfig() {
      this.loading = true
      getGlobalConfig().then((res) => {
        this.form.expireDays = res.data.expireDays
      }).catch((err) => {
        err.msg && this.$ts(
          {
            type: 'error',
            text: this.$ts(err.msg)
          }
        )
      }).finally(() => {
        getRule().then((res) => {
          this.form.enableTask = res.some(x => {
            return x.status !== 'STATUS_DISABLED'
          })
          this.isEnable = this.form.enableTask
          const lifecycleConfig = res.find(x => x.type === 'Lifecycle')
          const hardDelete = res.find(x => x.type === 'HardDelete')

          // hardDelete.startTime = ''
          // hardDelete.endTime = ''
          // lifecycleConfig.startTime = ''
          // lifecycleConfig.endTime = ''
          // 不处理当日、次日字面概念、回显时候默认按当日处理、次日显示需看对应开始时间的大小关系
          this.$nextTick(() => {
            this.form.startTime = this.handleHourTime(hardDelete.startTime.substring(0, 2))
            this.form.endTime = this.handleHourTime(hardDelete.endTime.substring(0, 2))
            this.form.startLifycle = this.handleHourTime(lifecycleConfig.startTime.substring(0, 2))
            this.form.endLifecycle = this.handleHourTime(lifecycleConfig.endTime.substring(0, 2))
            this.handleResEndTime()
          })
        }).finally(() => {
          this.loading = false
        })
      })
    },
    handleResEndTime() {
      const {
        startTime,
        endTime,
        startLifycle,
        endLifecycle
      } = this.form
      const startPhy = Number(startTime.substring(0, 2))
      const endPhy = Number(endTime.substring(0, 2))
      const startLife = Number(startLifycle.substring(0, 2))
      const endLife = Number(endLifecycle.substring(0, 2))
      if (endPhy <= startPhy) {
        this.form.endTime = String(endPhy + 24).padStart(2, '0') + ':00'
      }
      if (endLife <= startLife) {
        this.form.endLifecycle = String(endLife + 24).padStart(2, '0') + ':00'
      }
    },
    handleHourTime(time) {
      // 处理默认值
      const timeRange = [
        '17', '18', '19', '20', '21', '22', '23', '24', '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16'
      ]
      return timeRange.includes(time) ? time + ':00' : '00:00'
    },
    onCheckSave() {
      this.$refs['form'].validate(valid => {
        valid && this.onSaveConfig()
      })
    },
    onSaveConfig() {
      this.loading = true
      setGlobalConfig({ expireDays: Number(this.form.expireDays) }).then((res) => {
        // if (res.msg === 'success') {
        //   this.$ts({
        //     type: 'success',
        //     text: this.$ts('response.success')
        //   })
        // }
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
        // 开启定时任务
        if (this.form.enableTask) {
          if (!this.isEnable) {
            setRuleOpen({
              open: true
            }).then(() => {
              this.batchUpdateRule()
            })
          } else {
            this.batchUpdateRule()
          }
        } else {
          setRuleOpen({
            open: false
          }).then((res) => {
            this.golden = false
            this.isshow = true
            this.disableds = true
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.getConfig()
          })
        }
      })
      //
    },
    handleReqTimeStr(time) {
      const num = Number(time.substring(0, 2))
      return String(num >= 24 ? num - 24 : num).padStart(2, '0') + ':00:00'
    },
    batchUpdateRule() {
      const updateHardDelete = updateRule({
        startTime: this.handleReqTimeStr(this.form.startTime),
        endTime: this.handleReqTimeStr(this.form.endTime),
        type: 'HardDelete'
      })
      const updateLifecycle = updateRule({
        startTime: this.handleReqTimeStr(this.form.startLifycle),
        endTime: this.handleReqTimeStr(this.form.endLifecycle),
        type: 'Lifecycle'
      })
      Promise.allSettled([updateHardDelete, updateLifecycle]).then((res) => {
        this.golden = false
        this.isshow = true
        this.disableds = true
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
        this.getConfig()
      })
    },
    edit() {
      this.golden = true
      this.isshow = false
      this.disableds = false
    },
    editVersionControls() {
      this.golden = false
      this.isshow = true
      this.disableds = true
      this.getConfig()
    }
  }
}
</script>
<style scoped lang="scss">
::v-deep .form {
  padding: 25px;
  margin-left: 30px;
  label.el-form-item__label {
    width: auto !important;
    margin-left: 0 !important;
  }
  .timeSelect {
    display: flex;
    .separator {
      margin: 0 5px;
    }
    .el-form-item__content {
      margin-left: 0 !important;
    }
    .el-form-item__error {
      width: 200%;
    }
  }
}

.el-input {
  width: 200px;
}

.el-select {
  width: 150px;
}
.defaultstyle {
  margin-top: 13px;
  height: 15px;
}
::v-deep .value-input {
  margin-left: 22px !important;
  margin-top: -3px !important;
}
::v-deep .el-form-item {
  margin-bottom: 5px;
}
::v-deep .el-input__inner {
  height: 28px;
}
::v-deep .value-input .el-input__inner {
  margin-right: 0px;
  margin-left: 3px;
}
::v-deep .value-input .el-input__suffix {
  right: 14px !important;
}
::v-deep .el-form-item__content {
  margin-left: 170px !important;
}
.globalstyle {
  display: flex;
  position: relative;
  justify-content: space-between;
}
.form {
  padding-top: 15px;
}
.editestyle {
  position: absolute;
  left: 40px;
  color: rgb(255, 135, 70);
  margin-top: 6px;
  margin-left: 10px;
}

:deep(.el-form-item__error) {
  top: 82% !important;
}
.expire-days :deep(.el-form-item__error) {
  left: 276px !important;
}

.paddingForm {
  margin-left: 55px;
}
.container {
  min-height: 100px;
  margin: 20px 50px 0;
  box-shadow: 0 4px 15px 0 rgb(0, 0, 0, 0.4);
}
</style>
