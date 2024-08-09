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
              <h3 id="versionControl">版本控制 </h3>
              <el-button
                v-show="!editVersionControl&&!loading"
                v-access="'s3:PutBucketVersioning'"
                class="modBtn"
                type="text"
                :disabled="objectLock"
                @click="editVersionControl=!editVersionControl"
              >
                <span style="color: #ff8746;position: relative;top:3px">编辑</span>
              </el-button>
            </div>
            <p
              v-if="objectLock"
              class="mv_10"
            >
              <i
                slot="reference"
                class="mv_10 fa fa-question-circle"
                style="font-size:16px"
              />
              无法暂停存储桶版本控制，因为此存储桶已启用对象锁定。
            </p>
            <div
              v-loading="loading"
              class="param-bd"
            >
              <ul class="item-descr-list">
                <li>
                  <span class="item-descr-tit">当前状态</span>
                  <span
                    v-show="!editVersionControl&&!loading"
                    style="color:#ff8746"
                    class="item-descr-txt"
                  >{{ versionControl?"开启":"关闭" }}</span>
                  <el-switch
                    v-show="editVersionControl"
                    v-model="versionControl"
                  />
                </li>
                <li v-show="editVersionControl">
                  <span class="item-descr-tit" />
                  <span class="item-descr-txt">开启版本控制后，所有历史版本的同名文件将会被视为独立的对象处理，独占存储空间并产生存储容量费用。</span>
                </li>
                <li v-show="editVersionControl">
                  <span class="item-descr-tit" />
                  <div class="versionControlBtnWrap">
                    <el-button
                      type="default"
                      size="mini"
                      class="blue"
                      @click="editVersionControl=!editVersionControl;getVersionControl()"
                    >取消</el-button>
                    <el-button
                      type="primary"
                      class="golden"
                      size="mini"
                      @click="doSaveVersion();"
                    >应用更改</el-button>

                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <el-dialog
          v-dialogDrag
          title="确定开启版本控制？"
          :visible.sync="isShowSaveTip"
          width="30%"
        >
          <p class="dialogDrag_word">开启对象的版本控制后，将无法关闭该功能，如不需要仅可暂停。</p>
          <div slot="footer" class="dialog-footer">
            <el-button class="golden" type="primary" @click="isShowSaveTip = false;saveVersionControl()">{{ $ts('button.confirm') }}</el-button>
            <el-button @click="isShowSaveTip = false;">{{ $ts('button.cancel') }}</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BucketList',
  components: {},
  filters: {},
  data () {
    return {
      loading: false,
      versionControl: false,
      noVersionControl: true,
      editVersionControl: false,
      isShowSaveTip: false,
      tableData: [],
      objectLock: false
    }
  },
  computed: {},
  mounted: function () {
    this.getVersionControl()
  },
  destroyed () { },
  methods: {
    getVersionControl () {
      this.loading = true
      var params = {
        Bucket: this.$route.params.id
      }
      this.$store.state._S3.getObjectLockConfiguration(params, (err, data) => {
        if (err) {
          this.loading = false
          this.showS3Msg(err)
          console.error(err)
        } else {
          if (
            data.ObjectLockConfiguration &&
            data.ObjectLockConfiguration.ObjectLockEnabled === 'Enabled'
          ) {
            this.objectLock = true
          }
        }
      })
      this.$store.state._S3.getBucketVersioning(params, (err, data) => {
        if (err) {
          console.log(err)
          this.showS3Msg(err)
          this.loading = false
        } else {
          console.log(data)
          this.noVersionControl = data.Status == ''
          this.versionControl = data.Status == 'Enabled'
          this.loading = false
        }
      })
    },
    doSaveVersion () {
      if (this.noVersionControl) {
        this.isShowSaveTip = true
      } else {
        this.saveVersionControl()
      }
    },
    saveVersionControl () {
      var params = {
        Bucket: this.$route.params.id,
        VersioningConfiguration: {
          Status: this.versionControl ? 'Enabled' : 'Suspended'
        }
      }
      this.$store.state._S3.putBucketVersioning(params, (err, response) => {
        if (err) {
          this.showS3Msg(err)
          console.error(err)
        } else {
          this.$ts({
            type: 'success',
            text: this.$ts('response.success')
          })
          console.log(response)
          this.noVersionControl = false
          this.editVersionControl = !this.editVersionControl
          this.getVersionControl()
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
.versionControlBtnWrap {
  margin: 20px 0;
}

.modBtn {
  &.is-disabled {
    span {
      color: #ad6c48 !important;
    }
  }
}
</style>
