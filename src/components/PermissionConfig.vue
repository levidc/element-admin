<template>
  <div class="permission-config" :style="`--permission-item-width: ${itemWidth};`">
    <template v-for="(gp, index) in permissions">
      <div v-if="editable || pms[index].checkVal.length > 0" :key="gp[keyCol]" class="config-item"
        :class="[labelPosition == 'left' ? 'flex' : 'flex-col-reverse', editable ? 'showTitle' : 'hideTitle', last = index === permissions.length - 1 ? 'last' : '']">
        <div :class="[labelPosition == 'left' ? 'mr-4' : '']" :style="{
          width: labelPosition == 'left' ? labelWidth : undefined,
          borderRight:
            labelPosition == 'left' ? '2px solid #ff8746' : undefined
        }">
          <el-divider v-if="labelPosition == 'top-line'" content-position="left">
            <el-checkbox v-if="editable" v-model="pms[index].checkAll" :indeterminate="pms[index].isIndeterminate"
              class="cb bold" @change="(val) => handleCheckAllChange(val, index)">{{ gp[labelCol] }}</el-checkbox>
            <span v-else class="cb bold font-12">{{ gp[labelCol] }}</span>
          </el-divider>
          <div v-else>
            <el-checkbox v-if="editable" v-model="pms[index].checkAll" :indeterminate="pms[index].isIndeterminate"
              class="cb bold" @change="(val) => handleCheckAllChange(val, index)">{{ gp[labelCol] }}</el-checkbox>
            <span v-else class="cb bold font-12">{{ gp[labelCol] }}</span>
          </div>
        </div>
        <div class="flex-grow" :style="{
          width: labelPosition == 'left' ? '10px' : undefined,
          paddingLeft: labelPosition == 'top' ? '50px' : labelPosition == 'top-line' ? '40px' : undefined
        }">
          <el-checkbox-group v-model="pms[index].checkVal" class="flex warp"
            @change="(value) => handleCheckedPermChange(value, index)">
            <template v-if="!editable && showAllToStar && isAll(index, gp)">
              <span class="cb cb-item font-12">*</span>
            </template>
            <template v-else>
              <template v-for="it in gp[childrenCol]">
                <el-checkbox v-if="editable" :key="'cb_' + it[keyCol]" :label="it[keyCol]" class="cb cb-item">{{
                  it[labelCol] }}</el-checkbox>
                <span v-else-if="pms[index].checkVal.some(v => v == it[keyCol])" :key="'sp_' + it[keyCol]"
                  class="cb cb-item font-12">{{ it[labelCol] }}</span>
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
  computed: {
    // 映射系统权限
    systemPermission () {
      return this.$store.state.user.systemPermission.reduce((pre, cur) => {
        return [...pre, ...cur.children.map(x => x.key)]
      }, [])
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
    selectAll (e) {
      const { classList } = e.target
      const pseudoElementStyle = classList && classList.length && window.getComputedStyle(document.querySelector('.' + [...classList].join('.')), '::before')
      const { content } = pseudoElementStyle
      if (content && content !== 'none' && e.offsetX > 0 && e.offsetX < 70) {
        if (content.indexOf('s3权限') > -1) {
          this.handleCheckAllChange(true, this.permissions.length - 1)
          // 全选S3
        } else if (content.indexOf('系统权限') > -1) {
          const len = this.permissions.length - 1
          for (let i = 0; i < len; i++) {
            this.handleCheckAllChange(true, i)
          }
          // 全选系统权限
        }
      }
    },
    formatValue () {
      let allValue = []
      // console.log(this.value, 'creatttt')
      if (typeof this.value === 'object') {
        const hasS3 = this.value.includes('s3:*')
        if (this.value.includes('admin:*')) {
          allValue = hasS3 ? this.systemPermission.concat(['s3:*']) : this.systemPermission.concat(this.value)
        } else {
          [
            allValue = [].concat(this.value)
          ]
        }
      } else {
        // 应该全是字符串了
        // if (this.value.includes('admin:*')) {
        //   this.value.push('user:*', 'group*')
        // }
      }
      this.pms = this.permissions.reduce((prev, gp, i) => {
        prev[i] = {
          checkAll: false,
          isIndeterminate: false,
          checkVal:
            gp[this.childrenCol]
              .filter(it => allValue.some(v => (v == it[this.keyCol] || (this.mergeGroup && v == `${gp[this.keyCol]}:*`))))
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
      // 此处需处理全选系统权限、展示问题、全选、校验是否满足所有的系统权限、否则返回所有权限
      let count = 0
      const temp = []
      // 映射权限需判断全选系统及s3、替换:*
      const rst = this.pms.reduce((prev, gp, idx) => {
        if ((this.mergeGroup && gp.checkVal.length == this.permissions[idx][this.childrenCol].length)) {
          if (this.permissions[idx][this.keyCol] !== 's3') {
            temp.push(...gp.checkVal)
            count += 1
          } else {
            prev.push('s3:*')
          }
        } else {
          prev.push(...gp.checkVal)
        }
        // 循环结束处理系统权限合并
        if (idx === this.pms.length - 1) {
          count === this.pms.length - 1 ? prev.unshift('admin:*') : prev.unshift(...temp)
        }
        // return [...prev, ...((this.mergeGroup && gp.checkVal.length == this.permissions[idx][this.childrenCol].length) ? [`${this.permissions[idx][this.keyCol]}:*`] : gp.checkVal)]
        return prev
      }, [])
      // console.log('rst', rst)
      this.$emit('input', rst)
      if (this.returnType == 'key-arr') {
        this.$emit(
          'change',
          this.permissions.reduce((prev, gp, idx) => {
            prev[gp[this.keyCol]] = (this.mergeGroup && this.pms[idx].checkVal.length == gp[this.childrenCol].length) ? ['*'] : this.pms[idx].checkVal
            return prev
          }, {})
        )
      } else this.$emit('change', rst)
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
      // console.log(idx, gp, this.pms, '123')
      // 显示全选的必要条件
      return this.pms[idx].checkVal.length == gp[this.childrenCol].length
    }
  }
}
</script>

<style scoped lang="scss">
.config-item {
  // padding-bottom: 30px;
  margin-bottom: 30px;

  &.showTitle {
    box-sizing: border-box;

    &:first-of-type {
      position: relative;
      padding-top: 20px;

      &::before {
        position: absolute;
        top: -10px;
        content: '';
        font-size: 16px;
        cursor: pointer;
      }
    }

    &:last-of-type {
      position: relative;
      margin-top: 50px;
      padding-top: 20px;

      &::before {
        position: absolute;
        top: -10px;
        content: '';
        font-size: 16px;
        cursor: pointer;
      }
    }
  }
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
