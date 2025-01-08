<template>
  <div class="data-table">
    <el-table
      :ref="innerRef"
      v-loading="loading"
      :data="pagination ? tableData : tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
      style="width: 100%"
      :row-key="getRowKey"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
      @sort-change="sortFunction"
      @row-click="rowClick"
    >
      <el-table-column
        v-if="selection"
        type="selection"
        width="55"
        :reserve-selection="keepSelection"
        :selectable="selectInit"
      />
      <template v-for="(col, index) in columns ">
        <!-- 操作列/自定义列 -->
        <slot v-if="col.slot && !col.hide" :name="col.slot" />
        <!-- 普通列 -->
        <el-table-column
          v-if="!col.slot && !col.hide"
          :key="index"
          :prop="col.prop"
          :label="col.title || col.label"
          :width="col.width"
          :sortable="col.sortable"
          :min-width="col.minWidth"
          :formatter="col.formatter"
          :show-overflow-tooltip="col.showOverflowTooltip ? false : true"
          :fixed="col.fixed"
          v-bind="{ ...col }"
        />
      </template>
    </el-table>
    <!-- 是否调用分页 -->
    <el-pagination
      v-if="pageObj"
      background
      layout="total,sizes, prev, pager, next, jumper"
      :page-sizes="[5, 10, 50, 100]"
      :page-size="pageSize"
      :total="pagination ? total : tableData.length"
      :current-page="currentPage"
      @size-change="handleSizeChange"
      @prev-click="back"
      @next-click="next"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script>
export default {
  name: 'DataTable',
  props: {
    keepSelection: {
      type: Boolean,
      default: true
    },
    total: {
      type: Number,
      default: 0
    },
    selection: {
      type: Boolean,
      default: false
    },
    innerRef: {
      type: String,
      default: 'dataTable'
    },
    tableData: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: true
    },
    pageObj: {
      type: Object,
      default: () => {
        return {
          pageSize: 10,
          currentPage: 1
        }
      }
    },
    handleSelectionChange: {
      type: Function,
      default: () => { }
    },
    sortFunction: {
      type: Function,
      default: () => { }
    },
    getRowKey: {
      type: Function,
      default: (row) => { String(row.id) }
    },
    selectInit: {
      type: Function,
      default: () => true
    },
    pagination: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      currentPage: 1,
      pageSize: 10
    }
  },
  // computed: {
  //   JSONPageObj () {
  //     return JSON.parse(JSON.stringify(this.pageObj))
  //   }
  // },
  // watch: {
  //   JSONPageObj: {
  //     handler (val) {
  //       this.currentPage = val.currentPage
  //     },
  //   },
  // },
  watch: {
    loading(val, pre) {
      if (!val && pre) {
        this.$refs[this.innerRef] && this.$refs[this.innerRef].clearSelection()
      }
    }
  },
  created() {
    if (this.pageObj && Object.keys(this.pageObj).length) {
      this.pageSize = this.pageObj.pageSize
      this.currentPage = this.pageObj.currentPage
    } else {
      this.pageSize = 10
      this.currentPage = 1
    }
    // console.log(this.tableData, 'tableData', this.pagination)
  },
  methods: {
    showColumn(col) {
      if (!col.show) {
        return false
      } else if (!col.slot) {
        return true
      } else {
        return true
      }
    },
    handleSizeChange(val) {
      // 切换显示数、重置页数1
      this.currentPage = 1
      this.pageSize = val
      this.$emit('clearSelection')
      this.$emit('renderPagination', { pageSize: this.pageSize, pageNumber: this.currentPage, ref: this.innerRef })
    },
    // 当前页改变时触发 跳转其他页
    handleCurrentChange(val) {
      this.currentPage = val
      this.$emit('clearSelection')
      this.$emit('renderPagination', { pageSize: this.pageSize, pageNumber: this.currentPage, ref: this.innerRef })
    },
    next(val) {
      console.log(val, '22222')
    },
    back(val) {
      console.log(val, '11111')
    },
    rowClick(val) {
      this.$emit('rowClick', val)
    }
  }
}
</script>
<style lang="scss" scoped>
.el-table {
  &+.el-pagination {
    ::v-deep .el-icon-circle-close {
      display: none;
    }
  }

  ::v-deep table {
    .el-button--text {
      color: #fff;
    }

    tr {
      th {
        padding: 8px 0;
        background: #2c3b43;
        border: none;
      }

      td {
        background: #2c3b43;
        /* color: #D3D6D8; */
        color: #8997a5;
        border: none;

        .is-disabled {
          display: none;
        }
      }
    }

    tbody {
      tr {
        &:hover {
          td {
            // background: #262424 !important;
          }
        }
      }

      border-bottom-color: rgb(128, 128, 128);
    }

    .el-table__expanded-cell {
      &:hover {
        // background: #262424 !important;
      }
    }

    .el-table {

      th,
      tr,
      td {
        border: none;
      }

      th {
        color: #6d7f86;
      }

      border: none;
    }
  }

  ::v-deep .el-table__expand-icon {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
    margin-right: 5px;
    color: #ff8746;
  }

  ::v-deep .el-table__expand-icon .el-icon-arrow-right:before {
    content: "\e6d9";
    padding: 1px;
  }

  ::v-deep .el-table__expand-icon--expanded .el-icon-arrow-right:before {
    content: "\e6d8";
  }
}
</style>
