
<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div
            id="versionControl-info-field"
            class="param-box"
          >
            <div class="param-hd">
              <h3 id="versionControl">QoS配置 </h3>
              <el-button
                v-if="edit&&!loading"
                class="modBtn"
                type="text"
                @click="edit=false"
              >
                <span style="color: #ff8746;position: relative;top:3px">编辑</span>
              </el-button>
            </div>
            <div
              v-loading="loading"
              class="param-bd"
              style="padding-left: 17px;"
            >
              <el-form
                ref="ruleForm"
                :rules="rules"
                :model="form"
                style="display: flex;flex-direction: column; align-items: flex-start;margin-left: -53px;margin-top: 23px;"
              >
                <el-form-item
                  label="QoS管理开关"
                  prop="openQos"
                  class="styleWidth"
                >
                  <el-radio-group
                    v-model="form.openQos"
                    :disabled="edit"
                  >
                    <el-radio :label="true">开
                    </el-radio>
                    <el-radio :label="false">关
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <template>
                  <el-form-item
                    label="上传带宽"
                    prop="uploadThroughput"
                    class="styleWidth"
                  >
                    <QuickDefault
                      v-model="form.uploadThroughput"
                      :default-value="-1"
                      label-of-default="无限制"
                      label-of-value="限制"
                      class="defaultstyle"
                      :disabled="edit"
                    >
                      <template #default="{ data,onChange:onNetworkThroughPutChange }">
                        <el-input
                          v-model="data.value"
                          placeholder="请输入1-1000的整数"
                          :disabled="edit"
                          @input="value => {data.value = value.replace(/(^0+)|\D/g, '').replace(/^[1-9]\d{3,}$|^1000\d+$/, '1000');onNetworkThroughPutChange();}"
                        >
                          <template slot="append">Mbps</template>
                        </el-input>
                      </template>
                    </QuickDefault>
                  </el-form-item>
                  <el-form-item
                    label="下载带宽"
                    prop="downloadThroughput"
                    class="styleWidth"
                  >
                    <QuickDefault
                      v-model="form.downloadThroughput"
                      :default-value="-1"
                      label-of-default="无限制"
                      label-of-value="限制"
                      class="defaultstyle"
                      :disabled="edit"
                    >
                      <template #default="{ data, onChange: onInputTpsChange }">
                        <el-input
                          v-model="data.value"
                          placeholder="请输入1-1000的整数"
                          :disabled="edit"
                          @input="value => {data.value = value.replace(/(^0+)|\D/g, '').replace(/^[1-9]\d{3,}$|^1000\d+$/, '1000');onInputTpsChange();}"
                        >
                          <template slot="append">Mbps</template>
                        </el-input>
                      </template>
                    </QuickDefault>
                  </el-form-item>
                  <el-form-item
                    label="上传TPS"
                    prop="uploadTps"
                    class="styleWidth"
                  >
                    <QuickDefault
                      v-model="form.uploadTps"
                      :default-value="-1"
                      label-of-default="无限制"
                      label-of-value="限制"
                      class="defaultstyle"
                      :disabled="edit"
                    >
                      <template #default="{ data, onChange: onUploadTpsChange }">
                        <el-input
                          v-model="data.value"
                          style="top:-5px"
                          placeholder="请输入1-1000的整数"
                          :disabled="edit"
                          @input="value => {data.value = value.replace(/(^0+)|\D/g, '').replace(/^[1-9]\d{3,}$|^1000\d+$/, '1000');onUploadTpsChange();}"
                        />
                      </template>
                    </QuickDefault>
                  </el-form-item>
                  <el-form-item
                    label="下载TPS"
                    class="styleWidth"
                    prop="downloadTps"
                  >
                    <QuickDefault
                      v-model="form.downloadTps"
                      :default-value="-1"
                      label-of-default="无限制"
                      label-of-value="限制"
                      class="defaultstyle"
                      :disabled="edit"
                    >
                      <template #default="{ data, onChange: onDownloadTpsChange }">
                        <el-input
                          v-model="data.value"
                          style="top:-5px"
                          placeholder="请输入1-1000的整数"
                          :disabled="edit"
                          @input="value => {data.value = value.replace(/(^0+)|\D/g, '').replace(/^[1-9]\d{3,}$|^1000\d+$/, '1000');onDownloadTpsChange();}"
                        />
                      </template>
                    </QuickDefault>
                  </el-form-item>
                </template>
              </el-form>
            </div>
            <div
              v-show="!edit"
              class="versionControlBtnWrap"
            >
              <el-button
                type="default"
                class="blue"
                size="mini"
                @click="init()"
              >取消</el-button>
              <el-button
                type="primary"
                class="golden"
                size="mini"
                @click="doSave();"
              >应用更改</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { updateBucketQos, getBucketQos } from '@/api/QoS'
