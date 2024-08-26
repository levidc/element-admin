<template>
  <div style="display: flex;flex-direction: column;">
    <el-header class="bdetail_header">
      <span
        class="bdetail_title"
        style="margin-top:-2px"
      >对象路径:</span>
      <span
        v-for="(item, index) in routeArr"
        :key="item + index"
        class="bdetail_title"
      >
        <router-link
          :is="loading ? 'span' : 'router-link'"
          v-if="index == 0"
          class="blue"
          :to="{ name: 'BucketList' }"
        >
          {{ item }}
          <span
            role="presentation"
            class="el-breadcrumb__separator"
          >&gt;</span>
        </router-link>
        <router-link
          :is="loading ? 'span' : 'router-link'"
          v-else-if="index !== 0 && index !== routeArr.length - 1"
          class="blue"
          :to="{ name: 'BucketList', query: { filename: directoryPath(item) + '/' } }"
        >
          {{ item + '/' }}
          <span
            role="presentation"
            class="el-breadcrumb__separator"
          >&gt;</span>
        </router-link>
        <span v-else>{{ item }}</span>
      </span>
    </el-header>
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div
          v-loading="loading"
          class="bucket-panel"
        >
          <!-- tab  -->
          <div class="topMenu">
            <h2>
              <showToolTip :text="showFileName(resInfo.Prefix)" />
              <!-- <el-tooltip
                placement="top"
                content="复制"
                :open-delay="300"
              >
                <i
                  class="el-icon-document-copy"
                  style="margin-left:10px"
                />
              </el-tooltip> -->
            </h2>
            <!-- <el-button type="primary" @click="$router.go(-1)">返回</el-button> -->
            <!-- <el-button>占位符1</el-button>
            <el-button>占位符2</el-button>
            <el-button>占位符3</el-button>
            <el-dropdown style="margin-left:10px" @command="handleStatus">
              <el-button>
                对象操作<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  command="download"
                >下载</el-dropdown-item>
                <el-dropdown-item
                  command="move"
                >移动</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown> -->
          </div>

          <!-- object tab -->
          <el-tabs
            v-model="activeName"
            class="tabCard"
            @tab-click="handleClick"
          >
            <el-tab-pane
              label="属性"
              name="property"
            >
              <div>
                <h3 class="titleh1">基本信息</h3>
                <div class="configList">
                  <div class="content">
                    <div class="contentL">
                      <p>
                        对象Key
                        <span>
                          <el-tooltip
                            placement="top"
                            content="复制"
                            :open-delay="300"
                          >
                            <i
                              class="el-icon-document-copy"
                              @click="copyCode(baseInfo.objectKey)"
                            />
                          </el-tooltip>
                          {{ baseInfo.objectKey ||'-' }}
                        </span>
                      </p>
                      <p>
                        大小
                        <span>{{ file.size }}</span>
                      </p>
                      <p>
                        类型
                        <span>{{ file.type }}</span>
                      </p>
                      <p>
                        上次修改时间
                        <span>{{ file.LastModified }}</span>
                      </p>
                      <p>
                        桶名称
                        <span>{{ baseInfo.bucketName || '-' }}</span>
                      </p>
                      <p>
                        版本ID
                        <span>{{ baseInfo.versionId==='null'?'-':baseInfo.versionId }}</span>
                      </p>
                      <p>
                        ETag
                        <span>{{ baseInfo.etag || '-' }}</span>
                      </p>
                      <!-- <p>
                        底层资源
                        <span>{{ getResourceName(baseInfo.resourceId) }}</span>
                      </p> -->
                    </div>
                    <!-- <div class="contentR">
                      <p v-if="file.type!=='删除标记'">
                        S3 URL
                        <span
                          style="cursor:pointer"
                          @click="copyCode(file.S3URL)"
                        >
                          <i
                            class="el-icon-document-copy"
                            title="复制到剪贴板"
                          />
                          {{ file.S3URL }}
                        </span>
                      </p>
                      <p>
                        Amazon Resource Name (ARN)
                        <span
                          style="cursor:pointer"
                          @click="copyCode(file.ARN)"
                        >
                          <i
                            class="el-icon-document-copy"
                            title="复制到剪贴板"
                          />
                          {{ file.ARN }}
                        </span>
                      </p>
                    </div> -->
                  </div>
                </div>
                <div
                  class="headFlex"
                  style="margin-top:50px;"
                >
                  <h3 class="titleh1">底层资源</h3>
                </div>
                <el-table
                  :data="bottomObjectInfos"
                  style="width:80%;"
                >
                  <el-table-column
                    prop="resourceName"
                    label="资源名称"
                    min-width="120px"
                  />
                  <el-table-column
                    prop="size"
                    label="资源容量"
                    min-width="100px"
                  >
                    <template slot-scope="scope">
                      {{ byteConvert(scope.row.size || 0) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="bottomKey"
                    label="底层key"
                    min-width="120px"
                  />
                  <el-table-column
                    prop="coordinatorType"
                    label="资源类型"
                    min-width="100px"
                  />
                </el-table>
                <div
                  class="headFlex"
                  style="margin-top:50px;"
                >
                  <h3 class="titleh1">扩展信息</h3>
                  <!-- <h3 class="titleh1">元信息</h3> -->
                </div>
                <div class="configList">
                  <div class="content">
                    <div class="headContainer">
                      <p>
                        cacheControl
                        <span>{{ header.cacheControl || '-' }}</span>
                      </p>
                      <p>
                        contentDisposition
                        <span>{{ renderContentDisposition(header.contentDisposition) }}</span>
                      </p>
                      <p>
                        contentEncoding
                        <span>{{ header.contentEncoding || '-' }}</span>
                      </p>
                      <p>
                        contentLanguage
                        <span>{{ header.contentLanguage || '-' }}</span>
                      </p>
                      <p>
                        contentMd5
                        <span>{{ header.contentMd5 || '-' }}</span>
                      </p>
                      <p>
                        contentType
                        <span>{{ header.contentType || '-' }}</span>
                      </p>
                      <p
                        v-for="item in mapMetaInfo"
                        :key="item.label"
                      >
                        {{ item.label }}
                        <span>{{ item.value }}</span>
                      </p>
                    </div>
                    <!-- <div class="contentR layout_meta">
                      <p v-for="item in mapMetaInfo" :key="item.label">
                        {{ item.label }}
                        <span>{{ item.value }}</span>
                      </p>
                    </div> -->
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane
              v-loading="tabLoading"
              label="对象锁定"
              name="lock"
            >
              <div v-if="bucketConfig.objectLock">
                <div v-loading="legalHoldLoading">
                  <h3 class="titleh1">对象锁定依法保留
                    <el-button
                      type="text"
                      @click="legalHoldFlag = true"
                    >
                      <span style="color:#ff8746">编辑</span>
                    </el-button>
                  </h3>
                  <div class="mb_15">
                    <p>依法保留</p>
                    <div>{{ enableRention ? '已启用' : '已禁用' }}</div>
                  </div>
                </div>
                <div v-loading="objectRetentionFlag">
                  <h3 class="titleh1">对象锁定保留
                    <el-button
                      type="text"
                      @click="objectRentionFlag = true"
                    >
                      <span style="color:#ff8746">编辑</span>
                    </el-button>
                  </h3>
                  <div class="mb_15">
                    <p>保留模式</p>
                    <div>{{ mode ? mode === 'GOVERNANCE' ? '监管模式' : '合规模式' : '已禁用' }}</div>
                  </div>
                  <div
                    v-if="mode"
                    class="mb_15"
                  >
                    <p>保留到期日</p>
                    <div>{{ RetainUntilDate }}</div>
                  </div>
                </div>
              </div>
              <div v-else>
                <h3 class="titleh1">对象锁定</h3>
                <p>
                  已禁用
                </p>
              </div>
            </el-tab-pane>
            <el-tab-pane
              v-loading="tabLoading"
              label="权限"
              name="permission"
            >
              <div class="param-box">
                <div class="param-hd">
                  <h3>访问控制列表(ACL)</h3>
                  <el-button
                    v-show="!editStatus&&!disableAcl"
                    :disabled="disableAclBtn"
                    type="text"
                    style="position:relative;top:3px"
                    @click="editConfig"
                  >
                    <span style="color:#ff8746">编辑</span>
                  </el-button>
                </div>
              </div>
              <el-form
                :model="formAcl"
                label-width="120px"
              >
                <el-form-item
                  v-if="!editStatus && !loading"
                  label="对象ACL"
                  style="width:50%"
                >
                  <span v-if="!disableAcl">
                    {{ formAcl.readAcl }}
                  </span>
                  <span v-else>删除标记无法设置Acl
                  </span>
                  <!-- <el-button type="text">{{ formAcl.readAcl }}</el-button> -->
                </el-form-item>

                <!-- 额外用户start -->
                <el-table
                  v-show="!editStatus && tableData.length"
                  :data="tableData"
                >
                  <el-table-column
                    prop="owner"
                    label="被授权者"
                    width="500px"
                  >
                    <template slot-scope="scope">
                      {{ scope.row.userName }} {{ scope.row.FULL_CONTROL || scope.row.owner ? "(桶owner)":"" }}
                    </template>
                  </el-table-column>
                  <el-table-column label="">
                    <template slot-scope="scope">
                      <!-- <div v-if="editStatus" class="reverseColumn">
                      <el-checkbox v-model="scope.row.objectRead">
                        列出
                      </el-checkbox>
                      <el-checkbox v-model="scope.row.objectWrite" :disabled="scope.row.key == 2 || scope.row.key == 3">
                        写入
                      </el-checkbox>
                    </div> -->
                      <span>{{ objectMap(scope.row) || '/' }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="owner"
                    label=""
                  >
                    <template slot-scope="scope">
                      <!-- <div v-if="editStatus" class="reverseColumn">
                      <el-checkbox v-model="scope.row.bucketRead">
                        读取
                      </el-checkbox>
                      <el-checkbox v-model="scope.row.bucketWrite" :disabled="scope.row.key == 2 || scope.row.key == 3">
                        写入
                      </el-checkbox>
                    </div> -->
                      <span>{{ bucketMap(scope.row) || '/' }}</span>
                    </template>
                  </el-table-column>
                </el-table>
                <!-- 额外用户end -->

                <el-form-item
                  v-if="editStatus"
                  label="对象ACL"
                  prop="setAcl"
                >
                  <el-radio-group v-model="formAcl.selectAcl">
                    <el-radio label="private">私有</el-radio>
                    <el-radio label="public-read">公共读</el-radio>
                    <!-- <el-radio label="public-read-write">公共读写</el-radio> -->
                    <el-radio label="authenticated-read">认证读</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>

              <div
                v-show="editStatus"
                class="addOtherAccount"
              >
                <h3>其他账号的访问权限</h3>
                <el-button
                  v-access="'admin:ListUsers'"
                  class="golden"
                  @click="flag = true"
                >添加授权用户</el-button>
                <el-form
                  ref="form"
                  :model="form"
                >
                  <el-table
                    v-if="form.granteeTable && form.granteeTable.length"
                    :data="form.granteeTable"
                  >
                    <el-table-column
                      label="被授权者"
                      width="500px"
                    >
                      <template slot-scope="scope">
                        {{ scope.row.userName }}{{ scope.row.FULL_CONTROL || scope.row.owner ? "(桶owner)":"" }}
                        <!-- <el-form-item :rules="ruleId" :prop="'granteeTable.'+ scope.$index +'.ID'">
                        <el-input v-model="scope.row.ID" placeholder="输入规范ID" />
                      </el-form-item> -->
                      </template>
                    </el-table-column>
                    <el-table-column label="">
                      <template slot-scope="scope">
                        <div>
                          <el-checkbox
                            v-model="scope.row.READ"
                            :disabled="scope.row.FULL_CONTROL || scope.row.owner"
                          >
                            读
                          </el-checkbox>
                          <!-- <el-checkbox v-model="scope.row.WRITE">
                            写
                          </el-checkbox> -->
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="">
                      <template slot-scope="scope">
                        <div>
                          <el-checkbox
                            v-model="scope.row.READ_ACP"
                            :disabled="scope.row.FULL_CONTROL || scope.row.owner"
                          >
                            读ACL
                          </el-checkbox>
                          <el-checkbox
                            v-model="scope.row.WRITE_ACP"
                            :disabled="scope.row.FULL_CONTROL || scope.row.owner"
                          >
                            写ACL
                          </el-checkbox>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column>
                      <template slot-scope="scope">
                        <i
                          v-if="!(scope.row.FULL_CONTROL || scope.row.owner)"
                          title="删除"
                          class="fa fa-trash-o"
                          @click="form.granteeTable.splice(scope.$index, 1)"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </el-form>

                <!-- Contents 当前版本 -->
                <!-- Versions  版本管理-->
                <h3 style="margin: 20px 0">指定的对象</h3>
                <el-table :data="[tableObj]">
                  <el-table-column
                    label="名称"
                    width="300px"
                  >
                    <template slot-scope="scope">
                      <a
                        class="blue"
                        @click="activeName = 'property'"
                      >
                        <!-- <i class="fa fa-file-o" /> -->
                        <span>{{ showFileName(resInfo.Prefix) }}</span>
                      </a>
                    </template>
                  </el-table-column>
                  <el-table-column
                    v-if="isVersion"
                    label="版本ID"
                    prop=""
                    width="300px"
                  >
                    <template>
                      {{ $route.query.VersionId || '/' }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="类型"
                    prop=""
                  >
                    <template>
                      {{ getFileType(resInfo.Prefix) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="上次修改时间"
                    prop=""
                    width="300px"
                  >
                    <template slot-scope="scope">
                      {{ formatDate(new Date(scope.row.LastModified)) || '/' }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="大小"
                    prop=""
                  >
                    <template slot-scope="scope">
                      {{ byteConvert(scope.row.Size) || '/' }}
                    </template>
                  </el-table-column>
                </el-table>

                <div class="bottomMenu">
                  <el-button
                    class="blue"
                    @click="editStatus = false; getObjectAcl()"
                  >取消</el-button>
                  <el-button
                    class="golden"
                    @click="saveConfig"
                  >保存</el-button>
                </div>
              </div>

            </el-tab-pane>
            <el-tab-pane
              label="版本"
              name="version"
            >
              <h3 class="titleh1">对象版本信息</h3>
              <el-table
                :data="versionTable"
                :max-height="500"
                @sort-change="sortFunction"
              >
                <el-table-column
                  label="版本ID"
                  width="350px"
                  prop="VersionId"
                  sortable="custom"
                  :default-sort="defaultSort"
                >
                  <template slot-scope="scope">
                    <!-- <i class="fa fa-file-o" /> -->
                    <el-tooltip
                      v-if="$route.query.VersionId && scope.row.VersionId !== $route.query.VersionId&&!scope.row.delMarker"
                      placement="top"
                      content="查看版本"
                    >
                      <span
                        class="alink"
                        @click="handleClickRow(scope.row)"
                      >
                        {{ scope.row.VersionId }} <span class="orange">
                          {{ mapVersion(scope.row) }}
                        </span>
                      </span>
                    </el-tooltip>
                    <span v-else>
                      {{ scope.row.VersionId }} <span class="orange">
                        {{ mapVersion(scope.row) }}
                      </span>
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="类型"
                  prop="type"
                  sortable="custom"
                >
                  <template slot-scope="scope">
                    {{ scope.row.delMarker ? '删除标记' : getFileType(scope.row.Key) }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="上次修改时间"
                  prop="LastModified"
                  width="300px"
                  sortable="custom"
                >
                  <template slot-scope="scope">
                    {{ formatDate(scope.row.LastModified) || '/' }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="大小"
                  prop="Size"
                  sortable="custom"
                >
                  <template slot-scope="scope">
                    {{ scope.row.delMarker ? '/' : byteConvert(scope.row.Size) || '/' }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="存储类"
                  prop="StorageClass"
                  sortable="custom"
                >
                  <template slot-scope="scope">
                    {{ transClass(scope.row.StorageClass) || '/' }}
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <el-dialog
        title="编辑对象锁定依法保留"
        :visible.sync="legalHoldFlag"
        width="500px"
      >
        <h3 class="titleh1">对象锁定依法保留</h3>
        <el-radio-group
          v-model="legalHoldRaido"
          class="reverseColumn"
        >
          <el-radio label="OFF">禁用</el-radio>
          <el-radio label="ON">启用</el-radio>
        </el-radio-group>
        <div slot="footer">
          <el-button @click="legalHoldFlag = false">{{ $ts('cancel') }}</el-button>
          <el-button type="primary" class="golden" @click="saveObjectLegalHold">{{ $ts('save') }}</el-button>
        </div>
      </el-dialog>
      <el-dialog
        title="编辑对象锁定保留"
        :visible.sync="objectRentionFlag"
        width="700px"
      >
        <h3 class="titleh1">对象锁定保留</h3>
        <el-form
          ref="objectRentionForm"
          :model="objectRentionForm"
          :rules="rules"
        >
          <el-radio-group
            v-model="objectRentionForm.objectRentionRaido"
            class="reverseColumn"
            :disabled="disableObjectLock&&disableMode"
          >
            <el-radio label="OFF">禁用</el-radio>
            <el-radio label="ON">启用</el-radio>
          </el-radio-group>
          <div v-if="objectRentionForm.objectRentionRaido == 'ON'">
            <el-form-item
              label="保留模式"
              class="reverseColumn"
            >
              <el-radio-group
                v-model="objectRentionForm.Mode"
                class="reverseColumn"
                :disabled="disableMode"
              >
                <el-radio label="GOVERNANCE">监管模式</el-radio>
                <el-radio label="COMPLIANCE">合规模式</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="保留到期日"
              prop="timePicker"
              class="reverseColumn"
            >
              <el-date-picker
                v-model="objectRentionForm.timePicker"
                :picker-options="disableCurrentDate"
                type="datetime"
                placeholder="选择日期时间"
              />
            </el-form-item>
            <div v-if="disableObjectLock">
              <i class="fa el-icon-warning-outline red" />
              <b>
                在{{ mode === 'GOVERNANCE' ? '监管模式' : '合规模式' }}下，在保留期到期之前，对象不可变
              </b>
              <p
                v-if="mode==='COMPLIANCE'"
                class="red"
              >只能将保留日期更改为{{ RetainUntilDate }}之后的日期。</p>
            </div>
            <div
              v-else-if="objectRentionForm.objectRentionRaido === 'ON'"
              class="red"
            >
              <i class="fa el-icon-warning-outline" />
              在{{ objectRentionForm.Mode === 'GOVERNANCE' ? '监管模式' : '合规模式' }}下，在保留期到期之前，对象不可变
              <p
                v-if="mode==='COMPLIANCE'"
                class="red"
              >只能将保留日期更改为{{ RetainUntilDate }}之后的日期。</p>
            </div>
          </div>
        </el-form>
        <div slot="footer">
          <el-button @click="objectRentionFlag = false">{{ $ts('cancel') }}</el-button>
          <el-button type="primary" class="golden" @click="saveObjectRention">{{ $ts('save') }}</el-button>
        </div>
      </el-dialog>

      <el-dialog
        ref="userDialog"
        title="选择额外授权用户"
        :visible.sync="flag"
        @close="handleScroll('userDialog')"
      >
        <div class="clearfix">
          <el-row>
            <el-col :span="8">
              <el-select
                v-model="userGroup"
                style="width: 100%;"
                multiple
                collapse-tags
                placeholder="已选用户"
                @change="changeSelect"
              >
                <el-option
                  v-for="item in listGroup"
                  :key="item.userName"
                  :label="item.userName"
                  :value="item.userName"
                />
              </el-select>
            </el-col>
            <el-col
              :span="8"
              class="ipt"
            >
              <el-input
                v-model="userName"
                placeholder="用户名过滤"
              />
            </el-col>
          </el-row>
        </div>
        <el-table
          ref="userTable"
          :data="userData.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
          :row-key="(row) => row.userName"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            reserve-selection
            width="55"
          />
          <el-table-column
            label="用户名"
            prop="userName"
          />
        </el-table>
        <div slot="footer">
          <el-button class="blue" @click="flag = false">{{ $ts('button.cancel') }}</el-button>
          <el-button class="golden" @click="addAccount()">{{ $ts('button.confirm') }}</el-button>
        </div>
        <div
          v-show="total"
          class="page_block"
        >
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
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { listUsers } from '@/api/user'
import { getObjectMeta } from '@/api/bucket'
export default {
  data() {
    const validateCurrentTime = (rule, data, callback) => {
      const currentTime = new Date().getTime()
      const selectTime = new Date(data).getTime()
      // 监管、合约日期选择范围原设置后时间
      if (
        this.objectRentionForm.Mode === 'COMPLIANCE' &&
        this.RetainUntilDate &&
        selectTime < new Date(this.RetainUntilDate).getTime()
      ) {
        return callback(`请选择${this.RetainUntilDate}之后的时间。`)
      } else
      if (selectTime < currentTime) {
        return callback('保留到期日必须为未来的日期')
      } else {
        callback()
      }
    }
    const checkValidID = (rule, data, callback) => {
      const index = rule.field.match(/\d/)[0]
      const len = this.form.granteeTable.length
      for (let i = 0; i < len; i++) {
        if (i == index) continue
        if (
          data === this.form.granteeTable[i].ID ||
          data === this.tableData[0].ID
        ) {
          return callback('必须指定唯一的被授权者。')
        }
      }
      callback()
    }
    return {
      tabLoading: false,
      bottomObjectInfos: [],
      baseInfo: {},
      header: {},
      metaInfo: {},
      disableMode: false,
      tableObj: {},
      legalHoldLoading: false,
      objectRetentionFlag: false,
      defaultSort: {
        prop: 'LastModified', order: 'descending'
      },
      routeArr: [],
      disableAclBtn: false,
      disableAcl: false,
      formAcl: {
        selectAcl: '',
        readAcl: ''
      },
      bucketOwner: '',
      total: 0,
      selected: [],
      currentPage: 1,
      pageSize: 10,
      flag: false,
      userName: '',
      userData: [],
      userGroup: [],
      listGroup: [],
      loading: false,
      VersionId: '',
      resInfo: {},
      mode: '',
      RetainUntilDate: '',
      file: {
        Owner: '',
        size: '',
        LastModified: '',
        type: ''
      },
      legalHoldRaido: 'disabled',
      legalHoldFlag: false,
      objectRentionFlag: false,
      enableRention: false,
      bucketConfig: {
        versionCtrl: false,
        objectLock: false
      },
      objectRentionForm: {
        objectRentionRaido: 'OFF',
        Mode: 'GOVERNANCE',
        RetainUntilDate: 123456789,
        timePicker: ''
      },
      disableObjectLock: false,
      form: {
        granteeTable: []
      },
      editStatus: false,
      activeName: 'property', // 默认展示属性tab
      versionTable: [],
      tableData: [],
      ruleId: [
        {
          required: true,
          message: '被授权者不能为空。请指定或删除被授权者。',
          trigger: ['blur', 'change']
        },
        {
          validator: checkValidID,
          trigger: ['blur', 'change']
        }
      ],
      disableCurrentDate: {
        disabledDate: time => {
          // 配置了到期日，模式生效，判断到期日之前时间禁用
          if (this.RetainUntilDate) {
            // 合规模式、禁用向前更改时间
            if (this.objectRentionForm.Mode === 'COMPLIANCE') {
              return (
                time.getTime() < new Date(this.RetainUntilDate).getTime() - 86400000 + 1
              )
            } else {
              return (
                time.getTime() <
                new Date(this.RetainUntilDate).getTime() - 86400000
              )
            }
          } else {
            return time.getTime() < Date.now() - 86400000
          }
        }
      },
      rules: {
        timePicker: [
          {
            validator: validateCurrentTime,
            trigger: ['blur', 'change']
          },
          {
            required: true,
            trigger: ['blur', 'change'],
            message: '请配置到期日'
          }
        ]
      }
    }
  },
  computed: {
    mapMetaInfo() {
      return Object.keys(this.metaInfo).map(x => {
        return {
          label: x,
          value: this.metaInfo[x]
        }
      })
    },
    isVersion() {
      return sessionStorage.getItem('showHistory') == 'true'
    }
  },
  watch: {
    userName(val) {
      this.userData = [...this.copy]
      if (!val) return
      this.userData = this.userData.filter(item => {
        return item.userName.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
      this.total = this.userData.length
    },
    flag(val) {
      if (val) {
        listUsers().then(res => {
          // console.log('res', res)
          res.data = res.data.filter(item => item.userName !== 'superAdmin' && item.userName !== this.bucketOwner)
          if (this.form.granteeTable && this.form.granteeTable.length) {
            this.userData = this.filterDiff(
              res.data,
              this.form.granteeTable,
              'userName'
            )
          } else {
            this.userData = res.data
          }
          this.copy = [...this.userData]
          this.total = this.userData.length
        })
      } else {
        // 去除v-model、option
        this.pageSize = 10
        this.currentPage = 1
        this.userName = ''
        this.listGroup = []
        this.userGroup = []
        this.$refs.userTable.clearSelection()
      }
    },
    objectRentionFlag(val) {
      if (!val) {
        this.getObjectRetention()
      } else {
        if (this.mode === 'COMPLIANCE') {
          this.disableMode = new Date(this.objectRentionForm.timePicker).getTime() - new Date().getTime() > 0
        }
      }
    },
    legalHoldFlag(val) {
      if (!val) {
        this.getObjectLegalHold()
      }
    }
  },
  mounted() {
    this.routeArr = []
    this.routeArr.push(this.$route.params.id)
    if (this.$route.query.filename) {
      const fileArr = this.$route.query.filename.split('/')
      this.routeArr = this.routeArr.concat(fileArr).filter(item => item)
      // routerArr面包屑导航
    }
    // console.log(this.$route, 'route')
    this.init()
    // this.$store.state.user._S3.headObject(
    //   {
    //     Bucket: this.$route.params.id,
    //     Key: this.$route.query.filename
    //   },
    //   (err, data) => {
    //     console.log(err, data, 'headObject')
    //   }
    // )
  },
  methods: {
    directoryPath(path) {
      let index = this.routeArr.findIndex(x => x === path)
      index = index > 1 ? index + 1 : 2
      var temp = [...this.routeArr].slice(1, index).join('/')
      return temp
    },
    showFileName(val) {
      val = val || ''
      const arr = String(val).split('/')
      return arr[arr.length - 1]
    },
    renderContentDisposition(data) {
      try {
        return decodeURIComponent(data && data.replace(/%(?!\d|[ABCDEF]+)/g, '%25') || '-')
      } catch (error) {
        return '-'
      }
    },
    handleClickRow(row) {
      // this.$route.query.IsLatest = row.IsLatest
      // this.$route.query.VersionId = row.VersionId
      // query重新设置、
      this.activeName = 'property'
      const params = this.$route.params
      const { type, file, filename } = this.$route.query
      this.$router.push({
        name: 'ObjectDetail',
        params,
        query: { type, IsLatest: row.IsLatest, VersionId: row.VersionId, file, filename }
      })
      this.init()
      // console.log(row, this.$route)
    },
    sortFunction(data) {
      this.versionTable.sort(this.sortMethod(data.prop, data.order))
    },
    mapVersion(row) {
      if (row.IsLatest) {
        return '(当前版本)'
      }
      // console.log(row, 'row')
      // if (row.VersionId === this.$route.query.VersionId) {
      //   return '(当前版本)'
      // } else if (!this.$route.query.VersionId && row.VersionId) {
      //   return '(当前版本)'
      // }
    },
    init() {
      this.loading = true
      const params = {
        Bucket: this.$route.params.id,
        Prefix: this.$route.query.filename || '',
        Delimiter: '/'
      }

      const p = new Promise(resolve => {
        if (this.$route.query.type === 'content') {
          this.$store.state.user._S3.listObjectsV2(params, (err, data) => {
            if (err) {
              this.showS3Msg(err)
              this.loading = false
              console.dir(err)
            } else {
              resolve(data)
            }
          })
        } else {
          this.$store.state.user._S3.listObjectVersions(params, (err, data) => {
            if (err) {
              this.showS3Msg(err)
              this.loading = false
              console.dir(err)
            } else {
              resolve(data)
            }
          })
        }
      })
      p.then(res => {
        this.resInfo = res
        // const tempArr = this.resInfo.Prefix.split('/')
        // this.resInfo.Prefix = tempArr[tempArr.length - 1]
        // console.log('admin %c resInfo', 'color:lime')
        let data
        let existETag
        // this.resInfo = JSON.parse(sessionStorage.getItem('resInfo') || null)
        if (this.$route.query.type === 'content') {
          data = this.resInfo.Contents[0]
          // console.log(data, '1233', res, '122333')
          if (!data) {
            this.$router.go(-1)
            this.$ts({
              type: 'error',
              text: '当前对象异常'
            })
          }
          this.resInfo.Prefix = data.Key
          // 开启版本 对应数据从DeleteMarkers和Versions渲染
        } else if (this.$route.query.type === 'delete') {
          data = this.resInfo.Versions[0]
          this.resInfo.Prefix = data.Key
          this.resInfo.DeleteMarkers = this.resInfo.DeleteMarkers.map(item => {
            item.Key = 'Del'
            return item
          })
          const allData = this.resInfo.Versions.concat(this.resInfo.DeleteMarkers)
          if (!this.$route.query.IsLatest || this.$route.query.IsLatest == 'false') {
            const res = allData.filter(item => {
              return item.VersionId == this.$route.query.VersionId
            })
            data = res && res.length && res[0]
          } else {
            data = allData.find(item => item.IsLatest === true) || {}
          }
          if (this.$route.query && this.$route.query.VersionId) {
            const etagExist = this.resInfo.Versions.find(x => {
              return x.VersionId === this.$route.query.VersionId
            })
            existETag = etagExist && etagExist.ETag
          }
        }
        this.tableObj = data
        // console.log(this.tableObj, 'tableObj')
        // console.log(this.resInfo, 'basicInfo', this.isVersion, 'version')
        const { Owner, Size, Key, LastModified } = data
        // console.log(Owner, Size, Key, LastModified, '123')
        const { Name, Delimiter } = this.resInfo
        this.file.Owner = (Owner && Owner.DisplayName) || ''
        this.file.LastModified = this.formatDate(new Date(LastModified))
        this.file.size = Size ? this.byteConvert(Size) : '-'
        this.file.type = Key === 'Del' ? '删除标记' : this.getFileType(Key)
        this.file.S3URL =
          's3://' + Name + Delimiter + this.$route.query.filename
        this.file.ARN =
          'arn:aws:s3:::' + Name + Delimiter + this.$route.query.filename
        this.file.URL = 's3://' + Name + Delimiter + this.$route.query.filename
        // 传递info调用接口
        this.getObjectVersions(res).then(() => {
        }).finally(() => {
          // this.loading = false
          this.getObjectMeta(existETag)
        })
        // loading
        // 对象元信息
      })
    },
    getObjectMeta(existETag) {
      getObjectMeta({
        bucketName: this.$route.params.id,
        objectKey: this.$route.query.filename
      }).then(res => {
        const {
          cacheControl,
          contentDisposition,
          contentEncoding,
          contentLanguage,
          contentMd5,
          contentType,
          userMeta,
          resourceId,
          etag,
          versionId,
          bucketName,
          objectKey,
          bottomObjectInfos
        } = res.data
        this.header = {
          cacheControl,
          contentDisposition,
          contentEncoding,
          contentLanguage,
          contentMd5,
          contentType
        }
        this.metaInfo = userMeta || {}
        this.baseInfo = {
          resourceId,
          etag: existETag || etag,
          versionId: this.$route.query.VersionId || versionId,
          bucketName,
          objectKey
        }
        // nas底层资源有多个
        // {
        // "resourceId": 2,
        // "resourceName": "nas默认资源",
        // "bottomKey": "/home/nfsServer/10000/a0/b0/140129663052808192_0_0",
        // "size": 300,
        // "coordinatorType": "SLICE"
        // }
        this.bottomObjectInfos = Array.isArray(bottomObjectInfos) ? bottomObjectInfos : bottomObjectInfos ? [bottomObjectInfos] : []
      }).catch(err => {
        // const res = {
        //   data: {
        //     bucketName: 'testBucket',
        //     cacheControl: 'no-cache',
        //     contentDisposition: 'aaa',
        //     contentEncoding: 'gzip',
        //     contentLanguage: 'de-DE',
        //     contentMd5: '666',
        //     contentType: 'application/json',
        //     etag: '24e40bbd2f6ac9a553d67929ea3add89',
        //     objectKey: '123.txt',
        //     resourceId: '1',
        //     size: 300,
        //     userMeta: {
        //       'x-amz-meta-a': 'B',
        //       'x-amz-meta-b': 'B',
        //       'x-amz-meta-c': 'B',
        //       'x-amz-meta-d': 'B',
        //       'x-amz-meta-e': 'B'
        //     },
        //     VersionId: 'null'
        //   }
        // }
        // const {
        //   cacheControl,
        //   contentDisposition,
        //   contentEncoding,
        //   contentLanguage,
        //   contentMd5,
        //   contentType,
        //   userMeta,
        //   resourceId,
        //   etag,
        //   VersionId,
        //   bucketName,
        //   objectKey
        // } = res.data
        // this.header = {
        //   cacheControl,
        //   contentDisposition,
        //   contentEncoding,
        //   contentLanguage,
        //   contentMd5,
        //   contentType
        // }
        // this.metaInfo = userMeta
        // this.baseInfo = {
        //   resourceId,
        //   etag,
        //   VersionId,
        //   bucketName,
        //   objectKey
        // }
      }).finally(() => {
        this.loading = false
      })
    },
    copyCode(str) {
      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
        this.$ts({
          type: 'success',
          text: '复制成功'
        })
        return navigator.clipboard.writeText(str)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = str
        document.body.append(textarea)
        textarea.select()
        this.$ts({
          type: 'success',
          text: '复制成功'
        })
        return new Promise((res, rej) => {
          document.execCommand('copy') ? res() : rej()
          textarea.remove()
        })
      }
    },
    // 配置依法保留
    saveObjectLegalHold() {
      // 获取当前的versionId
      this.$store.state.user._S3.putObjectLegalHold(
        {
          Bucket: this.$route.params.id,
          Key: this.resInfo.Prefix,
          VersionId: this.VersionId,
          LegalHold: {
            Status: this.legalHoldRaido
          }
        },
        (err, data) => {
          if (err) {
            this.showS3Msg(err)
            console.error(err)
          } else {
            this.legalHoldFlag = false
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
          }
        }
      )
    },
    getObjectLock() {
      this.tabLoading = true
      this.$store.state.user._S3.getObjectLockConfiguration(
        {
          Bucket: this.$route.params.id
        },
        (err, data) => {
          if (err) {
            this.tabLoading = false
            this.showS3Msg(err)
            console.error(err)
          } else {
            // 启用对象锁定获取依法保留等配置
            if (
              data.ObjectLockConfiguration &&
              data.ObjectLockConfiguration.ObjectLockEnabled === 'Enabled'
            ) {
              this.getObjectLegalHold()
              this.getObjectRetention()
              setTimeout(() => {
                this.tabLoading = false
              }, 50)
              // console.log(data, 'getObjectLock')
              this.bucketConfig.objectLock = true
            } else {
              this.tabLoading = false
              this.bucketConfig.objectLock = false
              // 隐藏配置legalHod和Rention
            }
          }
        }
      )
    },
    getObjectLegalHold() {
      this.legalHoldLoading = true
      this.$store.state.user._S3.getObjectLegalHold(
        {
          Bucket: this.$route.params.id,
          Key: this.resInfo.Prefix,
          VersionId: this.VersionId
        },
        (err, data) => {
          if (err) {
            this.enableRention = ''
            this.legalHoldRaido = 'OFF'
            this.showS3Msg(err)
            this.legalHoldLoading = false
            console.error(err, 'getObjectLegalHold')
          } else {
            this.enableRention = data.LegalHold.Status === 'ON'
            this.legalHoldRaido = this.enableRention ? 'ON' : 'OFF'
            this.legalHoldLoading = false
            console.log(data, 'getObjectLegalHold')
          }
        }
      )
    },
    saveObjectRention() {
      this.$refs['objectRentionForm'].validate(valid => {
        if (valid) {
          // 未设置对象锁定配置 再点击报错 规避此问题
          if (!this.mode && this.objectRentionForm.objectRentionRaido === 'OFF') {
            this.objectRentionFlag = false
            this.$store.state.user._S3.putObjectRetention(
              {
                Bucket: this.$route.params.id,
                Key: this.resInfo.Prefix,
                VersionId: this.VersionId,
                Retention: {}
              },
              (err, data) => {
                if (err) {
                  this.showS3Msg(err)
                  // this.objectRentionFlag = false
                  console.error(err)
                } else {
                  this.objectRentionFlag = false
                  this.$ts({
                    type: 'success',
                    text: this.$ts('response.success')
                  })
                }
              }
            )
            return
          }
          let Retention = {}
          if (this.objectRentionForm.objectRentionRaido !== 'OFF') {
            Retention = {
              Mode: this.objectRentionForm.Mode,
              RetainUntilDate: this.objectRentionForm.timePicker
            }
          }
          // console.log({
          //   Bucket: this.$route.params.id,
          //   Key: this.resInfo.Delimiter + this.resInfo.Prefix + '',
          //   VersionId: this.VersionId,
          //   Retention
          // }, 'req')
          this.$store.state.user._S3.putObjectRetention(
            {
              Bucket: this.$route.params.id,
              Key: this.resInfo.Prefix,
              VersionId: this.VersionId,
              BypassGovernanceRetention: true,
              Retention
            },
            (err, data) => {
              if (err) {
                this.showS3Msg(err)
                // this.objectRentionFlag = false
                console.error(err)
              } else {
                this.objectRentionFlag = false
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                console.log(data, 'putobjectRention')
              }
            }
          )
        }
      })
    },
    getObjectRetention() {
      this.objectRetentionFlag = true
      this.disableObjectLock = false
      this.$store.state.user._S3.getObjectRetention(
        {
          Bucket: this.$route.params.id,
          Key: this.resInfo.Prefix,
          VersionId: this.VersionId
        },
        (err, data) => {
          if (err) {
            if (!err.code === 'NoSuchObjectLockConfiguration') {
              this.objectRentionForm.objectRentionRaido = 'OFF'
              this.objectRentionForm.Mode = 'GOVERNANCE'
              this.objectRentionForm.timePicker = ''
              this.disableObjectLock = false
              this.showS3Msg(err)
            }
            this.objectRetentionFlag = false
            this.mode = ''
            Object.assign(this.objectRentionForm, {
              objectRentionRaido: 'OFF',
              Mode: 'GOVERNANCE',
              RetainUntilDate: '',
              timePicker: ''
            })
            // console.dir(err, '123')
            console.error(err, 'getObjectRetention')
          } else {
            this.objectRetentionFlag = false
            console.log(data, 'getObjectRetention')
            this.mode = data.Retention.Mode || ''
            this.RetainUntilDate = this.formatDate(
              data.Retention.RetainUntilDate
            )
            if (data.Retention.Mode === 'COMPLIANCE') {
              this.disableObjectLock = true
              this.disableMode = new Date(data.Retention.RetainUntilDate).getTime() - new Date().getTime() > 0
            } else {
              this.disableMode = false
            }
            // 监管模式或者合规模式生效、添加禁用操作
            this.objectRentionForm.Mode = this.mode
            this.objectRentionForm.objectRentionRaido = this.mode
              ? 'ON'
              : 'OFF'
            this.objectRentionForm.timePicker = data.Retention.RetainUntilDate
          }
        }
      )
    },
    saveConfig() {
      const permission = ['READ', 'READ_ACP', 'WRITE', 'WRITE_ACP']
      const Grants = []
      for (let i = 0; i < this.form.granteeTable.length; i++) {
        for (let j = 0; j < permission.length; j++) {
          if (this.form.granteeTable[i][permission[j]]) {
            // 若都勾选、则full-ctrl、故第一次满足条件时就对剩余做判断是否有权限、有就break
            if (j !== 0) {
              Grants.push({
                Grantee: {
                  Type: 'CanonicalUser',
                  DisplayName: this.form.granteeTable[i].userName
                },
                Permission: permission[j]
              })
            } else {
              const rest = ['READ_ACP', 'WRITE', 'WRITE_ACP']
              let flag = 0
              const temp = [
                {
                  Grantee: {
                    Type: 'CanonicalUser',
                    DisplayName: this.form.granteeTable[i].userName
                  },
                  Permission: 'READ'
                }
              ]
              for (let k = 0; k < rest.length; k++) {
                if (this.form.granteeTable[i][rest[k]]) {
                  temp.push({
                    Grantee: {
                      Type: 'CanonicalUser',
                      DisplayName: this.form.granteeTable[i].userName
                    },
                    Permission: rest[k]
                  })
                  flag++
                }
              }
              if (flag == 3) {
                Grants.push({
                  Grantee: {
                    Type: 'CanonicalUser',
                    DisplayName: this.form.granteeTable[i].userName
                  },
                  Permission: 'FULL_CONTROL'
                })
              } else {
                Grants.push(...temp)
              }
              break
            }
          }
        }
      }
      this.$store.state.user._S3.putObjectAcl(
        {
          Bucket: this.$route.params.id,
          ACL: this.formAcl.selectAcl,
          Key: this.$route.query.filename,
          VersionId: this.VersionId,
          AccessControlPolicy: {
            Grants
          }
        },
        (err, data) => {
          if (err) {
            this.showS3Msg(err)
            console.error(err)
          } else {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.editStatus = false
            this.getObjectAcl()
            console.log(data, 'data')
          }
        }
      )
    },
    handleClick() {
      // getObjectAcl
      if (this.activeName === 'permission') {
        //  版本非版本统一api
        this.getObjectAcl()
      } else if (this.activeName === 'lock') {
        this.getObjectLock()
      } else {
        this.editStatus = false
      }
    },
    getObjectAcl() {
      // console.log({
      //   Key: this.$route.query.filename,
      //   Bucket: this.$route.params.id,
      //   VersionId: this.VersionId
      // });
      this.tabLoading = true
      this.form.granteeTable = []
      this.$store.state.user._S3.getObjectAcl(
        {
          Key: this.$route.query.filename,
          Bucket: this.$route.params.id,
          VersionId: this.VersionId
        },
        (err, data) => {
          if (err) {
            this.showS3Msg(err)
            if (err.code === 'NoSuchKey') {
              this.disableAcl = true
            }
            if (err.code === 'SignatureDoesNotMatch') {
              this.disableAclBtn = true
            }
            this.tabLoading = false
            console.error(err)
          } else {
            // console.log(data, 'getObjectAcl')
            this.bucketOwner = data.Owner.DisplayName
            const temp = data.Grants.filter(item => {
              return (
                item.Grantee.Type === 'CanonicalUser'
                // &&
                // item.Grantee.DisplayName !== data.Owner.DisplayName
              )
            })
            const arr = []
            const obj = {}
            for (let i = 0; i < temp.length; i++) {
              // 过滤group及所有人
              if (temp[i].Grantee.ID && !obj[temp[i].Grantee.ID]) {
                obj[temp[i].Grantee.ID] = true
                arr.push({
                  userName: temp[i].Grantee.ID,
                  permission: [temp[i].Permission]
                })
              } else if (temp[i].Grantee.ID) {
                const index = arr.findIndex(
                  item => item.userName == temp[i].Grantee.ID
                )
                arr[index].permission.push(temp[i].Permission)
              }
            }

            // 处理私有、公共读、写、认证读展示
            const group = data.Grants.filter(
              item => item.Grantee.Type == 'Group'
            )
            // group暂时返回一个
            // 根据url区分公共读、写与认证读
            if (group && group.length) {
              const { URI } = group[0].Grantee
              if (URI === 'http://acs.amazonaws.com/groups/global/AllUsers') {
                const Permission = group[0].Permission
                if (Permission === 'READ') {
                  this.formAcl.readAcl = '公共读'
                  this.formAcl.selectAcl = 'public-read'
                } else if (Permission === 'WRITE') {
                  this.formAcl.readAcl = '公共读写'
                  this.formAcl.selectAcl = 'public-read-write'
                }
              } else if (
                URI ===
                'http://acs.amazonaws.com/groups/global/AuthenticatedUsers'
              ) {
                this.formAcl.readAcl = '认证读'
                this.formAcl.selectAcl = 'authenticated-read'
              }
            } else {
              this.formAcl.readAcl = '私有'
              this.formAcl.selectAcl = 'private'
            }
            // 处理同一用户多个权限、将通过前面的permission数组添加对应的数据
            // console.log(arr, '12333')
            for (let i = 0; i < arr.length; i++) {
              for (let j = 0; j < arr[i].permission.length; j++) {
                if (arr[i]['permission'][0] === 'FULL_CONTROL') {
                  arr[i]['READ'] = true
                  // arr[i]['WRITE'] = true
                  arr[i]['READ_ACP'] = true
                  arr[i]['WRITE_ACP'] = true
                  arr[i]['owner'] = true
                  break
                }
                arr[i][arr[i]['permission'][j]] = true
              }
            }
            this.tableData = [...arr]
            this.tabLoading = false
            this.disableAcl = false
          }
        }
      )
    },
    getObjectVersions() {
      return new Promise((resolve, reject) => {
        this.versionTable = []
        this.$store.state.user._S3.listObjectVersions(
          {
            Bucket: this.$route.params.id,
            Prefix: this.$route.query.filename
          },
          (err, data) => {
            if (err) {
              reject('fail')
              this.showS3Msg(err)
              console.error(err)
            } else {
              resolve('finish')
              const delMarkers = data.DeleteMarkers.map(item => {
                item.delMarker = true
                return item
              })
              // console.log(data.DeleteMarkers, 'delMarkers')
              // 要过滤prefix相同、故key值完全匹配
              const allData = delMarkers.concat(data.Versions)
                .filter(item => item.Key === this.$route.query.filename)
              const res = allData.filter(item => {
                // 匹配版本Id
                if (this.$route.query && this.$route.query.VersionId) {
                  return item.VersionId == this.$route.query.VersionId
                } else {
                  // console.log('latest')
                  // 无id 匹配最新版本IsLatest 并且匹配fileName
                  return (
                    this.$route.query.filename == item.Key && item.IsLatest
                  )
                }
              })
              // 若无版本控制只匹配单一文件
              if (this.$route.query && !this.$route.query.VersionId) {
                this.versionTable.push(...res)
              } else {
                this.versionTable.push(...allData)
              }
              this.VersionId = res[0].VersionId
              this.versionTable.sort(this.sortMethod(this.defaultSort.prop, this.defaultSort.order))
              // console.log(res, this.versionTable, '123')
            }
          }
        )
      })
    },
    transClass(val) {
      switch (val) {
        case 'STANDARD':
          return '标准'
        default:
          break
      }
    },
    bucketMap(val) {
      if (val.READ_ACP && val.WRITE_ACP) {
        return '读写ACL'
      } else if (val.READ_ACP) {
        return '读ACL'
      } else if (val.WRITE_ACP) {
        return '写ACL'
      } else {
        return ''
      }
    },
    objectMap(val) {
      if (val.READ && val.WRITE) {
        return '读写'
      } else if (val.WRITE) {
        return '写'
      } else if (val.READ) {
        return '读'
      } else {
        return '/'
      }
    },
    editConfig() {
      this.editStatus = true
      this.form.granteeTable = [...this.tableData]
    },
    addAccount() {
      // this.form.granteeTable.push({})
      for (let i = 0; i < this.selected.length; i++) {
        this.form.granteeTable.push({
          userName: this.selected[i].userName
        })
      }
      this.flag = false
    },
    // 对象操作
    handleStatus(command) {
      switch (command) {
        case 'download':
          // console.log('下载为')
          break
        case 'move':
          // console.log('移动')
          break
      }
    },
    handleScroll(ref) {
      this.$refs[ref].$el.scrollTop = 0
    },
    changeSelect(val) {
      // console.log(val, 'val')
      const restGroup = this.userGroup.map(item => {
        return {
          userName: item
        }
      })
      const users = this.filterDiff(this.selected, restGroup, 'userName') // 切换表格勾选数据
      // console.log(users, 'users')
      users.forEach(item => {
        this.$refs.userTable.toggleRowSelection(item)
      })
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handleSelectionChange(val) {
      // console.log(val, 'val')
      this.selected = val
      this.listGroup = [...val]
      this.userGroup = this.listGroup.map(item => item.userName)
      // this.userGroup = [...val]
    }
  }
}
</script>
<style scoped lang="scss">
::v-deep .clearfix {
  margin-bottom: 20px;
  .el-select {
    float: left;
    .el-select__tags-text {
      color: #e39606;
    }
    .el-icon-close {
      background-color: #909399;
      &:hover {
        background-color: #ff8746;
      }
    }
  }

  .ipt {
    float: right;
  }
}

.fa:hover::after {
  display: none;
}

.mb_15 {
  p {
    color: #d3d6d8;
    font-size: 15px;
  }

  div {
    color: #d3d6d8;
    margin-top: 5px;
    font-size: 13px;
  }
}

.fa {
  margin: 0 10px;
}

.topMenu {
  margin-bottom: 30px;
  h2 {
    font-size: 26px;
    width: 50%;
    display: flex;
    align-items: center;
  }
}

.titleh1 {
  font-size: 18px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  color: #d3d6d8;
}

.reverseColumn {
  .el-checkbox,
  .el-radio {
    margin-bottom: 10px;
  }
}

.bottomMenu {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.addOtherAccount {
  margin: 20px;

  h3 {
    margin-bottom: 20px;
  }
}

.headFlex {
  display: flex;
  h3 {
    width: 50%;
  }
}
.configList {
  .content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    .contentL {
      display: flex;
      width: 100%;
      margin-right: 20px;
      flex-wrap: wrap;
      p {
        width: 200px;
        border-right: 1px solid #4d5d64;
      }
    }
    .headContainer {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      p {
        min-width: 170px;
        width: 10%;
        border-right: 1px solid #4d5d64;
      }
    }
    .layout_meta {
      display: flex;
      flex-wrap: wrap;
      p {
        border-right: 1px solid #4d5d64;
        width: 200px;
      }
    }
    .contentR {
      flex: 1;
    }

    p {
      line-height: 20px;
      display: flex;
      flex-direction: column;
      margin: 15px 10px;
      padding: 0 10px;
      color: #d3d6d8;
      box-sizing: border-box;
      font-size: 14px;
      font-weight: bold;
      & > span {
        font-weight: normal;
        margin-top: 10px;
        color: #d3d6d8;
        max-width: 500px;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
}

::v-deep .bucket-detail {
  .el-tabs__header {
    background: unset !important;
  }

  .el-tabs__item {
    background: unset !important;
  }

  .el-tabs__content {
    background: unset !important;
  }
}
// 前端怎么让内容的高度和div的高度自适应
.bdetail_header {
  margin: 10px 0;
  line-height: 50px;
  height: auto !important;

  span {
    color: #d3d6d8;

    a {
      color: #ff8746;
    }
  }

  // border-bottom: 1px solid #ddd;
}

.bdetail_title {
  font-size: 14px;
  display: inline-block;
  color: #444;
  line-height: 50px;
  margin-right: 10px;
  vertical-align: middle;
  text-decoration: none;
  font-weight: 700;
}
:deep(.tooltip-container) {
  width: fit-content !important;
  max-width: 100% !important;
}
</style>
