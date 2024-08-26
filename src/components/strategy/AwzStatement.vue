<template>
  <div>
    <el-descriptions size="mini" :column="3" border :style="{ '--statement-label-width': labelWidth }">
      <!-- <el-descriptions-item label="Sid" :span="2" label-class-name="desc-label" content-style="width:60%;">
        <el-input v-if="editable" v-model="statement.Sid" size="small" class="input" placeholder="仅支持：大写字母 (AZ)、小写字母 (az) 和数字 (0-9)" @change="emitChange" />
        <div v-else class="input">{{ statement.Sid }}</div>
      </el-descriptions-item> -->
      <!-- 桶授权用户 -->
      <el-descriptions-item v-if="!hidePrincipal" label="授权用户" :span="3" label-class-name="desc-label">
        <div
          v-if="(statement.Principal || []).length > 0"
          class="resource-containor"
          style="margin-bottom: 15px;"
          :style="{ flexDirection: editable ? 'column' : undefined }"
        >
          <el-tag
            v-for="(pri, idx) in statement.Principal"
            :key="idx"
            :type="editable ? '' : 'info'"
            :closable="editable"
            effect="plain"
            :class="[editable ? 'resource-item-edit' : 'resource-item']"
            @close="() => handleDelPrincipalItem(idx)"
          >{{ pri }}</el-tag>
        </div>
        <div v-if="editable" style="display: flex;">
          <div class="resource--inputs">
            <!-- <div class="resource-label label-left">
              <i class="el-icon-money" />
            </div> -->
            <div class="resource-item">
              <span>用户名：</span>
              <el-autocomplete
                v-model="principal.val"
                size="mini"
                class="resource-input"
                placeholder="[必填] 用户名称"
                clearable
                style="width: 200px;"
                :fetch-suggestions="searchUserNames"
              />
            </div>
            <div class="resource-label label-right">
              <el-tooltip :content="btnNotice" placement="right" :open-delay="800" :hide-after="4000">
                <el-button plain class="golden" @click="handleAddPrincipalItem">添加</el-button>
                <!-- <el-button icon="el-icon-circle-plus" plain type="primary" @click="handleAddPrincipalItem" /> -->
              </el-tooltip>
            </div>
          </div>
        </div>
      </el-descriptions-item>
      <!-- 资源 -->

      <el-descriptions-item :span="3" label-class-name="desc-label">
        <template slot="label">
          <span>资源</span>
          <el-popover placement="top-start" title="通配符" width="500" trigger="hover">
            <i slot="reference" class="fa fa-question-circle" style="margin-left:5px;font-size:14px;" />
            <ul class="ul">
              <li class="li">您可在任何 ARN 分段 (⽤冒号分隔的部分) 中使⽤通配符 (* 和 ?)。星号 (*) 表示 0个或多个字符的任意组合，问号 (?) 表示任何单个字符。您可在每个分段中使⽤多个 *
                或 ?字符，但通配符不能跨分段。</li>
              <li class="li">以下 ARN 在此 ARN 的相对 ID 部分使⽤通配符 * 来标识 examplebucket 存储桶中的所有对象：arn:aws:s3:::examplebucket/*</li>
              <li class="li">以下 ARN 使⽤ * 来表示所有 Amazon S3 资源（所有 S3 存储桶和对象）：arn:aws:s3:::*</li>
              <li class="li">以下 ARN 在 * 部分中同时使⽤通配符 ?和 relative-ID。它标识存储桶 (例如example1bucket、example2bucket、example3bucket
                等) 中的所有对：arn:aws:s3:::example?bucket/*</li>
            </ul>
          </el-popover>
        </template>
        <div v-if="routeBucketName">
          <el-radio-group v-model="isResourceAll" style="margin: 2px 0;" @input="handleChangeResourceType">
            <el-radio :label="true">整个Bucket</el-radio>
            <el-radio :label="false">指定资源</el-radio>
          </el-radio-group>
          <div v-if="isResourceAll" style="margin: 18px 0 2px;">
            {{ shotResource(statement.Resource[0]) }}
          </div>
          <div v-else style="max-width: 433px; margin: 18px 0 0;">
            <AwzBucketResourceItem
              v-for="(res, idx) in statement.Resource || []"
              :key="idx"
              :idx="idx"
              :value="res"
              class="resource-bucket-item"
              :err="checkResourceSame(idx) ? '重复' : void 0"
              @change="handleChangeBucketResourceItem"
              @del="handleDelResourceItem"
            />
            <AwzBucketResourceItem
              :value="resource.prepend + '::' + routeBucketName"
              addable
              class="resource-bucket-item"
              @add="handleAddBucketResourceItem"
            />
            <p v-if="isshow">格式错误，仅支持英文、数字和-_.?*</p>
          </div>
        </div>
        <div v-else>
          <div
            v-if="(statement.Resource || []).length > 0"
            class="resource-containor"
            style="margin-bottom: 15px;"
            :style="{ flexDirection: editable ? 'column' : undefined }"
          >
            <el-tag
              v-for="(res, idx) in statement.Resource"
              :key="idx"
              :type="editable ? '' : 'info'"
              :closable="editable"
              effect="plain"
              :class="[editable ? 'resource-item-edit' : 'resource-item']"
              @close="() => handleDelResourceItem(idx)"
            >{{ res }}</el-tag>
          </div>
          <div v-if="editable" style="display: flex;">
            <div class="resource--inputs">
              <!-- <div class="resource-label label-left">{{ resource.prepend }}</div> -->
              <!-- <el-input v-model="resource.region" size="small" class="resource-input" placeholder="区域" clearable />
            <div class="resource-label">:</div> -->
              <!-- <div class="resource-item">
              <span class="lb2">桶拥有者：</span>
              <el-radio-group v-model="isUserNameAll">
                <el-radio :label="true" class="w1">全部用户（*）</el-radio>
                <el-radio :label="false" class="w2">指定用户</el-radio>
              </el-radio-group>
              <el-autocomplete v-if="!isUserNameAll" v-model="resource.userName" size="mini" class="resource-input" placeholder="用户名" clearable :fetch-suggestions="searchUserNames" @focus="focus.userName=true" @blur="focus.userName=false" />
            </div> -->
              <!-- <div class="resource-label">:</div> -->
              <div v-if="!routeBucketName" class="resource-item">
                <span class="lb2">桶名称：</span>
                <el-radio-group v-model="isBucketNameAll">
                  <el-radio :label="true" class="w1">全部桶（*）</el-radio>
                  <el-radio :label="false" class="w2">指定桶</el-radio>
                </el-radio-group>
                <el-autocomplete
                  v-if="!isBucketNameAll"
                  v-model="resource.bucketName"
                  size="mini"
                  popper-class="resource-input"
                  placeholder="[必填] 桶名称"
                  clearable
                  :fetch-suggestions="searchBucketNames"
                  @focus="focus.bucketName = true"
                  @blur="focus.bucketName = false"
                />
              </div>
              <!-- <div class="resource-label">/</div> -->
              <div class="resource-item">
                <span class="lb2">对象名称：</span>
                <el-radio-group v-model="isKeyNameAll">
                  <el-radio :label="true" class="w1">全部对象（*）</el-radio>
                  <el-radio :label="false" class="w2">指定对象</el-radio>
                </el-radio-group>
                <el-input
                  v-if="!isKeyNameAll"
                  v-model="resource.keyName"
                  size="mini"
                  class="resource-input"
                  placeholder="对象名称"
                  clearable
                  @focus="focus.keyName = true"
                  @blur="focus.keyName = false"
                />
              </div>
              <div class="resource-label label-right">
                <el-tooltip :content="btnNotice" placement="right" :open-delay="800" :hide-after="4000">
                  <el-button plain class="golden" @click="handleAddResourceItem">添加</el-button>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </el-descriptions-item>

      <!-- 权限 -->
      <el-descriptions-item label="权限" :span="3" label-class-name="desc-label">
        <el-radio-group
          v-if="editable && routeBucketName"
          v-model="isActionGroup"
          style="margin: 4px 0 20px;"
          @input="changeActionState"
        >
          <el-radio :label="1">简单设置</el-radio>
          <el-radio :label="0">高级设置</el-radio>
        </el-radio-group>
        <div v-if="isActionGroup">
          <el-radio-group
            v-if="editable"
            v-model="permissionGroupId"
            size="mini"
            class="permi-gps"
            @input="changePermissionGroup"
          >
            <el-radio v-for="pg in permissionGroupList" :key="pg.id" :label="pg.id" border>
              {{ pg.name }}
              <el-popover placement="top" title="该设置将授予以下Permission" width="300" trigger="hover" :open-delay="500">
                <i slot="reference" class="fa fa-question-circle" style="margin-left:5px;font-size:14px;" />
                <div>
                  <div v-for="pgp in pg.permissions.split(',')" :key="pgp">{{ pgp }}</div>
                </div>
              </el-popover>
            </el-radio>
          </el-radio-group>
          <div v-else>
            <el-tag type="info" effect="plain">
              {{ permissionGroup.name }}
              <el-popover placement="top" title="该设置将授予以下Permission" width="300" trigger="hover" :open-delay="500">
                <i slot="reference" class="fa fa-question-circle" style="margin-left:5px;font-size:14px;" />
                <div>
                  <div v-for="pgp in permissionGroup.permissions.split(',')" :key="pgp">{{ pgp }}</div>
                </div>
              </el-popover>
            </el-tag>
          </div>
        </div>

        <!-- 系统权限api -->
        <el-card
          v-else
          :shadow="editable ? 'hover' : 'never'"
          :class="[!editable ? 'simple-card' : '']"
          style="overflow-y: auto;"
          :style="{ maxHeight: actionHeight || undefined }"
        >
          <PermissionConfig
            v-if="statement.Action && actionConfig"
            v-model="statement.Action"
            :editable="editable"
            :permissions="actionConfig"
            :merge-group="actionMergeGroup"
            :label-position="actionLabelPosition"
            :key-col="actionKeyCol"
            :label-col="actionLabelCol"
            :label-width="actionLabelWidth"
            :item-width="actionItemWidth"
            show-all-to-star
            @change="emitChange"
          />
        </el-card>
      </el-descriptions-item>

      <!-- 效力 -->
      <el-descriptions-item v-if="!isActionGroup" label="效⼒" :span="3" label-class-name="desc-label">
        <el-switch
          v-model="statement.Effect"
          size="small"
          :disabled="!editable"
          active-text="启用"
          inactive-text="禁用"
          active-value="Allow"
          inactive-value="Deny"
          @change="emitChange"
        />
      </el-descriptions-item>

      <!-- principle 系统权限 -->
      <el-descriptions-item :span="3" label-class-name="desc-label">
        <template slot="label">
          <span>条件</span>
          <el-popover placement="top-start" title="注意" width="500" trigger="hover">
            <i slot="reference" class="fa fa-question-circle" style="margin-left:5px;font-size:14px;" />
            <ul class="ul">
              <li class="li">相同项目和符号只能有一个配置，重复添加时会覆盖旧的配置</li>
            </ul>
          </el-popover>
        </template>
        <el-card
          v-if="conditionArr.length > 0"
          :class="[!editable ? 'simple-card' : '']"
          :shadow="editable ? 'hover' : 'never'"
          style="overflow-y: auto; margin-bottom: 15px;"
          :style="{ maxHeight: conditionHeight || undefined }"
        >
          <el-tree :data="conditionArr" node-key="key" default-expand-all>
            <span slot-scope="{ data }" class="condition-node">
              <span class="node bold">{{ data.label }}</span>
              <span class="node secordany">({{ data.key }})</span>
              <span v-if="data.val" class="node">&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;{{ data.val }}</span>
              <el-button
                v-if="data.val && editable"
                icon="el-icon-circle-close"
                size="mini"
                type="text"
                class="condition-btn"
                @click="() => handleDelConditiionItem(data.pkey, data.key)"
              />
            </span>
          </el-tree>
        </el-card>
        <div v-if="editable" style="display: flex; flex-direction: column; align-items: start;">
          <div class="resource-inputs">
            <!-- <div class="resource-label label-left">
              <i class="el-icon-s-operation" />
            </div> -->
            <el-select
              v-model="condition.key"
              size="mini"
              class="resource-input"
              placeholder="[必填] 项目"
              style="width: 130px;"
              @change="filterSymbol"
            >
              <el-option v-for="k in conditionKeys" :key="k.value" :label="k.label" :value="k.value">
                <div class="condition-opt">
                  <span class="label">{{ k.label }}</span>
                  <span class="val" style="">{{ k.value }}</span>
                </div>
              </el-option>
            </el-select>
            <!-- <div class="resource-label">&nbsp;</div> -->
            <el-select
              v-model="condition.symbol"
              size="mini"
              class="resource-input"
              placeholder="[必填] 符号"
              style="width: 130px;"
            >
              <el-option v-for="sb in copyConditionSymbols" :key="sb.value" :label="sb.label" :value="sb.value">
                <div class="condition-opt">
                  <span class="label">{{ sb.label }}</span>
                  <span class="val" style="">{{ sb.value }}</span>
                </div>
              </el-option>
            </el-select>
            <!-- <div class="resource-label">&nbsp;</div> -->
            <el-input
              v-model="condition.val"
              size="mini"
              class="resource-input"
              placeholder="[必填] 值"
              clearable
              style="width: 170px;"
            />
          </div>
          <div class="resource-label label-right" style="margin-top: 5px;">
            <el-tooltip :content="btnNotice" placement="right" :open-delay="800" :hide-after="4000">
              <el-button plain class="golden" @click="handleAddConditionItem">添加</el-button>
            </el-tooltip>
          </div>
        </div>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import PermissionConfig from '../PermissionConfig.vue'
import AwzBucketResourceItem from './AwzBucketResourceItem.vue'
import { listAllPermissionGroup } from '@/api/policy'
import { listUserNames } from '@/api/user'
import { listBucketNames } from '@/api/bucket'

export default {
  name: 'AwzStatement',
  components: { PermissionConfig, AwzBucketResourceItem },
  props: {
    value: {
      type: Object,
      default: () => { }
    },
    editable: {
      type: Boolean,
      default: false
    },
    labelWidth: {
      type: String,
      default: '60px'
    },
    hidePrincipal: {
      type: Boolean,
      default: false
    },
    actionConfig: {
      type: Array,
      default: () => []
    },
    actionMergeGroup: {
      type: Boolean,
      default: false
    },
    actionLabelPosition: {
      type: String,
      default: 'left'
    },
    actionKeyCol: {
      type: String,
      default: 'key'
    },
    actionLabelCol: {
      type: String,
      default: 'label'
    },
    actionLabelWidth: {
      type: String,
      default: '200px'
    },
    actionItemWidth: {
      type: String,
      default: '240px'
    },
    actionHeight: {
      type: String,
      default: '300px'
    },
    conditionSymbols: {
      type: Array,
      default: () => [
        { value: 'StringEquals', label: '(字符串) =' },
        { value: 'IpAddress', label: '(IP地址) 是' },
        { value: 'NotIpAddress', label: '(IP地址) 否' }
      ]
    },
    conditionKeys: {
      type: Array,
      default: () => [
        { value: 's3:prefix', label: '前缀' },
        { value: 's3:delimiter', label: '分隔符' },
        { value: 'aws:SourceIp', label: 'IP地址' }
      ]
    },
    conditionHeight: {
      type: String,
      default: '300px'
    },
    btnNotice: {
      type: String,
      default: '按下“enter键”或点击“+”添加'
    }
  },
  data() {
    return {
      statement: {
        Sid: '',
        Effect: 'Allow',
        Principal: [],
        Resource: [],
        Action: [],

        Condition: {}
      },
      isshow: false,
      principal: {
        val: ''
      },
      resource: {
        prepend: 'arn:aws:s3:',
        region: '',
        userName: '',
        bucketName: '*',
        keyName: '*'
      },
      focus: {
        userName: false,
        bucketName: false,
        keyName: false
      },
      isActionGroup: 0,
      isResourceAll: true,
      permissionGroupId: '',
      permissionGroupList: [],
      condition: {
        symbol: '',
        key: '',
        val: ''
      },
      copyConditionSymbols: [],
      ResourceBack: []
    }
  },
  computed: {
    routeBucketName() {
      return this.$route.params.id
    },
    conditionSymbolsInfo() {
      return (this.conditionSymbols || []).reduce((prev, sb) => {
        prev[sb.value] = sb.label
        return prev
      }, {})
    },
    conditionKeysInfo() {
      return (this.conditionKeys || []).reduce((prev, k) => {
        prev[k.value] = k.label
        return prev
      }, {})
    },
    conditionArr() {
      return Object.keys(this.statement.Condition || {}).map(sb => ({
        key: sb,
        label: this.conditionSymbolsInfo[sb] || sb,
        children: Object.keys(this.statement.Condition[sb] || {}).map(k => ({
          key: k,
          pkey: sb,
          label: this.conditionKeysInfo[k] || k,
          val: this.statement.Condition[sb][k]
        }))
      }))
    },
    isUserNameAll: {
      get() {
        return this.resource.userName == '*' && !this.focus.userName
      },
      set(val) {
        if (val) this.resource.userName = '*'
        else this.resource.userName = ''
      }
    },
    isBucketNameAll: {
      get() {
        return this.resource.bucketName == '*' && !this.focus.bucketName
      },
      set(val) {
        if (val) this.resource.bucketName = '*'
        else this.resource.bucketName = ''
      }
    },
    isKeyNameAll: {
      get() {
        return this.resource.keyName == '*' && !this.focus.keyName
      },
      set(val) {
        if (val) this.resource.keyName = '*'
        else this.resource.keyName = ''
      }
    },
    permissionGroup() {
      return this.permissionGroupList.find(g => g.id == this.permissionGroupId) || {}
    }
  },
  watch: {
    value() {
      this.refreshStatement()
    }
  },
  mounted() {
    this.copyConditionSymbols = JSON.parse(JSON.stringify(this.conditionSymbols))
    if (!this.hidePrincipal) {
      // 桶名称 默认先展示当前桶
      this.resource.bucketName = this.routeBucketName
    }
    this.loadPermissionGroups()
    this.refreshStatement()
    this.initResourceState()
    this.initActionState()
  },
  methods: {
    refreshStatement() {
      this.statement = {
        ...this.statement,
        ...this.value,
        Sid: this.value.Sid || '',
        Effect: this.value.Effect || 'Deny',
        Principal: this.value.Principal || [],
        Resource: Array.isArray(this.value.Resource) ? (this.value.Resource || []) : [this.value.Resource],
        Action: Array.isArray(this.value.Action) ? (this.value.Action || []) : [this.value.Action],
        Condition: this.value.Condition || {}
      }
    },
    handleAddPrincipalItem() {
      const reg = /^[0-9a-zA-Z-_/:*.]+$/
      const val = this.principal.val.trim()
      if (!val) {
        this.$message.error(`请填写用户名称`)
        return
      }
      if (!reg.test(val)) {
        this.$message.error(`用户名称格式错误，仅支持英文、数字和-_/:*.`)
        return
      }
      if (this.statement.Principal.some(r => r == val)) {
        this.$message.error(`该用户已存在，请不要重复添加`)
        return
      }
      this.statement.Principal.push(val)
      this.statement.Principal.splice()
      this.principal.val = ''
      this.emitChange()
    },
    handleDelPrincipalItem(index) {
      const pri = this.statement.Principal[index]
      this.$confirm(`您确定要删除 <b style="color:#ff8746"> ${pri}</b> 吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      })
        .then(() => {
          this.statement.Principal.splice(index, 1)
          // this.$message.success('删除成功')
          this.emitChange()
        })
        .catch(() => { })
    },
    handleChangeResourceType(val) {
      if (val) {
        const resAll = `${this.resource.prepend}::${this.routeBucketName}/*`
        this.ResourceBack = [...this.statement.Resource]
        this.statement.Resource = [resAll]
      } else {
        this.statement.Resource = [...this.ResourceBack]
        this.ResourceBack = []
      }
      this.statement.Resource.splice()
      this.emitChange()
    },
    handleAddResourceItem() {
      // const reg = /^[0-9a-zA-Z-_.?*]+$/
      const resource = {
        region: this.resource.region.trim(),
        userName: this.resource.userName.trim(),
        bucketName: this.resource.bucketName.trim(),
        keyName: this.resource.keyName.trim()
      }
      const itemEnum = {
        region: { name: '区域', reg: /^[0-9a-zA-Z-_.?*]+$/, msg: '格式错误，仅支持英文、数字和-_.?*' },
        userName: { name: '用户名', reg: /^[0-9a-zA-Z-_.?*]+$/, msg: '格式错误，仅支持英文、数字和-_.?*' },
        bucketName: { name: '桶名称', reg: /^[0-9a-zA-Z-_.?*]+$/, msg: '格式错误，仅支持英文、数字和-_.?*' },
        keyName: { name: '对象名称', reg: /^([0-9a-zA-Z-_.?*][/]?)+$/, msg: '格式错误，仅支持英文、数字和/-_.?*且不能以"/"开头或者连续"/"' }
      }

      if (!resource.bucketName) {
        this.$message.error(`请填写桶名称`)
        return false
      }
      for (const k in itemEnum) {
        if (resource[k] && !itemEnum[k].reg.test(resource[k])) {
          this.$message.error(`${itemEnum[k].name}${itemEnum[k].msg}`)
          return false
        }
      }
      const res =
        `${this.resource.prepend}${resource.region}:${resource.userName}:${resource.bucketName}` +
        (resource.keyName ? `/${resource.keyName}` : '')
      if (this.statement.Resource.some(r => r == res)) {
        this.$message.error(`该配置已存在，请不要重复添加`)
        return false
      }
      this.statement.Resource.push(res)
      this.statement.Resource.splice()
      this.resource.region = ''
      this.resource.userName = ''
      this.resource.bucketName = this.routeBucketName || '*'
      // this.resource.keyName = '*'
      this.emitChange()
      return true
    },
    // inputValue (val, resource) {
    //   console.log(resource.keyName, 'egeg')
    //   // const reg = /^[0-9a-zA-Z-_.?*]+$/
    //   // if (!reg.test(resource.keyName)) {
    //   //   // this.$message.error(`对象名称格式错误，仅支持英文、数字和-_.?*`)
    //   //   this.isshow = true
    //   // } else {
    //   //   this.isshow = false
    //   // }
    // },
    handleChangeBucketResourceItem(idx, resource, target) {
      resource = { ...this.resource, ...resource }
      if (!resource.keyName) {
        this.handleDelResourceItem(idx)
        return
      }
      const res =
        `${this.resource.prepend}${resource.region}:${resource.userName}:${resource.bucketName}` + '/' +
        (resource.keyName ? `${resource.keyName}` : '')
      this.statement.Resource[idx] = res
      this.statement.Resource.splice()
      this.emitChange()
    },
    handleAddBucketResourceItem(resource, target) {
      this.resource = { ...this.resource, ...resource }
      if (!this.resource.keyName) {
        this.$message.error('请填写资源')
        return
      }
      if (this.handleAddResourceItem()) {
        target.clearKeyName()
      }
    },
    handleDelResourceItem(index, target = undefined) {
      const res = this.statement.Resource[index]
      this.$confirm(`您确定要删除 <b style="color:#ff8746">${res}</b> 吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      })
        .then(() => {
          this.statement.Resource.splice(index, 1)
          // this.$message.success('删除成功')
          this.emitChange()
        })
        .catch(() => {
          if (target) target.refreshResource()
        })
    },
    checkResourceSame(idx) {
      console.log(idx, 'wwwww')
      return (this.statement.Resource || []).some((r, i) => r == (this.statement.Resource[idx] || '') && i != idx)
    },
    filterSymbol(val) {
      this.condition.symbol = ''
      this.condition.val = ''
      if (val === 'aws:SourceIp') {
        this.copyConditionSymbols = this.conditionSymbols.filter(item => {
          return item.value.indexOf('Ip') > -1
        })
      } else {
        this.copyConditionSymbols = this.conditionSymbols.filter(item => {
          return item.value.indexOf('Ip') == -1
        })
      }
    },
    handleAddConditionItem() {
      let reg = /^[0-9a-zA-Z-_/]+$/
      if (!this.condition.key) {
        this.$message.error('请选择项目')
        return
      }
      if (!this.condition.symbol) {
        this.$message.error('请选择符号')
        return
      }
      const val = this.condition.val.trim()
      if (!val) {
        this.$message.error('请填写值')
        return
      }
      if (this.condition.key === 'aws:SourceIp') {
        reg = /^(\*|(((\*|2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(\*|2[0-4]\d|25[0-5]|[01]?\d\d?)))$/
        const len = val.match(/\*/g)
        if (!reg.test(val) || (len && len.length > 1)) {
          return this.$message.error(`值格式错误，请输入合法ip地址`)
        }
      } else if (!reg.test(val)) {
        this.$message.error(`值格式错误，仅支持英文、数字和"-_/"`)
        return
      }
      if (!(this.condition.symbol in this.statement.Condition)) {
        this.$set(this.statement.Condition, this.condition.symbol, {})
      }
      this.$set(
        this.statement.Condition[this.condition.symbol],
        this.condition.key,
        val
      )
      this.condition.val = ''
      this.emitChange()
    },
    handleDelConditiionItem(symbol, key) {
      this.$confirm(`您确定要删除当前的条件吗？`, '确认删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$delete(this.statement.Condition[symbol], key)
          if (Object.keys(this.statement.Condition[symbol]).length <= 0) {
            this.$delete(this.statement.Condition, symbol)
          }
          // this.$message.success({
          //   message: '删除成功'
          // })
          this.emitChange()
        })
        .catch(() => { })
    },
    searchUserNames(queryStr, cb) {
      listUserNames(queryStr).then(res => {
        cb((res.data || []).map(n => ({ value: n })))
      })
    },
    searchBucketNames(queryStr, cb) {
      listBucketNames(queryStr).then(res => {
        cb((res.data || []).map(n => ({ value: n })))
      })
    },
    loadPermissionGroups() {
      if (this.permissionGroupList && this.permissionGroupList.length) {
        this.initActionState()
        return
      }
      if (this.routeBucketName) {
        listAllPermissionGroup().then(res => {
          this.permissionGroupList = res.data
          this.initActionState()
        })
      }
    },
    initResourceState() {
      if (this.routeBucketName) {
        const resAll = `${this.resource.prepend}::${this.routeBucketName}/*`
        if (
          this.statement.Resource.length == 0 ||
          (this.statement.Resource.length == 1 && (!this.statement.Resource[0].includes('/') || this.statement.Resource[0].endsWith(`:${this.routeBucketName}/*`)))
        ) {
          this.isResourceAll = true
          this.statement.Resource = [resAll]
        } else {
          this.isResourceAll = false
        }
      } else {
        this.isResourceAll = false
      }
    },
    initActionState() {
      if (!this.routeBucketName) return
      const group = this.findGroupFromPermissions(this.statement)
      this.isActionGroup = ((this.permissionGroupList.length > 0 && group) || (this.statement.Action && this.statement.Action.length <= 0)) ? 1 : 0
      if (this.isActionGroup) {
        this.changePermissionGroup((group || this.permissionGroupList[0] || {}).id || '')
      } else {
        this.permissionGroupId = ''
      }
    },
    changeActionState(isGroup) {
      if (isGroup) {
        const group = this.findGroupFromPermissions(this.statement)
        this.permissionGroupId = (group || this.permissionGroupList[0] || {}).id || ''
        this.refreshActionFromGroupPermission()
      } else {
        this.permissionGroupId = ''
        this.statement.Effect = 'Allow'
        this.statement.Action = []
      }
      this.emitChange()
    },
    changePermissionGroup(id) {
      this.permissionGroupId = id
      this.refreshActionFromGroupPermission()
      this.emitChange()
    },
    refreshActionFromGroupPermission() {
      if (!this.permissionGroupId) return
      const gp = this.permissionGroupList.find(g => g.id == this.permissionGroupId) || {}
      this.statement.Effect = gp.allow ? 'Allow' : 'Deny'
      this.statement.Action = [...((gp.permissions || '').split(','))]
    },
    findGroupFromPermissions(statement) {
      return this.permissionGroupList.find(pg => this.isArrValSame(pg.permissions.split(','), statement.Action) && (pg.allow ? 'Allow' : 'Deny') == statement.Effect)
    },
    isArrValSame(arr1, arr2) {
      arr1 = arr1 || []
      arr2 = arr2 || []
      if (arr1.length != arr2.length) return false
      const arr = [...(new Set([...arr1, ...arr2]))]
      return arr.length == arr1.length
    },
    emitChange() {
      this.$emit('input', this.deepClone(this.statement))
      this.$emit('change', this.deepClone(this.statement))
    },
    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    shotResource(res) {
      return (res || '').substring(13)
    },
    shotResourceBucketName(res) {
      const shot = this.shotResource(res)
      return shot.substring(0, shot.indexOf('/'))
    }
  }
}
</script>
<style scoped lang="scss">
::v-deep .desc-label {
  // color: inherit;
  width: var(--statement-label-width);
}

