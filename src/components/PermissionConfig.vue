<template>
  <div
    class="permission-config"
    :style="`--permission-item-width: ${itemWidth};`"
  >
    <template v-for="(gp, index) in permissions">
      <div
        v-if="editable || pms[index].checkVal.length>0"
        :key="gp[keyCol]"
        class="config-item"
        :class="[labelPosition == 'left' ? 'flex' : 'flex-col-reverse']"
      >
        <div
          :class="[labelPosition == 'left' ? 'mr-4' : '']"
          :style="{
            width: labelPosition == 'left' ? labelWidth : undefined,
            borderRight:
              labelPosition == 'left' ? '2px solid #ff8746' : undefined
          }"
        >
          <el-divider
            v-if="labelPosition == 'top-line'"
            content-position="left"
          >
            <el-checkbox
              v-if="editable"
              v-model="pms[index].checkAll"
              :indeterminate="pms[index].isIndeterminate"
              class="cb bold"
              @change="(val) => handleCheckAllChange(val, index)"
            >{{ gp[labelCol] }}</el-checkbox>
            <span
              v-else
              class="cb bold font-12"
            >{{ gp[labelCol] }}</span>
          </el-divider>
          <div v-else>
            <el-checkbox
              v-if="editable"
              v-model="pms[index].checkAll"
              :indeterminate="pms[index].isIndeterminate"
              class="cb bold"
              @change="(val) => handleCheckAllChange(val, index)"
            >{{ gp[labelCol] }}</el-checkbox>
            <span
              v-else
              class="cb bold font-12"
            >{{ gp[labelCol] }}</span>
          </div>
        </div>
        <div
          class="flex-grow"
          :style="{
            width: labelPosition == 'left' ? '10px' : undefined,
            paddingLeft: labelPosition == 'top' ? '50px' : labelPosition == 'top-line' ? '40px' : undefined
          }"
        >
          <el-checkbox-group
            v-model="pms[index].checkVal"
            class="flex warp"
            @change="(value) => handleCheckedPermChange(value, index)"
          >
            <template v-if="!editable && showAllToStar && isAll(index, gp)">
              <span class="cb cb-item font-12">*</span>
            </template>
            <template v-else>
              <template v-for="it in gp[childrenCol]">
                <el-checkbox
                  v-if="editable"
                  :key="'cb_'+it[keyCol]"
                  :label="it[keyCol]"
                  class="cb cb-item"
                >{{ it[labelCol] }}</el-checkbox>
                <span
                  v-else-if="pms[index].checkVal.some(v => v==it[keyCol])"
                  :key="'sp_'+it[keyCol]"
                  class="cb cb-item font-12"
                >{{ it[labelCol] }}</span>
              </template>
            </template>
          </el-checkbox-group>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'PermissionConfig',
  props: {
    // 权限定义
    permissions: {
      type: Array,
      default: () => []
    },
    // 权限值数组
    value: {
      type: Array,
      default: () => []
    },
    editable: {
      type: Boolean,
      default: false
    },
    mergeGroup: {
      type: Boolean,
      default: false
    },
    // 权限码字段
    keyCol: {
      type: String,
      default: 'key'
    },
    // 权限名字段
    labelCol: {
      type: String,
      default: 'label'
    },
    // 子权限数组字段
    childrenCol: {
      type: String,
      default: 'children'
    },
    // 返回数据结构类型
    returnType: {
      type: String,
      default: 'str'
    },
    // 标签位置
    labelPosition: {
      type: String,
      default: 'left'
    },
    // 标签宽度
    labelWidth: {
      type: String,
      default: '200px'
    },
    // 子项宽度
    itemWidth: {
      type: String,
      default: '240px'
    },
    showAllToStar: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      pms: []
    }
  },
  watch: {
    value () {
      this.formatValue()
    }
  },
  created () {
    this.formatValue()
  },
  mounted () {
    this.formatValue()
  },
  methods: {
    formatValue () {
      this.pms = this.permissions.reduce((prev, gp, i) => {
        prev[i] = {
          checkAll: false,
          isIndeterminate: false,
          checkVal:
            gp[this.childrenCol]
              .filter(it => this.value.some(v => (v == it[this.keyCol] || (this.mergeGroup && v == `${gp[this.keyCol]}:*`))))
              .map(p => p[this.keyCol]) || []
        }
        prev[i].checkAll =
          prev[i].checkVal.length >= gp[this.childrenCol].length
        prev[i].isIndeterminate =
          prev[i].checkVal.length < gp[this.childrenCol].length &&
          prev[i].checkVal.length > 0
        return prev
      }, [])
    },
    emitChange () {
      const rst = this.pms.reduce((prev, gp, idx) => [...prev, ...((this.mergeGroup && gp.checkVal.length == this.permissions[idx][this.childrenCol].length) ? [`${this.permissions[idx][this.keyCol]}:*`] : gp.checkVal)], [])
      this.$emit('input', [...rst])
      if (this.returnType == 'key-arr') {
        this.$emit(
          'change',
          this.permissions.reduce((prev, gp, idx) => {
            prev[gp[this.keyCol]] = (this.mergeGroup && this.pms[idx].checkVal.length == gp[this.childrenCol].length) ? ['*'] : this.pms[idx].checkVal
            return prev
          }, {})
        )
      } else this.$emit('change', [...rst])
    },
    handleCheckedPermChange (value, index) {
      if (!this.editable) return
      const checkedCount = value.length
      this.pms[index].checkVal = value
      this.pms[index].checkAll =
        checkedCount ===
        (this.permissions[index][this.childrenCol] || []).length
      this.pms[index].isIndeterminate =
        checkedCount > 0 &&
        checkedCount < (this.permissions[index][this.childrenCol] || []).length
      this.emitChange()
    },
    handleCheckAllChange (val, index) {
      if (!this.editable) return
      this.pms[index].checkVal = val
        ? (this.permissions[index][this.childrenCol] || []).map(
          p => p[this.keyCol]
        )
        : []
      this.pms[index].isIndeterminate = false
      this.emitChange()
    },
    isAll (idx, gp) {
      return this.pms[idx].checkVal.length == gp[this.childrenCol].length
    }
  }
}
</script>

<style scoped>
.config-item {
  padding-bottom: 30px;
}
.flex {
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
}
.warp {
  /* justify-content: center; */
  /* margin-left: 200px; */
  flex-wrap: wrap;
}
.flex-col-reverse {
  -webkit-box-orient: vertical;
  -webkit-box-direction: reverse;
  -ms-flex-direction: column-reverse;
  -webkit-flex-direction: column-reverse;
  flex-direction: column-reverse;
}
.mr-4 {
  margin-right: 16px;
}
.flex-grow {
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
  -webkit-flex-grow: 1;
  flex-grow: 1;
}
.flex-row {
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  -webkit-flex-direction: row;
  flex-direction: row;
}
.cb {
  white-space: normal;
  display: inline-flex;
  align-items: center;
  margin: 4px 10px 4px 0;
}
.cb-item {
  width: var(--permission-item-width);
}
.bold {
  font-weight: bold;
}
.font-12 {
  font-size: 12px;
}
</style>
