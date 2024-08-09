<template>
  <div class="strategy" :style="{ height: height || undefined }">
    <div v-if="!hideLabel" class="flex label bold topMenu">
      <span>授权语句</span>
      <div style="flex-grow: 1;" />
      <el-button v-show="editable" type="primary" class="golden mini" icon="el-icon-plus" @click="onAddNewStatement">添加配置</el-button>
      <el-button v-show="statementOpen.length<strategy.Statement.length" type="info" class="blue mini" icon="el-icon-arrow-down" @click="openAll">全部展开</el-button>
      <el-button v-show="statementOpen.length>=strategy.Statement.length" type="info" class="blue mini" icon="el-icon-arrow-up" @click="closeAll">全部折叠</el-button>
    </div>
    <div style="height: 100px; flex-grow: 1;" :style="{ overflowY: height?'auto':undefined }">
      <el-empty v-if="strategy.Statement&&strategy.Statement.length<=0" />
      <el-collapse v-else v-model="statementOpen">
        <el-collapse-item v-for="(st, index) in strategy.Statement" :key="index" :name="index">
          <template slot="title">
            <span class="mr">{{ '配置'+(index+1) }}</span>
            <span class="secordany">{{ currentName }}</span>
            <span style="flex-grow: 1;" />
          </template>
          <div style="padding: 20px 30px 0;">
            <div v-if="editable" class="statement-del-btn">
              <i class="fa fa-close" @click="() => onDelStatement(index)" />

            </div>
            <AwzStatement
              :value="st"
              :editable="editable"
              :action-config="actionConfig"
              :label-width="statementLabelWidth"
              :hide-principal="statementHidePrincipal"
              :action-merge-group="statementActionMergeGroup"
              :action-label-position="statementActionLabelPosition"
              :action-key-col="statementActionKeyCol"
              :action-label-col="statementActionLabelCol"
              :action-label-width="statementActionLabelWidth"
              :action-item-width="statementActionItemWidth"
              :action-height="statementActionHeight"
              :condition-symbols="statementConditionSymbols"
              :condition-keys="statementConditionKeys"
              :condition-height="statementConditionHeight"
              :show-all-permissiion-to-star="showAllPermissiionToStar"
              @change="(data) => handleStatementChange(data, index)"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import AwzStatement from './AwzStatement.vue'

export default {
  name: 'Strategy',
  components: { AwzStatement },
  props: {
    value: {
      type: Object,
      default: () => { }
    },
    editable: {
      type: Boolean,
      default: false
    },
    actionConfig: {
      type: Array,
      default: () => []
    },
    height: {
      type: String,
      default: ''
    },
    hideLabel: {
      type: Boolean,
      default: false
    },
    statementLabelWidth: {
      type: String,
      default: '100px'
    },
    statementHidePrincipal: {
      type: Boolean,
      default: false
    },
    statementActionMergeGroup: {
      type: Boolean,
      default: false
    },
    statementActionLabelPosition: {
      type: String,
      default: 'left'
    },
    statementActionKeyCol: {
      type: String,
      default: 'key'
    },
    statementActionLabelCol: {
      type: String,
      default: 'label'
    },
    statementActionLabelWidth: {
      type: String,
      default: '200px'
    },
    statementActionItemWidth: {
      type: String,
      default: '240px'
    },
    statementActionHeight: {
      type: String,
      default: '300px'
    },
    statementConditionSymbols: {
      type: Array,
      default: () => [
        { value: 'StringEquals', label: '(字符串) =' },
        { value: 'IpAddress', label: '(IP地址) 是' },
        { value: 'NotIpAddress', label: '(IP地址) 否' }
      ]
    },
    statementConditionKeys: {
      type: Array,
      default: () => [
        { value: 's3:prefix', label: '前缀' },
        { value: 's3:delimiter', label: '分隔符' },
        { value: 'aws:SourceIp', label: 'IP地址' }
      ]
    },
    statementConditionHeight: {
      type: String,
      default: '300px'
    },
    showAllPermissiionToStar: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      strategy: {
        name: '',
        Statement: []
      },
      statementOpen: []
    }
  },
  computed: {
    currentName () {
      if (this.$route.params.name == undefined || this.$route.params.name == 'create') return
      return this.$route.params.name
    }
  },

  watch: {
    value () {
      this.refreshStrategy()
    }
  },
  mounted () {
    this.refreshStrategy()
  },
  methods: {
    refreshStrategy () {
      this.strategy = {
        ...this.value,
        name: this.value.name || '',
        Statement: this.value.Statement || []
      }
    },
    getEmptyStatement () {
      return {
        Sid: '',
        Effect: 'Allow',
        Principal: [],
        Resource: [],
        Action: [],
        Condition: {}
      }
    },
    onAddNewStatement () {
      const index = this.strategy.Statement.length
      this.$set(this.strategy.Statement, index, this.getEmptyStatement())
      this.statementOpen = [index]
      this.emitChange()
    },
    onDelStatement (index) {
      // console.log(index, 'index')
      this.$confirm(`您确定要删除 <b style="color:#ff8746">配置${index + 1}</b> 吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      })
        .then(() => {
          this.strategy.Statement.splice(index, 1)
          this.emitChange()
        })
        .catch(() => { })
        // customClass 怎么修改确认和取消的按钮颜色
    },
    openAll () {
      this.statementOpen = this.strategy.Statement.map((st, idx) => idx) || []
    },
    closeAll () {
      this.statementOpen = []
    },
    handleStatementChange (statement, index) {
      this.$set(this.strategy.Statement, index, statement)
      this.emitChange()
    },
    emitEdit () {
      this.$emit('edit', {})
    },
    emitChange () {
      this.$emit('input', this.deepClone(this.strategy))
      this.$emit('change', this.deepClone(this.strategy))
    },
    emitSave () {
      this.$emit('save', this.deepClone(this.strategy))
    },
    emitDel () {
      this.$confirm(`您确定要删除此IAM策略吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$emit('delete', { name: this.strategy.name })
        })
        .catch(() => { })
    },
    deepClone (obj) {
      return JSON.parse(JSON.stringify(obj))
    }
  }
}
</script>

<style scoped lang="scss">
.strategy {
  display: flex;
  flex-direction: column;
  border: 1px solid #36464e;
  .strategy-header {
    display: flex;
    align-items: center;
    padding: 18px 10px 18px 5px;

    .mr {
      margin-right: 10px;
    }

    .header-icon {
      font-size: 28px;
    }
  }

  .label {
    display: flex;
    align-items: center;
    font-size: 16px;
    padding: 10px;
    border-top: 1px solid #36464e;
    border-bottom: 1px solid #36464e;
  }

  ::v-deep {
    .el-collapse-item__header {
      padding-left: 30px;
      background-color: #2b3d44;
    }
  }

  .statement-del-btn {
    height: 0;
    position: relative;

    .fa-close {
      cursor: pointer;
      position: absolute;
      right: -26px;
      font-size: 18px;
      padding: 5px;
      color: #f56c6c;
    }
  }
}

.bold {
  font-weight: bold;
}

.secordany {
  color: #b2b4b9;
}
.topMenu{
  box-shadow: 0 2px 10px 0 inset rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  /* max-width: 1360px; */
}

.mr {
  margin-right: 10px;
}
</style>
