<template>
  <el-popover
    ref="selectColumns"
    trigger="hover"
    popper-class="selectColumns"
  >
    <el-checkbox-group v-model="columnSelecteds">
      <el-checkbox
        v-for="item in filterShow"
        :key="item.title"
        :label="item.title"
      />
    </el-checkbox-group>
    <el-tooltip
      slot="reference"
      content="列筛选"
      placement="top"
      effect="dark"
    >
      <el-button
        type="primary"
        class="right ml_10"
      >
        <i class="el-icon-caret-bottom" />
      </el-button>
    </el-tooltip>
  </el-popover>
</template>
<script>
export default {
  name: 'SelectColumns',
  props: {
    columnHeaders: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      // 已选择的项
      columnSelecteds: []
    }
  },
  computed: {
    filterShow () {
      return this.columnHeaders.filter(item => !item.disabled)
    }
  },
  watch: {
    columnSelecteds (val) {
      // 计算未被选中的列标题数组
      // // 根据计算结果进行表格重绘
      const hideTable = this.columnHeaders.map(item => {
        if (val.indexOf(item.title) > -1) {
          item.show = true
        } else {
          item.show = false
        }
        return item
      })
      // console.log(hideTable, 'hideCLoumns')
      this.$emit('hideColumn', hideTable)
    }
  },
  mounted () {
    // 初始化选项
    this.columnSelecteds = this.columnHeaders.map(item => item.title)
  },
  methods: {
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
.selectColumns {
  width: 140px;
  min-width: unset;
  margin-left: -12px;
  text-align: left;
  word-break: break-word;
  label {
    display: flex;
    width: 140px;
    white-space: pre-wrap;

    &:hover {
      span.el-checkbox__label {
        color: #d3d6d8 !important;
      }
    }
  }

  .golden {
    height: 20px;
  }
}
</style>