import QuickDefault from '@/components/QuickDefault'
export default {
  name: 'BucketList',
  components: {
    QuickDefault
  },
  filters: {},
  data () {
    const checkBandWidth = (rule, data, callback) => {
      // const numberReg = /^\d+$|^\d+[.]?\d+$/
      if (data == '') {
        return callback(new Error('请输入有效数值'))
      } else if (data > 1000) {
        return callback(new Error('最大数值不超过1000'))
      } else {
        callback()
      }
    }
    return {
      form: {
        uploadThroughput: -1,
        downloadThroughput: -1,
        uploadTps: -1,
        downloadTps: -1,
        openQos: false
      },
      loading: false,
      edit: true,
      rules:
      {
        uploadThroughput: { trigger: ['change', 'blur'], required: true, validator: checkBandWidth },
        downloadThroughput: { trigger: ['change', 'blur'], required: true, validator: checkBandWidth },
        uploadTps: { trigger: ['change', 'blur'], required: true, validator: checkBandWidth },
        downloadTps: { trigger: ['change', 'blur'], required: true, validator: checkBandWidth }
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.loading = true
      this.edit = true
      getBucketQos({ bucketName: this.$route.params.id }).then((res) => {
        const result = res.data[0]
        const {
          uploadThroughput = -1,
          downloadThroughput = -1,
          uploadTps = -1,
          downloadTps = -1,
          openQos = false
        } = result
        Object.assign(
          this.form, {
            uploadThroughput,
            downloadThroughput,
            uploadTps,
            downloadTps,
            openQos
          }
        )
      })
        .finally(() => {
          this.loading = false
        })
    },
    doSave () {
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          const {
            uploadThroughput,
            downloadThroughput,
            uploadTps,
            downloadTps,
            openQos
          } = this.form
          updateBucketQos({
            bucketName: this.$route.params.id,
            uploadThroughput,
            downloadThroughput,
            uploadTps,
            downloadTps,
            openQos
          })
            .then(() => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
            }).finally(() => {
              this.init()
            })
        }
      })
    }

  }
}
</script>
<style scoped lang="scss">
.versionControlBtnWrap {
  margin-top: 50px;
}
::v-deep .el-input__inner {
  height: 30px !important;
}

.item-descr-tits {
  padding-right: 38px !important;
  padding-bottom: 16px !important;
}

.modBtn {
  &.is-disabled {
    span {
      color: #ad6c48 !important;
    }
  }
}

::v-deep .styleWidth {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-left: 24px;
  padding-right: 15px;
  margin-left: 15px;
  box-sizing: border-box;
}

::v-deep .el-form-item__label {
  line-height: 2 !important;
  width: 167px !important;
  margin-left: -53px !important;
}

::v-deep .el-form-item {
  margin-bottom: 15px !important;
}

.defaultstyle {
  margin-top: 6px;
  height: 15px;
}
:deep(.value-input) {
  position: relative;
  top: 2px !important;
}
::v-deep .el-form-item__error {
  width: 300px !important;
  left: 159px !important;
}
</style>
