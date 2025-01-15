<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div id="versionControl-info-field" class="param-box">
            <div class="param-hd">
              <h3 id="versionControl">{{ $ts('route.BucketHighConfig') }} </h3>
              <el-button v-show="!editVersionControl && !loading" v-access="'s3:PutBucketVersioning'" class="modBtn"
                type="text" :disabled="objectLock" @click="editVersionControl = !editVersionControl">
                <span style="color: #ff8746;position: relative;top:3px">{{ $ts('page.edit') }}</span>
              </el-button>
            </div>
            <p v-if="objectLock" class="mv_10">
              <svg slot="reference" class="icon icon-question" aria-hidden="true">
                <use xlink:href="#icon-question" />
              </svg>
              {{ $ts('bucket.objectLockEnableTip') }}
            </p>
            <div v-loading="loading" class="param-bd">
              <ul class="item-descr-list">
                <li>
                  <span class="item-descr-tit">{{ $ts('bucket.currentStatus') }}</span>
                  <span v-show="!editVersionControl && !loading" style="color:#ff8746" class="item-descr-txt">{{
                    versionControl ? $ts('page.open') : $ts('page.close') }}</span>
                  <el-switch v-show="editVersionControl" v-model="versionControl" />
                </li>
                <li v-show="editVersionControl">
                  <span class="item-descr-tit" />
                  <span class="item-descr-txt">{{ $ts('bucket.enableVersionCtrlTip') }}</span>
                </li>
                <li v-show="editVersionControl">
                  <span class="item-descr-tit" />
                  <div class="versionControlBtnWrap">
                    <el-button type="default" size="mini" class="blue"
                      @click="editVersionControl = !editVersionControl; getVersionControl()">{{ $ts('page.cancel')
                      }}</el-button>
                    <el-button type="primary" class="golden" size="mini" @click="doSaveVersion();">
                      {{ $ts('page.applySet') }}
                    </el-button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
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
      this.$store.state.user._S3.getObjectLockConfiguration(params, (err, data) => {
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
      this.$store.state.user._S3.getBucketVersioning(params, (err, data) => {
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
      this.saveVersionControl()
    },
    saveVersionControl () {
      var params = {
        Bucket: this.$route.params.id,
        VersioningConfiguration: {
          Status: this.versionControl ? 'Enabled' : 'Suspended'
        }
      }
      this.$store.state.user._S3.putBucketVersioning(params, (err, response) => {
        if (err) {
          this.showS3Msg(err)
          console.error(err)
        } else {
          this.$msg({
            type: 'success',
            text: this.$ts('page.responseSuccess')
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