.input {
  width: 400px;
}

.resource-bucket-item {
  margin-bottom: 2px;
}

.resource-containor {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;

  .resource-item {
    margin: 3px 5px 3px 0;
  }

  .resource-item-edit {
    margin: 0 8px 8px 0;
  }
}
.resource-inputs {
  display: flex;
  align-items: stretch;
  overflow: hidden;
  background-color: #2b3d44;
  border-radius: 5px;

  .resource-label {
    color: #909399;
    padding: 0 3px;
    border: 1px solid #19272e;
    margin: 0 -1px;
    display: flex;
    align-items: center;

    .el-tooltip.el-button {
      font-size: 12px;
    }
  }

  .resource-input {
    width: 100px;
    margin-left: 1px;

    ::v-deep .el-input__inner {
      border-radius: 0;
      // padding: 0 6px;
    }
  }

  .label-left {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    margin: 0 -1px 0 0;
    padding: 0 5px 0 10px;
  }

  .label-right {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    margin: 0 0 0 -1px;
    padding: 0 10px 0 5px;
  }

  ::v-deep .label-right .el-button {
    border-color: transparent;
    background-color: transparent;
    border-top: 0;
    border-bottom: 0;
    margin-right: -5px;
    // color: #409eff;
    font-size: 1.3em;

    &:hover {
      color: #d87b49;
    }
  }
}

