<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mv_10">
        <!-- <el-button class="golden" @click="handleCreate">创建</el-button> -->
        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            class="el-icon-refresh right"
            @click="searchVal='';init()"
          />
        </el-tooltip>
        <el-input
          v-model="searchVal"
          class="search_style right"
          placeholder="权限组名过滤"
          width="14"
          clearable
        />
      </el-row>
      <!-- <TableData
          :loading="loading"
          row-key="id"
          :table-data="tableData"
          :columns="columns"
          :page-obj="page"
          :sort-function="val => sortFunction(val,tableData)"
          @go-page="onGoPage"
        >
          <el-table-column slot="permissions" label="权限集合" prop="permissions" :min-width="300">
            <template slot-scope="scope">
              <div class="permission">
                <div v-for="item in scope.row.permissions.split(',')" :key="item">
                  <el-tag size="mini" effect="plain">
                    {{ item }}
                  </el-tag>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column slot="action" label="操作" width="80px">
            <template slot-scope="scope">
              <el-button class="blue" @click="handleFillForm(scope.row)">修改</el-button>
            </template>
          </el-table-column>
        </TableData> -->
      <el-table
        v-loading="loading"
        :data="tableData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
        tooltip-effect="dark"
        @sort-change="sortFunction"
      >
        <el-table-column
          label="权限组名"
          sortable="custom"
          prop="name"
          min-width="120px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="权限集合"
          prop="permissions"
          :min-width="300"
        >
          <template slot-scope="scope">
            <div class="permission">
              <div
                v-for="item in scope.row.permissions.split(',')"
                :key="item"
              >
                <el-tag
                  size="mini"
                  effect="plain"
                >
                  {{ item }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="100px"
        >
          <template slot-scope="scope">
            <el-button
              class="blue"
              @click="handleFillForm(scope.row)"
            >修改</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page_block">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="[5, 10, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    <el-dialog
      :visible.sync="modal"
      :title="isAdd?'创建权限组合':'修改权限组合'"
      width="1000px"
      destroy-on-close
    >
      <el-form
        :model="form"
        label-width="120px"
      >
        <el-row>
          <el-col :span="14">
            <el-form-item
              label="权限组合名:"
              prop="name"
            >
              <span v-if="!isAdd">
                {{ form.name }}
              </span>
              <el-input
                v-else
                v-model="form.name"
                clearable
                placeholder="占位符"
              />
              <span
                v-if="!form.allow"
                style="color: #ff8746;"
              >（拒绝访问选中的权限）</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="权限名过滤:"
              prop="name"
            >
              <el-input
                v-model="form.searchVal"
                clearable
                placeholder="权限名"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row class="formModal">
          <el-checkbox
            v-model="form.checkAll"
            :indeterminate="form.isIndeterminate"
            @change="handleCheckAllChange"
          >全选</el-checkbox>
          <div style="margin: 15px 0;" />
          <el-checkbox-group
            v-model="form.permissions"
            @change="handleCheckedPermission"
          >
            <el-checkbox
              v-for="item in permissions"
              :key="item"
              :label="item"
            >{{ item }}</el-checkbox>
          </el-checkbox-group>
        </el-row>
      </el-form>
      <!-- <permissionConfig
        v-model="form.permissions"
        class="formModal"
        label-position="flex"
        :permissions="permissions"
        :merge-group="true"
        :editable="true"
        :label-width="'90px'"
        :item-width="'300px'"
      /> -->
      <div slot="footer" class="dialog-footer">
        <el-button class="blue" @click="modal = false">{{ $ts('button.cancel') }}</el-button>
        <el-button class="golden" type="primary" @click="handleConfirmBtn">{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="confirmModl"
      title="确认修改"
      width="800px"
      destroy-on-close
    >
      <div class="confirmTip">
        <i class="fa el-icon-warning-outline red" />
        <span>当前修改的权限组合会应用到历史创建的策略上，<b>"确定"</b>保存修改，<b>"取消"</b>返回修改</span>
      </div>
      <div class="permissionPreview">
        <div class="pre">
          <p>
            原权限
          </p>
          <p
            v-for="item in form.copyPermission"
            :key="item"
          >
            <el-tag>
              {{ item }}
            </el-tag>
          </p>
        </div>
        <div class="cur">
          <p>
            当前权限
          </p>
          <el-tag v-if="form.checkAll && form.permissions.length === searchPermissions.length">{{ 's3:*' }}</el-tag>
          <template v-else>
            <p
              v-for="item in form.permissions"
              :key="item"
            >
              <el-tag>
                {{ item }}
              </el-tag>
            </p>
          </template>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="confirmModl = false">{{ $ts('button.cancel') }}</el-button>
        <el-button class="golden" type="primary" @click="submitCreate">{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
// import permissionConfig from '@/components/PermissionConfig.vue'
import { listAllPermissionGroup, updatePermissionGroup, ActionList } from '@/api/policy'
export default {
  name: 'S3permission',
  data() {
    return {
      confirmModl: false,
      searchVal: '',
      type: 'mod',
      loading: false,
      modal: false,
      form: {
        permissions: [],
        copyPermission: [],
        name: '',
        id: '',
        allow: false,
        searchVal: '',
        isIndeterminate: false,
        checkAll: false
      },
      tableData: [],
      copyData: [],
      prop: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      order: '',
      columns: [
        { prop: 'name', title: '权限组名', show: true, sortable: 'custom', width: '240', showOverflowTooltip: true },
        { slot: 'permissions', show: true },
        { slot: 'action', show: true }
      ],
      permissions: [],
      searchPermissions: []
    }
  },
  computed: {
    isAdd() {
      return this.type === 'add'
    }
  },
  watch: {
    searchVal(val) {
      this.tableData = JSON.parse(JSON.stringify(this.copyData))
      if (!val) return
      this.tableData = this.tableData.filter(item => {
        return item.name.toLowerCase().indexOf(val.toLowerCase()) > -1
      })
    },
    'form.searchVal'(val) {
      this.permissions = JSON.parse(JSON.stringify(this.searchPermissions))
      if (!val) {
        // 取消搜索后并且处于选中状态、处理搜索后的checkbox状态
        this.form.checkAll = this.form.permissions.length === this.permissions.length
        this.form.isIndeterminate = this.form.permissions.length > 0 && this.form.permissions.length < this.permissions.length
        return
      }
      this.permissions = this.permissions.filter(item => {
        return item.toLowerCase().indexOf(val.toLowerCase()) > -1
      })
      // 全选、选中和当前有交集即全选
      this.form.checkAll = this.includeArray(this.form.permissions, this.permissions)
      this.form.isIndeterminate = this.filterSame(this.form.permissions, this.permissions).length > 0 && !this.includeArray(this.form.permissions, this.permissions)
    },
    modal(val) {
      if (!val) {
        this.form.name = ''
        this.form.permissions = []
        this.form.isIndeterminate = false
        this.form.searchVal = ''
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    handleCreate() {
      this.type = 'add'
      this.showPermission().then(() => {
        this.modal = true
      })
    },
    init() {
      this.loading = true
      listAllPermissionGroup().then(res => {
        this.tableData = res.data || []
        this.total = this.tableData.length
        this.copyData = JSON.parse(JSON.stringify(this.tableData))
      }).finally(() => {
        this.loading = false
      })
    },
    // 禁删除、修改名称、支持修改组合内的权限、添加
    handleFillForm(row) {
      this.type = 'mod'
      const { id, name, allow, permissions = '' } = row
      Object.assign(this.form, { id, name, allow, permissions: permissions.split(',') })
      this.form.copyPermission = JSON.parse(JSON.stringify(this.form.permissions))
      this.showPermission().then(() => {
        if (permissions === 's3:*') {
          this.form.isIndeterminate = false
          this.form.checkAll = true
          this.form.permissions = this.permissions
        } else {
          this.form.isIndeterminate = true
        }
        this.modal = true
      })
    },
    handleConfirmBtn() {
      if (this.isAdd) {
        // create
      } else {
        this.confirmModl = true
      }
    },
    submitCreate() {
      const { id, name, allow, permissions } = this.form
      const data = {
        id,
        name,
        allow,
        permissions: permissions.join(',')
      }
      if (this.form.checkAll && permissions.length === this.searchPermissions.length) {
        data.permissions = 's3:*'
      }
      updatePermissionGroup(data).then(res => {
        this.$ts({
          type: 'success',
          text: this.$ts('response.success')
        })
        this.modal = false
        this.confirmModl = false
      }).finally(() => {
        this.init()
      })
    },
    sortFunction(val) {
      this.prop = val.prop
      this.order = val.order
      this.tableData.sort(this.sortMethod(val.prop, val.order))
    },
    handleCheckAllChange(val) {
      // 搜索启用后、全选 添加搜索后记录、反选、清除当前已有
      if (!this.form.searchVal) {
        this.form.permissions = val ? this.permissions : []
      } else {
        // 有检索记录 合并
        this.form.permissions = val ? this.filterMerge(this.form.permissions.concat(this.permissions)) : this.filterPermission(this.form.permissions, this.permissions)
      }
      this.form.isIndeterminate = false
    },
    handleCheckedPermission(value) {
      const checkedCount = value.length
      this.form.checkAll = checkedCount === this.permissions.length
      if (this.form.searchVal) {
        // 搜索全选 过滤后选中数据包含当前数据
        this.form.checkAll = this.includeArray(this.form.permissions, this.permissions)
        // isIndeterminate false 选中状态
        // checked isIndeterminate
        // true	true	半选
        // true	false	全选
        // false	true	半选
        // false	false	空
        // isIndeterminate 半选状态、false 空/半选
        // 处理半选状态、false checked 全选、
        // 当前有过滤后选中数据：
        this.form.isIndeterminate = this.filterSame(this.form.permissions, this.permissions).length > 0 && checkedCount > 0 && this.filterSame(this.form.permissions, this.permissions).length < this.permissions.length
      } else {
        this.form.isIndeterminate = checkedCount > 0 && checkedCount < this.permissions.length
      }
    },
    showPermission() {
      return ActionList().then((res) => {
        this.permissions = res.data
          .filter(item => item.toLowerCase().indexOf('s3') > -1)
          .sort((a, b) => {
            return a.localeCompare(b)
          })
        this.searchPermissions = JSON.parse(JSON.stringify(this.permissions))
        return Promise.resolve()
      })
    },
    filterPermission(all, target) {
      if (!Array.isArray(all) || !Array.isArray(target)) return
      return all.filter(item => {
        return target.every(i => {
          return item !== i
        })
      })
    },
    filterSame(all, target) {
      if (!Array.isArray(all) || !Array.isArray(target)) return
      return all.filter(item => {
        return target.some(i => {
          return item == i
        })
      })
    },
    filterMerge(arr) {
      return [...new Set(arr)]
    },
    includeArray(all, target) {
      if (!Array.isArray(all) || !Array.isArray(target)) return
      if (target && !target.length) return false
      return target.every(item => {
        return all.includes(item)
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}

</script>
<style lang="scss" scoped>
::v-deep .formModal {
  max-height: 600px;
  overflow-y: scroll;
  .el-checkbox-group {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    .el-checkbox {
      width: 30%;
      padding: 6px 0;
    }
  }
}
.overflowText {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.permission {
  display: flex;
  flex-wrap: wrap;
  div {
    width: 200px;
    padding: 2px 2px 2px 0;
    margin-right: 4px;
  }
}
.el-tag {
  color: #e39606;
  background-color: transparent;
  border-color: transparent;
  max-width: 100%;
  height: fit-content;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-all;
  padding: 0;
}
.confirmTip {
  margin: -10px 0 10px 0;
  font-size: 16px;
  b {
    color: #ff8746;
  }
}
.permissionPreview {
  padding-right: 250px;
  max-height: 500px;
  overflow-y: scroll;
  .pre,
  .cur {
    margin-top: 10px;
    & > p {
      margin-bottom: 10px;
      color: #ff8746;
    }
  }
  width: 100%;
  display: flex;
  justify-content: space-between;
  .el-tag {
    margin: 5px 0;
  }
}
.el-tag--plain {
  color: #ff8746;
}
</style>
