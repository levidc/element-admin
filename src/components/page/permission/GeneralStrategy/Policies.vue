<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mv_10">
        <el-button v-access="'admin:CreatePolicy'" size="small" type="primary" class="golden" @click="createPolicy">{{ $ts("CREATE") }}</el-button>
        <!-- <el-button v-access="'admin:CreatePolicy'" size="small" class="golden" @click="$router.push({name:'PoliciesCreate'})">JSON生成器</el-button> -->
        <!-- <el-button size="small" class="golden" :disabled="disableUpdate" @click="updatePolicy">{{ $ts("UPDATE") }}</el-button> -->
        <el-tooltip content="刷新" placement="top" effect="dark">
          <i class="el-icon-refresh right" @click="searchVal='';refresh()" />
        </el-tooltip>
        <el-input
          v-model="searchVal"
          class="search_style right"
          :placeholder="$ts('policies.search.name')"
          width="14"
          clearable
        />
      </el-row>
      <PoliciesTable
        ref="policyTable"
        :search-val="searchVal"
        @handleSelect="handleSelect"
      />
    </div>
    <el-dialog
      title="创建策略"
      width="750px"
      :visible.sync="createDialog"
      class="createForm"
    >
      <el-form
        ref="form"
        :model="form"
        label-width="120px"
      >
        <el-form-item
          label="策略名称"
          prop="policyName"
          :rules="rulePolicyName"
        >
          <el-input
            v-model="form.policyName"
            placeholder="输入策略名称"
          />
        </el-form-item>
        <el-form-item label="编辑策略" />
        <div style="width: 100%;margin-top: 30px;">
          <vue-json-editor
            ref="jsonEditor"
            v-model="jsonString"
            :show-btns="false"
            :mode="'code'"
            :expanded-on-start="true"
            @json-change="onJsonChange"
            @json-save="onJsonSave"
            @has-error="onError"
          />
          <div class="bottomMenu">
            <i
              class="el-icon-s-operation"
              title="格式化json"
              @click="eslintJson"
            />
            <i
              class="el-icon-document-copy"
              title="复制到剪贴板"
              @click="copyCode"
            />
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearJSon">{{ $ts("alert.clear") }}</el-button>
        <el-button type="primary" class="golden" @click="submitCreate">{{ $ts('save') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { createPolicy } from '@/api/policy'
import PoliciesTable from './PoliciesTable.vue'
export default {
  name: 'GeneralStrategy',
  components: {
    PoliciesTable
  },
  data() {
    const checkNameReg = (rule, data, callback) => {
      const reg = /^[0-9a-zA-Z]{8,40}$/
      if (!reg.test(data)) {
        return callback('策略名只能输入英文及数字，长度限制为8-40位')
      }
      return callback()
    }
    return {
      createDialog: false,
      searchVal: '',
      form: {
        policyName: ''
      },
      jsonString: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [], // 具体操作api
            Resource: [], // 访问存储桶中的资源
            Condition: {}
            // Principal: '' // 授权多个S3账户
          }
        ]
      },
      hasJsonFlag: true,
      selection: 0,
      rulePolicyName: {
        validator: checkNameReg,
        trigger: ['blur', 'change']
      }
    }
  },
  computed: {
    disableUpdate() {
      return this.selection.length !== 1
    }
  },
  watch: {
    createDialog(val) {
      if (!val) {
        this.$refs['form'].resetFields()
        this.clearJSon()
      }
    }
  },
  mounted() { },
  methods: {
    // pushCreate () {
    //   const push = this.$router.resolve({
    //     name: 'PoliciesCreate'
    //   })
    //   window.open(push.href, '_blank')
    // },
    updatePolicy() {
      this.$router.push({ name: 'PoliciesUpdate' })
    },
    handleSelect(val) {
      this.selection = val
    },
    refresh() {
      this.$refs['policyTable'].listPolicies()
    },
    submitCreate() {
      if (this.hasJsonFlag == false) {
        return this.$ts({
          type: 'error',
          text: 'json格式不正确'
        })
      } else if (!Object.keys(this.jsonString).length) {
        return this.$ts({
          type: 'error',
          text: 'json未配置'
        })
      } else {
        this.$refs['form'].validate(valid => {
          if (valid) {
            // 传递json保留空白字符 格式
            createPolicy({
              data: this.jsonString,
              params: { policyName: this.form.policyName }
            }).then(res => {
              this.createDialog = false
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.refresh()
            })
            // console.log(this.jsonString)
            // console.log(this.$refs['jsonEditor'].editor.getText())
            // console.log(this.form, 'success', this.jsonString)
          }
        })
      }
    },
    createPolicy() {
      this.$router.push({
        name: 'PolicyDetail',
        params: { name: 'create' }
      })
    },
    eslintJson() {
      document.getElementsByClassName('jsoneditor-format').click()
      // $('.jsoneditor-format').click()
    },
    copyCode() {
      var str = this.$refs['jsonEditor'].editor.getText()
      navigator.clipboard.writeText(str)
      this.$ts({
        type: 'success',
        text: '复制成功'
      })
    },
    onJsonChange(value) {
      this.onJsonSave(value)
    },
    onJsonSave(value) {
      this.jsonString = value
      this.hasJsonFlag = true
    },
    onError(value) {
      this.hasJsonFlag = false
    },
    clearJSon() {
      this.jsonString = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [],
            Resource: [],
            Condition: {}
            // Principal: ''
          }
        ]
      }
      this.hasJsonFlag = true
    }
    // 检查json
  }
}
</script>
<style lang="scss" scoped>
::v-deep .createForm {
  .el-dialog__body {
    box-sizing: border-box;
    padding: 20px 50px 0 20px;
  }

  .bottomMenu {
    display: flex;
    justify-content: flex-end;
    margin-top: -30px;
    cursor: pointer;
    margin-right: 5px;

    i {
      border: 1px solid #ccc;
      padding: 5px;
      z-index: 99;
      font-size: 16px;
      margin-left: 10px;
    }
  }
}
</style>
