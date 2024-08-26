<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div class="param-box">
            <div class="param-hd">
              <h3>生命周期定时任务配置</h3>
              <el-button
                v-show="editControl&&!loading"
                type="text"
                class="link-edit"
                @click="editControl=!editControl"
              >
                <span style="color:#ff8746;position: relative;top:3px;">
                  编辑
                </span>
              </el-button>
              <div v-loading="loading">
                <div v-show="editControl">
                  <p class="mv_10">当前配置:
                    <span>{{ form.cronType==='Default'?'默认配置':'自定义配置' }}</span>
                  </p>
                  <div v-if="form.cronType==='UserCustomize'">
                    <p class="mv_10">首次执行时间:
                      <span>{{ formatDate(form.firstStartTime) }}</span>
                    </p>
                    <p class="mv_10">时间间隔:
                      <span>{{ form.intervalHour }}(小时)</span>
                    </p>
                  </div>
                </div>
                <div v-show="!editControl">
                  <el-form
                    ref="form"
                    :model="form"
                    label-width="120px"
                    :rules="rules"
                  >
                    <el-form-item label="默认配置">

                      <el-radio
                        v-model="form.cronType"
                        label="Default"
                        @change="onChangeRadio"
                      >默认配置&nbsp;&nbsp;&nbsp;<span v-if="isshow">(每天0点执行)</span></el-radio>
                      <el-radio
                        v-model="form.cronType"
                        label="UserCustomize"
                        @change="onChangeRadio"
                      >启用自定义</el-radio>

                    </el-form-item>
                    <div v-if="form.cronType==='UserCustomize'">
                      <el-form-item
                        prop="firstStartTime"
                        label="首次执行时间"
                      >
                        <el-date-picker
                          v-model="form.firstStartTime"
                          type="datetime"
                          format="yyyy-MM-dd HH:mm"
                          placeholder="选择日期时间"
                          :picker-options="disableCurrentDate"
                        />
                      </el-form-item>
                      <el-form-item
                        label="时间间隔"
                        prop="intervalHour"
                      >
                        <el-time-select
                          v-model="form.intervalHour"
                          class="hourContent"
                          :picker-options="{
                            start: '01:00',
                            step: '1:00',
                            end: '24:00'
                          }"
                          placeholder="选择时间"
                        />
                      </el-form-item>
                    </div>
                    <el-row>
                      <el-button class="blue" @click="editControl=!editControl">{{ $ts('button.cancel') }}</el-button>
                      <el-button class="golden" @click="putLifecycleTaskCron">{{ $ts('button.confirm') }}</el-button>
                    </el-row>
                  </el-form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getLifecycleTaskCron, putLifecycleTaskCron } from '@/api/storage'
export default {
  data() {
    const validateCurrentTime = (rule, data, callback) => {
      const currentTime = new Date().getTime()
      const selectTime = new Date(data).getTime()
      if (selectTime < currentTime) {
        return callback('首次执行时间选择不能过去时间')
      } else {
        callback()
      }
    }
    return {
      isshow: false,
      loading: false,
      editControl: true,
      form: {
        cronType: 'Default',
        // dayStartHour: '',
        firstStartTime: '', // 首次执行时间
        intervalHour: '' // 时间间隔
      },
      disableCurrentDate: {
        disabledDate(time) {
          // console.log(time, time.getTime())
          return time.getTime() < Date.now() - 86400000
        }
      },
      rules: {
        firstStartTime: [
          {
            validator: validateCurrentTime,
            trigger: ['blur', 'change']
          },
          {
            required: true,
            trigger: ['blur', 'change'],
            message: '请配置首次执行时间'
          }
        ],
        intervalHour: {
          required: true,
          trigger: ['blur', 'change'],
          message: '请选择时间间隔'
        }
      }
    }
  },
  watch: {
    editControl(val) {
      if (val) {
        this.getLifecycleTaskCron()
      } else {
        this.isshow = true
        this.form.intervalHour =
          this.form.intervalHour > 10
            ? this.form.intervalHour + ':00'
            : '0' + this.form.intervalHour + ':00' || ''
      }
    }
  },
  mounted() {
    this.getLifecycleTaskCron()
  },
  methods: {
    onChangeRadio(val) {
      if (val == 'Default') {
        this.isshow = true
      } else {
        this.isshow = false
      }
    },
    getLifecycleTaskCron() {
      this.loading = true
      getLifecycleTaskCron({
        Bucket: this.$route.params.id
      })
        .then(res => {
          // console.log(res, 'res')
          res = res.data
          this.form.cronType = res.cronType
          this.form.firstStartTime = res.firstStartTime || ''
          this.form.intervalHour = res.intervalHour || 1
        })
        .catch(err => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    // firstStartTime 单位毫秒 ，intervalHour单位小时，dayStartHour单位小时
    putLifecycleTaskCron() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          let data = {}
          if (this.form.cronType == 'Default') {
            data.cronType = this.form.cronType
          } else {
            const intervalHour = +this.form.intervalHour.split(':')[0]
            data = {
              cronType: this.form.cronType,
              firstStartTime: new Date(this.form.firstStartTime).getTime(),
              intervalHour
            }
          }
          putLifecycleTaskCron({
            data,
            params: {
              Bucket: this.$route.params.id
            }
          })
            .then(res => {
              if (res.code === '200') {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
              }
            })
            .catch(error => {
              console.error(error)
            })
            .finally(() => {
              this.editControl = !this.editControl
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.hourContent::before {
  content: "(小时)";
  position: absolute;
  left: 70px;
  top: 1px;
  color: #ff8746;
  font-size: 12px;
}

.param-hd {
  height: unset !important;
}

p {
  font-size: 14px;

  span {
    font-size: 13px;
    margin-left: 10px;
  }
}
</style>
