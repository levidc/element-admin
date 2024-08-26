<template>
  <el-popover
    ref="selectColumns"
    trigger="hover"
    popper-class="selectStatus"
  >
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
    >
      <el-checkbox
        v-model="selectAll"
        class="selectAll"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
      >全选</el-checkbox>
      <el-form-item prop="columnSelecteds">
        <el-checkbox-group
          v-model="form.columnSelecteds"
          @change="handleChange"
        >
          <el-checkbox
            v-for="item in filterShow"
            :key="item.title"
            :label="item.value"
          >
            {{ item.title }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <!-- <div class="bottomMenu">
        <el-button
          type="text"
          @click="searchTaskStatus()"
        >查询</el-button>
      </div> -->
    </el-form>
    <span slot="reference">
      <span>任务状态</span>
      <svg
        class="icon"
        aria-hidden="true"
        :style="{'color':renderStatusColor,'cursor':'pointer','margin':'0 2px'}"
      >
        <use xlink:href="#icon-filter" />
      </svg>
    </span>
  </el-popover>
</template>
<script>
import { debounce } from '../utils/index'
export default {
  name: 'SelectColumns',
  props: {
    columnHeaders: {
      type: Array,
      default: () => []
    },
    needReset: {
      type: Boolean,
      default: false
    },
    fillSelStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 已选择的项
      selectAll: true,
      isIndeterminate: false,
      form: {
        columnSelecteds: []
      },
      rules: {
        columnSelecteds: {
          trigger: ['blur', 'change'],
          validator: (_, val, cb) => {
            if (val.length === 0) {
              return cb('请至少选择一项任务状态')
            } else {
              return cb()
            }
          }
        }
      }
    }
  },
  computed: {
    filterShow() {
      return this.columnHeaders.filter(item => !item.hide)
    },
    renderStatusColor() {
      const color = this.form.columnSelecteds.length ? '#ff8746' : '#8997a5'
      return color
    }
  },
  watch: {
    needReset(val) {
      if (val) {
        this.reset()
      }
    }
    // fillSelStatus

  },
  mounted() {
    // 初始化选项
    this.form.columnSelecteds = this.columnHeaders.map(item => item.value)
    this.fullCtrl = [...this.form.columnSelecteds]
    // console.log(this.fillSelStatus, '1223')
    if (this.fillSelStatus) {
      this.form.columnSelecteds = JSON.parse(sessionStorage.getItem('fillSelStatus') || '[]')
      this.isIndeterminate = this.form.columnSelecteds.length > 0 && this.form.columnSelecteds.length < this.fullCtrl.length
      this.selectAll = this.form.columnSelecteds.length === this.fullCtrl.length
      // console.log(this.selectAll, this.form.columnSelecteds, this.fullCtrl)
      this.$emit('clearFill')
    }
  },
  methods: {
    reset() {
      this.form.columnSelecteds = [...this.fullCtrl]
      this.selectAll = true
      this.isIndeterminate = false
    },
    searchTaskStatus(flag) {
      if (flag) this.form.columnSelecteds = [...this.fullCtrl]
      this.$refs['form'].validate(valid => {
        valid && this.$emit('doRequest', this.form.columnSelecteds)
      })
    },
    handleCheckAllChange(val) {
      this.isIndeterminate = false
      this.form.columnSelecteds = val ? [...this.fullCtrl] : []
      this.$emit('handleChange', this.form.columnSelecteds)
      this.changeDebounce()
    },
    handleChange(val) {
      this.isIndeterminate = val.length > 0 && val.length < this.fullCtrl.length
      this.selectAll = val.length === this.fullCtrl.length
      this.$emit('handleChange', this.form.columnSelecteds)
      this.changeDebounce()
    },
    changeDebounce: debounce.call(this, function() {
      this.searchTaskStatus()
      // todo
    }, 800)
    // getPopover () {
    //   const popover = document.querySelector('.selectColumns')
    //   popover.addEventListener('mouseleave', () => {
    //     this.$refs['selectColumns'].doClose()
    //   })
    // }
  }
}
</script>
<style lang="scss">
.selectStatus {
  width: 140px;
  min-width: unset;
  text-align: left;
  word-break: break-word;
  label {
    display: flex;
    width: 138px;
    margin-top: 5px;
    white-space: pre-wrap;
    .el-checkbox__label {
      padding-left: 15px;
    }
    &:hover {
      span.el-checkbox__label {
        color: #d3d6d8 !important;
      }
    }
  }
  .el-form-item {
    margin-bottom: 15px;
  }
  .golden {
    height: 20px;
  }
  .bottomMenu {
    position: relative;
    .el-button {
      float: right;
    }
  }
  .selectAll {
    margin-bottom: 10px;
    .el-checkbox__label {
      padding-left: 20px;
    }
  }
}
</style>