.resource--inputs {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;

  .resource-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    height: 34px;
    margin-bottom: 5px;

    ::v-deep .el-radio-group {
      margin-top: 4px;

      .el-radio {
        margin-right: 20px;
      }

      .w1 {
        width: 110px;
      }

      .w2 {
        width: 80px;
      }
    }

    .lb2 {
      width: 80px;
    }
  }

  .resource-input {
    width: 190px;
    margin-right: 5px;
  }
}

::v-deep .permi-gps {
  .el-radio {
    margin: 4px 8px 4px 0 !important;

    .el-radio__label {
      font-size: 14px;
    }
  }
}

.condition-opt {
  display: flex;
  justify-content: space-between;
}

.condition-opt .label {
  font-weight: bold;
  margin-right: 40px;
}

.condition-opt .val {
  color: #b2b4b9;
}

::v-deep .condition-node {
  display: flex;
  align-items: center;

  .el-button {
    .el-icon-circle-close {
      color: #ff8746;
    }
  }
}

.condition-node .node {
  margin-right: 10px;
}

.condition-btn {
  margin-left: 20px;
  font-size: 16px;
}

.bold {
  font-weight: bold;
}

.primary {
  color: #409eff;
}

.secordany {
  color: #b2b4b9;
}

.simple-card {
  border: 0;

  ::v-deep .el-card__body {
    padding: 0;
  }
}

.notice {
  margin-left: 3px;
  font-size: 14px;
}

.ul,
.li {
  list-style: disc inside;
  text-indent: -1.4em;
  margin-left: 10px;
}

.zdylm {
  background-color: red !important;
}
</style>

<style lang="scss">
.el-popper.resource-input{
  width: auto !important;
}
</style>
