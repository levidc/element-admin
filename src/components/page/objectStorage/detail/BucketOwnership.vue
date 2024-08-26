<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div
            id="basic-info-field"
            class="param-box"
          >
            <div class="param-hd">
              <h3>对象所有权 </h3>
              <a
                v-show="!editConfig&&!loading"
                href="javascript:void(0);"
                class="link-edit"
                @click="editConfig=!editConfig"
              >编辑</a>
              <p v-show="!editConfig">{{ valueMap[config] }}</p>

              <p
                v-if="config==='BucketOwnerEnforced'"
                class="tip"
              >
                ACL 已禁用。此存储桶中的所有对象均归此账户所有。仅可使用策略指定对此存储桶及其对象的访问权限。
              </p>
              <p
                v-if="config==='BucketOwnerPreferred'"
                class="tip"
              >
                ACL 已启用，并且可用于授予对此存储桶及其对象的访问权限。如果写入此存储桶的新对象指定了存储桶拥有者完全控制标准 ACL，则它们归存储桶拥有者所有。否则，它们归对象写入者所有。
              </p>
              <p
                v-if="config==='ObjectWriter'"
                class="tip"
              >
                ACL 已启用，并且可用于授予对此存储桶及其对象的访问权限。对象编写者依然为对象拥有者。
              </p>
              <div v-show="editConfig">
                <el-radio-group
                  v-model="aclDisable"
                  class="aclDisable"
                >
                  <el-radio label="off">ACL已禁用(推荐)
                    <p class="tip">此存储桶中的所有对象均归此账户所有。仅可使用策略指定对此存储桶及其对象的访问权限。</p>
                  </el-radio>
                  <el-radio label="on">ACL已启用
                    <p class="tip">此存储桶中的对象可归其他账户所有。可以使用 ACL 指定对此存储桶及其对象的访问权限。</p>
                  </el-radio>
                </el-radio-group>
                <p>对象所有权</p>
                <p v-show="aclDisable==='off'">强制存储桶拥有者</p>
                <el-radio-group
                  v-show="aclDisable==='on'"
                  v-model="objectOwnership"
                  class="enableACL"
                >
                  <el-radio label="BucketOwnerPreferred">存储桶拥有者优先
                    <p class="tip tipEnable">
                      如果写入此存储桶的新对象指定了存储桶拥有者完全控制标准 ACL，则这些对象归存储桶拥有者所有。否则，它们归对象写入者所有。
                    </p>
                  </el-radio>
                  <el-radio label="ObjectWriter">对象编写者
                    <p class="tip tipEnable">对象编写者依然为对象拥有者。</p>
                  </el-radio>
                </el-radio-group>
                <div>
                  <el-button @click="editConfig=false">取消</el-button>
                  <el-button
                    type="primary"
                    @click="saveConfig"
                  >保存</el-button>
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
export default {
  data() {
    return {
      loading: false,
      editConfig: false,
      aclDisable: 'off',
      objectOwnership: 'BucketOwnerPreferred',
      config: '',
      valueMap: {
        BucketOwnerPreferred: ' 存储桶拥有者优先',
        ObjectWriter: '对象编写者',
        BucketOwnerEnforced: '强制存储桶拥有者'
      }
    }
  },
  mounted() {
    // this.config = 'BucketOwnerPreferred'
    // this.aclDisable = this.config === 'BucketOwnerEnforced' ? 'off' : 'on'
    this.loading = false
    this.$store.state.user._S3.getBucketOwnershipControls(
      {
        Bucket: this.$route.params.id
      },
      (err, data) => {
        if (err) {
          this.loading = false
          console.log(err)
        } else {
          this.loading = false
          console.log(data, 'getBucketOwnershipControls') // successful response
        }
      }
    )
  },
  methods: {
    saveConfig() {
      this.config =
        this.aclDisable === 'off' ? 'BucketOwnerEnforced' : this.objectOwnership
      console.log(this.config, 'config')
      // error content cannot read
      this.$store.state.user._S3.putBucketOwnershipControls(
        {
          Bucket: this.$route.params.id,
          OwnershipControls: { Rules: [{ ObjectOwnership: this.config }] }
        },
        (err, data) => {
          if (err) {
            console.error(err)
          } else {
            console.log(data, 'putBucketOwnershipControls11111')
            this.editConfig = false
          }
        }
      )
    }
  }
}
</script>
<style lang="scss" scoped>
.param-hd {
  height: unset !important;
}
.enableACL {
  display: flex;
  flex-direction: column;
  margin: 20px 0;
  .el-radio {
    margin-bottom: 15px;
  }
}
.tipEnable {
  font-size: 12px;
  margin-left: 23px;
}
.aclDisable {
  margin: 15px 0 30px 0;
  p {
    font-size: 12px;
    margin: 2px 0 0 23px;
    width: 350px;
    white-space: normal;
    line-height: 15px;
  }
}
</style>
