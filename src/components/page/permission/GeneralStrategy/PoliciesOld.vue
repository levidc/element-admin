<template>
  <div class="policyCreate">
    <div class="form">
      <el-form
        ref="form"
        v-loading="loading"
        :model="form"
        label-width="120px"
        :rules="rules"
      >
        <el-form-item
          label="策略名"
          prop="policyName"
          class="inputInner"
        >
          <el-input
            v-model="form.policyName"
            placeholder="策略名"
          />
        </el-form-item>
        <el-form-item
          label="启用"
          prop="Effect"
        >
          <el-radio-group v-model="form.Effect">
            <el-radio label="Allow">Allow</el-radio>
            <el-radio label="Deny">Deny</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="行为"
          prop="Action"
        >
          <el-select
            v-model="form.Action"
            class="actionSelect"
            filterable
            multiple
            :disabled="disableAction"
            collapse-tags
          >
            <el-option
              v-for="(item,i) in listaction"
              :key="item.value + i"
              :value="item.value"
              :label="item.key"
            />
          </el-select>
          <el-checkbox
            v-model="allAction"
            class="ml-20"
          >全选</el-checkbox>
        </el-form-item>
        <el-table
          v-show="form.Action.length && !disableAction"
          :data="form.Action"
          style="width:70%"
        >
          <el-table-column label="名称">
            <template slot-scope="scope">
              {{ scope.row }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <i
                class="fa fa-trash-o"
                title="删除"
                @click="deleteSelectAction(scope.$index)"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-table
          v-show="disableAction"
          :data="allActions"
          style="width:70%"
        >
          <el-table-column label="名称">
            <template slot-scope="scope">
              {{ scope.row }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <i
                class="fa fa-trash-o"
                title="删除"
                @click="allActions.length > 1 && allActions.splice(scope.$index,1)"
              />
            </template>
          </el-table-column>
        </el-table>
        <el-form-item
          label="资源"
          prop="Resource"
          class="inputInner mt_20"
        >
          <el-input v-model="form.Resource" />
          <p class="input_tip_font">资源配置应该遵循以下规则: arn:aws:s3:::${BucketName}/${KeyName}.使用"，"来分隔多个值.</p>
        </el-form-item>
        <el-form-item label="条件">
          <el-switch v-model="showCondition" />
        </el-form-item>
        <el-row v-if="showCondition">
          <el-form-item
            label="Condition"
            prop="Condition"
          >
            <el-select
              v-model="form.Condition.situation"
              @change="changeCondition"
            >
              <el-option
                v-for="item in conditionOption"
                :key="item.Key"
                :value="item.Value"
                :label="item.Key"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="Key"
            prop="Key"
          >
            <el-select
              v-model="form.Condition.Key"
              @change="changeKey"
            >
              <el-option
                v-for="item in KeyOption"
                :key="item.Key"
                :value="item.Value"
                :label="item.Key"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="Value"
            prop="Condition.Value"
            class="inputInner"
          >
            <el-input
              v-model="form.Condition.Value"
              @input="showValue"
            />
          </el-form-item>
          <el-button
            type="primary"
            class="mv_10"
            @click="confirmAddContion"
          >添加条件</el-button>
          <span class="ml-20"> 配置完条件，需点击“添加条件”才能将当前条件添加到声明中 </span>
          <div
            v-if="Condition&&Condition.length"
            class="tableState mv_10"
          >
            <el-table :data="Condition">
              <el-table-column
                prop="Condition"
                label="Condition"
              />
              <el-table-column
                prop="Keys"
                label="Keys"
              >
                <template slot-scope="scope">
                  <li
                    v-for="(item,i) in scope.row.Keys"
                    :key="i"
                  >
                    {{ item.key + ':' + item.value }}
                    <i
                      class="fa fa-trash-o ml-20"
                      title="删除"
                      @click="deleteKey(scope.$index, i)"
                    />
                  </li>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-row>
      </el-form>
      <el-row>
        <el-button
          type="primary"
          class="mv_10"
          @click="addStatement"
        >添加声明</el-button>
      </el-row>
      <div
        v-if="statement&&statement.length"
        class="tableState"
      >
        <p>已添加如下的声明，点击下面按钮创建策略</p>
        <el-table
          :data="statement"
          border
        >
          <el-table-column
            label="Effect"
            prop="Effect"
          />
          <el-table-column
            label="Action"
            prop="Action"
          >
            <template slot-scope="scope">
              <li
                v-for="item in scope.row.Action"
                :key="item"
              >{{ item }}</li>
            </template>
          </el-table-column>
          <el-table-column
            label="Resource"
            prop="Resource"
          />
          <el-table-column
            label="Conditions"
            prop="Condition"
          >
            <template slot-scope="scope">
              <div
                v-for="item in scope.row.Condition"
                :key="item.Condition"
              >
                <p>{{ item.Condition }}</p>
                <li
                  v-for="i in item.Keys"
                  :key="i.key + i.value"
                >
                  {{ i.key + ':' + i.value }}
                </li>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <i
                class="fa fa-trash-o"
                title="删除"
                @click="deleteStatement(scope.$index)"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-row v-if="statement&&statement.length">
        <el-button
          style="margin-top:20px;display:block"
          class="golden"
          @click="createPolicy"
        >生成策略</el-button>
      </el-row>
    </div>

    <el-dialog
      title="创建策略"
      :visible.sync="flag"
      width="40%"
    >
      <el-form
        :model="form"
        label-width="120px"
      >
        <el-form-item
          label="策略名"
          style="width:500px"
        >
          <el-input
            read-only
            :value="form.policyName"
          />
        </el-form-item>
      </el-form>
      <div style="width: 100%">
        <json-viewer
          :value="string"
          preview-mode
          boxed
          :show-array-index="false"
          :copyable="{'copyText':'复制json','copiedText':'已复制'}"
          theme="my-awesome-json-theme"
        />
      </div>
      <div slot="footer">
        <el-button @click="flag=false">{{ $ts("cancel") }}</el-button>
        <el-button type="primary" @click="submitCreate">{{ $ts("true") }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { createPolicy, ActionList } from '@/api/policy'
export default {
  data() {
    const checkARN = (rule, data, callback) => {
      const reg = /^arn:aws:s3:::(.+)(\/.+)?/
      var arr = data.split(',')
      var outPut = []
      arr.forEach(v => {
        if (!reg.test(v)) {
          outPut.push(v)
        }
      })
      if (outPut.length) {
        return callback('资源字段无效，需输入合法的ARN')
      } else {
        callback()
      }
    }
    const checkAction = (rule, data, callback) => {
      if (this.allAction) {
        return callback()
      }
      if (!data.length) {
        return callback('至少选择一个操作')
      } else {
        callback()
      }
    }
    return {
      loading: true,
      form: {
        Effect: 'Allow',
        Resource: 'arn:aws:s3:::123',
        Action: [],
        Condition: {
          situation: 'equal',
          Key: 'CurrentTime',
          Value: ''
        }
      },
      allActions: ['admin:*', 's3:*'],
      allAction: false,
      disableAction: false,
      showCondition: false,
      policyName: '',
      flag: false,
      string: '',
      Condition: [],
      statement: [],
      listaction: [],
      conditionOption: [
        {
          Key: 'equal',
          Value: 'equal'
        },
        {
          Key: 'exist',
          Value: 'exist'
        },
        {
          Key: 'ok',
          Value: 'ok'
        }
      ],
      KeyOption: [
        { Key: 'Ip', Value: 'SourceIp' },
        { Key: '当前时间', Value: 'CurrentTime' },
        { Key: '前缀', Value: 'Prefix' },
        { Key: '分隔符', Value: 'delimiter' }
      ],
      rules: {
        Resource: {
          validator: checkARN,
          trigger: ['blur', 'change']
        },
        Action: {
          validator: checkAction,
          trigger: ['blur', 'change']
        },
        'Condition.Value': {
          required: true,
          message: '输入有效值',
          trigger: ['blur', 'change']
        },
        policyName: {
          required: true,
          message: '输入有效值',
          trigger: ['blur', 'change']
        }
      }
    }
  },
  watch: {
    allAction(val) {
      if (val) {
        this.disableAction = true
        this.allActions = ['admin:*', 's3:*']
      } else {
        this.disableAction = false
      }
    }
  },
  mounted() {
    this.loading = true
    ActionList()
      .then(res => {
        this.listaction = res.data
          .sort((a, b) => {
            if (a.indexOf('admin:') > -1) {
              return -1
            } else {
              return 1
            }
          })
          .map(item => {
            return {
              key: item,
              value: item
            }
          })
          .sort((a, b) => a.key - b.key)
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        this.loading = false
      })
  },
  methods: {
    deleteSelectAction(index) {
      this.form.Action.splice(index, 1)
    },
    showValue(e) {
      this.$set(this.form.Condition, 'Value', this.form.Condition.Value)
    },
    changeCondition() {
      this.$set(this.form.Condition, 'Value', '')
      console.log('change')
    },
    changeKey() {
      this.$set(this.form.Condition, 'Value', '')
      console.log('change')
    },
    confirmAddContion() {
      this.$refs['form'].validateField('Condition.Value', valid => {
        if (!valid) {
          const length = this.Condition.length
          const temp = {}
          const Condition = this.form.Condition.situation
          if (!length) {
            temp[Condition] = true
            this.Condition.push({
              Condition,
              Keys: [
                {
                  key: this.form.Condition.Key,
                  value: this.form.Condition.Value
                }
              ]
            })
          } else {
            for (let i = 0; i < length; i++) {
              const itemC = this.Condition[i].Condition
              temp[itemC] = true
            }
            if (temp[Condition]) {
              // 同类Condition
              const index = this.Condition.findIndex(
                item => item.Condition === Condition
              )
              const arr = this.Condition[index].Keys
              // const len = arr.length
              const sameKey = arr.findIndex(
                item => item.key === this.form.Condition.Key
              )
              if (sameKey > -1) {
                // 修改原有value
                this.Condition[index].Keys[
                  sameKey
                ].value = this.form.Condition.Value
              } else {
                // 匹配上的condition再添加一条key-value
                this.Condition[index].Keys.push({
                  key: this.form.Condition.Key,
                  value: this.form.Condition.Value
                })
                console.log('添加进入新的k-v')
              }
              console.log(temp[Condition], this.Condition)
            } else {
              // 新添加一条condition
              console.log(temp, Condition)
              this.Condition.push({
                Condition,
                Keys: [
                  {
                    key: this.form.Condition.Key,
                    value: this.form.Condition.Value
                  }
                ]
              })
            }
          }
          // 添加后清除value
          // this.form.Condition.Value = ''
        }
      })
    },
    deleteKey(conditionIndex, keyIndex) {
      this.Condition[conditionIndex].Keys.splice(keyIndex, 1)
      // 判断当前condition是否已经空了,空了就清除
      if (this.Condition[conditionIndex].Keys.length === 0) {
        this.Condition.splice(conditionIndex, 1)
      }
    },
    submitCreate() {
      console.log(2)
      createPolicy({
        data: this.string,
        params: { policyName: this.form.policyName }
      }).then(res => {
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
        this.flag = false
        this.$router.push({
          name: 'GeneralPolicies'
        })
      })
    },
    deleteStatement(index) {
      this.statement.splice(index, 1)
    },
    addStatement() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.Condition = this.Condition
          if (this.allAction) this.form.Action = [...this.allActions]
          this.statement.push({ ...JSON.parse(JSON.stringify(this.form)) })
          this.clearForm()
          console.log(this.statement, 'statement')
        }
      })
    },
    clearForm() {
      // 清除action、全选状态、资源、
      this.allAction = false
      this.disableAction = false
      this.form.Action = []
      this.form.Resource = 'arn:aws:s3:::'
      this.form.Effect = 'Allow'
      this.showCondition = false
      this.form.Condition = {}
      this.Condition = []
      setTimeout(() => {
        this.$refs['form'].clearValidate()
      })
    },
    createPolicy() {
      const copy = JSON.parse(JSON.stringify(this.statement))
      for (let z = 0; z < copy.length; z++) {
        const output = {}
        for (let i = 0; i < copy[z].Condition.length; i++) {
          const k = copy[z].Condition[i].Condition
          output[k] = {}
          var arr = copy[z].Condition[i].Keys
          for (let j = 0; j < arr.length; j++) {
            const { key, value } = arr[j]
            output[k][key] = value
            if (i == copy[z].Condition.length - 1 && j == arr.length - 1) {
              copy[z].Condition = output
              break
            }
          }
        }
      }

      copy.forEach(item => {
        if (Array.isArray(item.Condition)) {
          item.Condition = {}
        }
        if (item.Resource.split(',').length > 1) {
          item.Resource = [...item.Resource.split(',')]
        }
        delete item.policyName
      })
      this.string = {
        Version: '2012-10-17',
        Statement: copy
      }
      this.$refs['form'].validateField('policyName', valid => {
        if (!valid) {
          this.flag = true
        }
      })
    }
  }
}
</script>
<style scoped lang="scss">
.policyCreate {
  // border: 1px solid #ccc;
  h1 {
    font-size: 16px;
  }

  ::v-deep .form {
    .inputInner {
      .el-input__inner {
        height: 30px !important;
      }

      .el-input {
        width: 50%;
      }
    }

    padding: 20px 250px;

    .actionSelect {
      width: 450px;
    }

    .el-row {
      .el-button {
        margin-left: 120px;
      }
    }
  }

  .tableState {
    margin: 10px;

    p {
      margin: 10px;
    }

    ul,
    li {
      margin: 0 0 10px 10px;
      list-style: disc;
    }
  }
}
</style>
