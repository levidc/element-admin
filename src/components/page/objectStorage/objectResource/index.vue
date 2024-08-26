<template>
  <div>
    <div class="page_content_wrap">
      <el-button
        v-access="'admin:AddStorageDeviceController'"
        class="blue mr_10"
        :disabled="loading||innerFormLoading"
        @click="showCreate('device')"
      >创建设备</el-button>
      <el-button
        v-access="'admin:AddStorageResourceController'"
        class="golden mr_10"
        type="primary"
        :disabled="loading||innerFormLoading"
        @click="showCreate('object')"
      >创建资源</el-button>
      <div class="right">
        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            class="el-icon-refresh"
            @click="filterText='';getCurrentRefresh()"
          />
        </el-tooltip>
      </div>
    </div>
    <div class="treeContent">
      <div class="tree">
        <el-input
          v-model="filterText"
          placeholder="设备或资源名过滤"
          class="mb_10"
          clearable
        />
        <div
          v-loading="loading"
          class="stauts"
        >
          <el-tree
            v-if="!loading"
            ref="tree"
            :data="tableData"
            node-key="id"
            :props="treeOpt"
            default-expand-all
            icon-class="none"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            highlight-current
            @node-click="getInfo"
          >
            <span
              slot-scope="{ node, data }"
              class="custom-tree-node"
            >
              <span v-if="data.storageName">
                <span class="resourceContainer">
                  <span class="resourcename">
                    <el-tag style="margin-right:5px;">{{ data.storageType === 'IAM'?'AWS':data.storageType }}</el-tag>
                    <showToolTip
                      :text="node.label"
                      width="60%"
                    />
                  </span>
                  <div>
                    <!-- <svg
                      class="icon"
                      aria-hidden="true"
                      style="position:relative;top:5px;font-size:26px;"
                    >
                      <use :xlink:href="renderLoadGroupStatus(data.resourceStatus)" />
                    </svg> -->
                    <el-tag v-if="data.storageUseType!=='CACHE'&&stringToBoolean(data.default)">ACTIVE</el-tag>
                    <el-tag v-if="data.storageUseType!=='CACHE'&&stringToBoolean(data.next)">STANDBY</el-tag>
                    <el-tag v-if="data.storageType === 'NAS'">{{ data.storageUseType==='CACHE'?'缓存':data.storageUseType==='DEFAULT'?'直接存储':'' }}</el-tag>
                  </div>
                </span>
              </span>
              <span v-else-if="data.deviceName">
                <span class="deviceContainer">
                  <span class="deviceIcon">
                    <svg
                      class="icon"
                      aria-hidden="true"
                    >
                      <use xlink:href="#icon-device" />
                    </svg>
                    <showToolTip
                      :text="data.deviceName"
                      width="60%"
                    />
                  </span>
                  <div>
                    <el-tag v-if="stringToBoolean(data.default)">ACTIVE</el-tag>
                  </div>
                </span>
              </span>
            </span>
          </el-tree>
        </div>
      </div>
      <div
        v-loading="loading||innerFormLoading"
        class="content"
      >
        <div
          v-show="showDescDevice == 'device'&&!innerFormLoading"
          class="expandDeviceForm"
        >
          <el-form
            label-position="left"
            inline
          >
            <el-row>
              <el-col :span="12">
                <el-form-item label="设备名称">
                  <span>{{ fillDeviceForm.deviceName }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否默认设备">
                  <span
                    v-if="fillDeviceForm.isDefault"
                    class="green"
                  >是</span>
                  <span v-else>否</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <div class="btn">
                <el-button
                  v-if="deviceForm.storageResourceModelList && deviceForm.storageResourceModelList.length"
                  v-access="'admin:GetDefaultNextResourceController'"
                  class="blue"
                  @click="handleDefNextFlag(fillDeviceForm)"
                >关联资源配置</el-button>
                <el-button
                  v-access="'admin:UpdateStorageDeviceController'"
                  class="blue"
                  @click="updateDevice(fillDeviceForm, true)"
                >{{ $ts('modify') }}</el-button>
                <el-button
                  v-access="'admin:DeleteStorageDeviceController'"
                  type="danger"
                  class="red"
                  @click="handleDel('device', { row: fillDeviceForm })"
                >{{ $ts('delete') }}</el-button>
              </div>
            </el-row>
          </el-form>
        </div>
        <div
          v-show="showDescDevice == 'object'&&!innerFormLoading"
          class="expandDeviceForm"
        >
          <el-form
            label-position="left"
            inline
          >
            <el-row>
              <el-col :span="12">
                <el-form-item label="资源名称">
                  <span>{{ fillSourceForm.storageName }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="地址">
                  <span>{{ fillSourceForm.url || '-' }}</span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="存储热度">
                  <span>{{ fillSourceForm.storageType ==='IAM'?'AWS': mapStorageType(fillSourceForm.storageType) }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  v-if="fillSourceForm.storageType !== 'NAS'"
                  label="签名类型"
                >
                  <span>{{ fillSourceForm.signatureType ==='AWS2'?'V2':'V4' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  v-if="fillSourceForm.storageType === 'S3'||fillSourceForm.storageType==='GLACIER'||fillSourceForm.storageType === 'WARM'"
                  label="用户名"
                >
                  <span>{{ fillSourceForm.userName || '-' }}</span>
                </el-form-item>
                <el-form-item
                  v-if="fillSourceForm.storageType === 'IAM'"
                  label="区域"
                >
                  <span>{{ transRegion(fillSourceForm.region) }}</span>
                </el-form-item>
                <el-form-item
                  v-if="fillSourceForm.storageType === 'NAS'"
                  label="存储用途"
                >
                  <span>{{ fillSourceForm.storageUseType === 'CACHE' ? '缓存' : '直接存储' }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="fillSourceForm.storageType === 'NAS' || fillSourceForm.storageType === 'CACHE'">
              <el-col :span="12">
                <el-form-item label="单个对象最大容量(MB)">
                  <span>{{ fillSourceForm.extendInfo?.maxObjectSize || '-' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="目录最大深度">
                  <span>{{ fillSourceForm.extendInfo?.dirMaxDepth || '-' }}</span>
                </el-form-item>
              </el-col>
              <!--  -->
              <el-col :span="12">
                <el-form-item label="最大子目录数">
                  <span>{{ fillSourceForm.extendInfo?.dirMaxSubDir || '-' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="单目录存储最大文件数">
                  <span>{{ fillSourceForm.extendInfo?.dirMaxFile || '-' }}</span>
                </el-form-item>
              </el-col>
              <!-- <el-col :span="12">
                <el-form-item label="连接底层资源超时时间(ms)">
                  <span>{{ fillSourceForm.param?.connectionTimeoutTime || '-' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否同步">
                  <span>{{ fillSourceForm.param?.sync ? '是':'否' }}</span>
                </el-form-item>
              </el-col> -->
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="标签名">
                  <span>{{ fillSourceForm.sign }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="fillSourceForm.storageType !== 'NAS' && fillSourceForm.storageType !== 'CACHE' ? '存储桶名' : '共享目录'">
                  <span>{{ fillSourceForm.bucketName }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="fillSourceForm.storageUseType!=='CACHE'">
              <el-col :span="12">
                <el-form-item label="默认资源">
                  <span
                    v-if="fillSourceForm.default"
                    class="green"
                  > 是</span>
                  <span v-else> 否 </span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="下一个资源">
                  <span
                    v-if="fillSourceForm.next"
                    class="green"
                  > 是 </span>
                  <span v-else> 否 </span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="对象数量上限">
                  <span v-if="fillSourceForm.objectCount">{{ fillSourceForm.objectCount == -1 ? '无限制' : handleDemi('','',fillSourceForm.objectCount)
                  }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="对象容量上限">
                  <span>{{ fillSourceForm.objectSize == -1 ? '无限制' : fillSourceForm.objectSize + '' + fillSourceForm.unit }}</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="对象已用数量">
                  <span v-if="fillSourceForm.usedCount">{{ handleDemi('', '', fillSourceForm.usedCount) }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="对象已用容量">
                  <span>{{ byteConvert(fillSourceForm.usedSpace) }}</span>
                  <span
                    v-for="(item,i) in renderUtilityRatio(fillSourceForm) "
                    :key="i"
                    :style="{color:item.color}"
                  >
                    {{ item.val }}
                  </span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-table
                  :data="fillSourceForm.gateway"
                  style="width: 90%;"
                >
                  <el-table-column prop="gatewayAddress" />
                  <el-table-column
                    prop="gatewayStatus"
                    label="服务状态"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <span
                        v-if="scope.row.gatewayStatus"
                        class="green"
                      >正常</span>
                      <span
                        v-else
                        class="red"
                      >异常</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="resourceStatus"
                    label="资源连接状态"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <span
                        v-if="scope.row.resourceStatus === 'OK'"
                        class="green"
                      >
                        {{ storageTypeEnu[scope.row.resourceStatus] }}
                      </span>
                      <span
                        v-else-if="storageTypeEnu[scope.row.resourceStatus]"
                        class="red"
                      >
                        {{ storageTypeEnu[scope.row.resourceStatus] }}
                      </span>
                      <span
                        v-else
                        class="red"
                      >
                        <span
                          class="red"
                          type="text"
                        >
                          资源异常
                        </span>
                        <el-popover
                          popper-class="text-wrap"
                          placement="top-start"
                          title="异常详情"
                          trigger="hover"
                          :content="String(scope.row.resourceStatus).trim()"
                        >
                          <i
                            slot="reference"
                            class="fa fa-question-circle"
                          />
                        </el-popover>
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
            <div class="btn">
              <el-button
                v-access="'admin:UpdateStorageResourceController'"
                class="blue"
                @click="updateForm(fillSourceForm, true)"
              >{{
                $ts('modify') }}</el-button>
              <el-button
                v-access="'admin:DeleteStorageDeviceController'"
                type="danger"
                class="red"
                @click="handleDel('object', { row: fillSourceForm })"
              >{{ $ts('delete') }}</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
    <el-dialog
      :visible.sync="modelFormFlag"
      width="60%"
      :title="isAdd ? '创建存储资源' : '修改存储资源'"
      custom-class="formDialog"
      @open="dialogOpen('tableFocus')"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="160px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              prop="storageName"
              label="资源名称"
            >
              <el-input
                ref="tableFocus"
                v-model.trim="form.storageName"
                placeholder="请输入2-64位英文、中文、数字、'_-.'"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              prop="storageType"
              label="存储热度"
            >
              <el-select
                v-model="form.storageType"
                style="width:100%"
                :disabled="!isAdd"
                @change="validateUrl"
              >
                <el-option
                  v-for="item in enumStorageType"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </el-select>
              <!-- <el-button
                v-if="form.storageType === 'NAS' || form.storageType==='CACHE'"
                type="text"
                class="nasAdvancedConfigBtn"
                @click="form.nasAdvancedConfig = !form.nasAdvancedConfig"
              >
                <span>高级配置</span>
                <i v-if="form.nasAdvancedConfig" class="el-icon-caret-top" style="font-size: 20px;margin-left: 5px!important;color:#ff8746" />
                <i v-else class="el-icon-caret-bottom" style="font-size: 20px;margin-left: 5px!important;color:#ff8746" />
              </el-button> -->
            </el-form-item>
          </el-col>
        </el-row>
        <el-row
          v-if="form.storageType === 'NAS' || form.storageType === 'CACHE'"
          class="extendInfo"
        >
          <el-form-item
            label="高级配置"
            style="margin-bottom: 0px;"
          >
            <span slot="label">
              <span style="color:#ff8746">
                高级配置
              </span>
            </span>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="单个对象最大容量"
                prop="extendInfo.maxObjectSize"
              >
                <el-input
                  v-model="form.extendInfo.maxObjectSize"
                  style="vertical-align: middle;"
                  placeholder="请输入1-64的正整数"
                  :disabled="!isAdd"
                  clearable
                  @input="val => inputPositiveNum(val, 'extendInfo.maxObjectSize', 64)"
                >
                  <span slot="append">
                    MB
                  </span>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="目录最大深度"
                prop="extendInfo.dirMaxDepth"
              >
                <el-input
                  v-model="form.extendInfo.dirMaxDepth"
                  placeholder="请输入1-2的正整数"
                  :disabled="!isAdd"
                  clearable
                  @input="val => inputPositiveNum(val, 'extendInfo.dirMaxDepth', 2)"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="最大子目录数"
                prop="extendInfo.dirMaxSubDir"
              >
                <el-input
                  v-model="form.extendInfo.dirMaxSubDir"
                  placeholder="请输入1-20的正整数"
                  :disabled="!isAdd"
                  clearable
                  @input="val => inputPositiveNum(val, 'extendInfo.dirMaxSubDir', 20)"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="单目录存储最大文件数"
                prop="extendInfo.dirMaxFile"
              >
                <el-input
                  v-model="form.extendInfo.dirMaxFile"
                  placeholder="请输入1-10000的正整数"
                  :disabled="!isAdd"
                  clearable
                  @input="val => inputPositiveNum(val, 'extendInfo.dirMaxFile', 10000)"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              v-if="form.storageType === 'NAS'"
              prop="storageUseType"
              label="存储用途"
            >
              <el-radio-group
                v-model="form.storageUseType"
                :disabled="!isAdd"
                @change="handleNextResource"
              >
                <el-radio label="DEFAULT">直接存储</el-radio>
                <el-radio label="CACHE">缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.storageType !== 'IAM'"
              prop="url"
              label="地址"
            >
              <el-input
                v-model.trim="form.url"
                placeholder="请输入2-64字符"
                clearable
              >
                <template
                  v-if="judgeS3Type"
                  slot="prepend"
                >http://</template>
              </el-input>
            </el-form-item>
            <el-form-item
              v-else-if="form.storageType==='IAM'"
              prop="region"
              label="区域"
            >
              <el-select v-model="form.region">
                <el-option
                  v-for="item in regions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col
            v-if="form.storageType !== 'NAS'"
            :span="12"
          >
            <el-form-item
              prop="signatureType"
              label="签名类型"
            >
              <el-select
                v-model="form.signatureType"
                placeholder="请选择签名类型"
              >
                <el-option
                  v-for="item in emuSignatureType"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.storageType !== 'IAM'">
          <el-col :span="12">
            <el-form-item
              v-if="form.storageType === 'S3'||form.storageType==='GLACIER'||form.storageType === 'WARM'"
              prop="userName"
              label="用户名"
            >
              <el-input
                v-model.trim="form.userName"
                placeholder="请输入2-64字符"
                clearable
                auto-complete="new-password"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.storageType === 'S3'||form.storageType==='GLACIER'||form.storageType === 'WARM'"
              prop="password"
              label="密码"
            >
              <el-input
                v-model.trim="form.password"
                type="password"
                placeholder="请输入2-64字符"
                clearable
                auto-complete="new-password"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              prop="sign"
              label="标签"
            >
              <el-input
                v-model.trim="form.sign"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 4 }"
                clearable
                :disabled="!isAdd"
                placeholder="请输入2-256字符"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="form.storageType === 'NAS' || form.storageType === 'CACHE'"
              prop="mountDir"
              label="共享目录"
            >
              <el-input
                v-model="form.mountDir"
                placeholder="请输入共享目录"
                :disabled="!isAdd"
              />
            </el-form-item>
            <el-form-item
              v-else
              prop="bucketName"
              label="存储桶名"
            >
              <el-popover
                placement="top"
                width="350"
                trigger="hover"
                style="position:absolute;"
              >
                <p style="line-height:1.6;">名称只能由小写字母、数字、点 (.) 和连字符 (-) 组成。</p>
                <p style="line-height:1.6;">名称需以数字字母开头结尾</p>
                <p style="line-height:1.6;">名称不能包含两个相邻的句点(.)</p>
                <p style="line-height:1.6;">不能以'xn--'开头和以-s3alias结尾</p>
                <p style="line-height:1.6;">存储桶名称不能与 IP 地址相似</p>
                <p style="line-height:1.6;">名称长度为3-63位字符</p>
                <i
                  slot="reference"
                  class="fa fa-question-circle"
                  style="margin-left: -32px !important;"
                />
              </el-popover>
              <el-input
                v-model.trim="form.bucketName"
                placeholder="请输入合法的存储桶名"
                :disabled="!isAdd"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <!-- 对象数量和容量需要能设置不限制 -->
            <el-form-item
              prop="objectCount"
              label="对象数量上限"
            >
              <QuickDefault
                v-model="form.objectCount"
                :default-value="-1"
                vertical
                class="quick-default-style"
                label-of-default="无限制"
                label-of-value="限制"
              >
                <template #default="{ data, onChange: onObjectCount }">
                  <el-input
                    v-model="data.value"
                    placeholder="请输入正整数"
                    clearable
                    @blur="onObjectCount()"
                    @input="val => inputPositiveNum(val, 'objectCount')"
                  />
                </template>
              </QuickDefault>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              prop="objectSize"
              label="对象容量上限"
            >
              <QuickDefault
                v-model="form.objectSize"
                :default-value="-1"
                vertical
                class="quick-default-style"
                label-of-default="无限制"
                label-of-value="限制"
              >
                <template #default="{ data, onChange: onObjectSize }">
                  <el-input
                    v-model="data.value"
                    clearable
                    :placeholder="placeholderValue"
                    @blur="onObjectSize()"
                    @input="val => inputPositiveNum(val, 'objectSize')"
                  >
                    <el-select
                      slot="append"
                      v-model="form.unit"
                      style="width: 85px"
                      @change="changelogicUnit"
                    >
                      <el-option
                        v-for="item in sizeSelect"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-input>
                </template>
              </QuickDefault>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item
              prop="deviceId"
              label="设备"
            >
              <el-select
                v-model="form.deviceId"
                filterable
                clearable
                :disabled="!isAdd"
                placeholder="请输入资源名或选择资源"
                @change="judgeValidNext"
              >
                <el-option
                  v-for="item in deviceSelectOpt"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                  clearable
                />
              </el-select>
            </el-form-item>
          </el-col>
          <!-- 编辑展示默认资源 -->
          <el-col
            v-if="!isAdd&&form.storageUseType!=='CACHE'"
            :span="12"
          >
            <el-form-item
              prop="defaultV"
              label="默认资源"
            >
              <span
                v-if="form.defaultV"
                style="color: #ff8746;"
              >是</span>
              <span v-else>否</span>
            </el-form-item>
          </el-col>
          <el-col
            v-if="isAdd&&form.storageUseType!=='CACHE'"
            :span="12"
          >
            <el-form-item
              prop="next"
              label="下一个资源"
            >
              <el-popover
                placement="top"
                width="250"
                trigger="hover"
                style="position:absolute;"
              >
                <p>设备下只能配置一个资源为下一个资源</p>
                <i
                  slot="reference"
                  class="fa fa-question-circle"
                  style="margin-left: -32px !important;"
                />
              </el-popover>
              <el-switch
                v-model="form.next"
                active-text="是"
                inactive-text="否"
                :disabled="form.storageUseType === 'CACHE'||deviceExistNextConifg"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 设备只有一个下一个资源、切换设备判断是否可启用/ -->
        <el-row v-if="!isAdd&&form.storageUseType!=='CACHE'">
          <el-col :span="12">
            <el-form-item
              prop="next"
              label="下一个资源"
            >
              <el-popover
                placement="top"
                width="250"
                trigger="hover"
                style="position:absolute;"
              >
                <p>默认资源和下一个资源不能同时设置在同一个资源中</p>
                <i
                  slot="reference"
                  class="fa fa-question-circle"
                  style="margin-left: -32px !important;"
                />
              </el-popover>
              <el-switch
                v-model="form.next"
                active-text="是"
                inactive-text="否"
                :disabled="form.defaultV || form.storageUseType==='CACHE'"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="blue"
          @click="modelFormFlag = false"
        >{{ $ts('button.cancel') }}</el-button>
        <el-button
          class="golden"
          type="primary"
          @click="confirmCreate"
        >{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="renderDel ? '删除存储资源' : '删除存储设备'"
      :visible.sync="deleteFlag"
      width="650px"
    >
      <p>{{ renderDel ? `删除如下存储资源:${selectRow.storageName}` : `删除如下存储设备: ${selectRow.deviceName}` }}
      </p>
      <div slot="footer">
        <el-button
          class="blue"
          @click="deleteFlag = false"
        >{{ $ts('cancel') }}</el-button>
        <el-button
          type="primary"
          class="golden"
          @click="deleteForm"
        >{{ $ts('delete') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="deviceDialog"
      width="35%"
      :title="isAddDevice ? '创建存储设备' : '修改存储设备'"
    >
      <el-form
        ref="Dform"
        :model="deviceForm"
        label-width="180px"
        :rules="dRules"
      >
        <el-form-item
          label="设备名称"
          prop="deviceName"
        >
          <el-input
            v-model="deviceForm.deviceName"
            placeholder="请输入2-40位英文、中文、数字、'_-.'"
            :disabled="!isAddDevice"
          />
        </el-form-item>
        <el-form-item
          label="是否默认设备"
          prop="isDefault"
        >
          <el-switch
            v-model="deviceForm.isDefault"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          class="blue"
          @click="deviceDialog = false"
        >{{ $ts('cancel') }}</el-button>
        <el-button
          class="golden"
          @click="createDevice"
        >{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      class="defNextFormDialog"
      :visible.sync="defNextFlag"
      width="45%"
      title="设备关联资源配置"
    >
      <el-input
        v-model="defNextForm.search"
        style="width:50%"
        placeholder="关键词检索"
        clearable
        @input="defSearch"
      />
      <el-table
        ref="defNextTable"
        v-loading="loading"
        :data="defNextResource"
        max-height="300"
        @sort-change="sortFunctionDef"
        @current-change="handleRowChange"
      >
        <el-table-column
          width="50"
          center
        >
          <template slot-scope="scope">
            <el-radio
              v-model="defNextForm.radio"
              class="radio"
              :label="scope.row.resourceId"
              @change.native="getCurrentRow(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="storageName"
          label="资源名称"
          sortable="custom"
        />
        <el-table-column
          prop="bucketName"
          label="存储桶名称"
          sortable="custom"
        />
        <el-table-column
          prop="url"
          label="地址"
          sortable="custom"
        />
        <el-table-column
          prop="default"
          label="默认资源"
          sortable="custom"
        >
          <template slot-scope="scope">
            <span :class="transferBool(scope.row.default) ? 'green' : 'red'">
              {{ transferBool(scope.row.default) ? '是' : '否' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="next"
          label="下一个资源"
          sortable="custom"
        >
          <template slot-scope="scope">
            <span :class="transferBool(scope.row.next) ? 'green' : 'red'">
              {{ transferBool(scope.row.next) ? '是' : '否' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <el-form
        :model="defNextForm"
        style="margin: 20px 0;"
      >
        <el-form-item style="margin-left:10px;">
          <el-radio
            v-model="defNextForm.flag"
            label="next"
          >下一个资源</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button
          class="golden"
          @click="confirmDefNext"
        >{{ $ts('true') }}</el-button>
        <el-button @click="defNextFlag = false">{{ $ts('wtstype.none') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import QuickDefault from '@/components/QuickDefault'
import { mapState } from 'vuex'
import {
  addObjectStorageResource,
  updateObjectStorageResource,
  removeObjectStorageResource,
  deleteStorageDevice,
  addStorageDevice,
  listStorageDevice,
  updateStorageDevice,
  getResourceStatus
  // getGroupList
} from '@/api/storage'
import { validBucketName } from '@/utils/validate'
export default {
  name: 'ObjectResource',
  components: {
    QuickDefault
  },
  data() {
    var validateMaxInt = (rule, value, callback) => {
      if (this.form.unit == 'GB') {
        if (value > 8000000000) {
          return callback(new Error('不超过8,000,000,000GB'))
        } else {
          return callback()
        }
      } else if (this.form.unit == 'TB') {
        if (value > 83886) {
          return callback(new Error('不超过83886TB'))
        } else {
          return callback()
        }
      } else {
        return callback()
      }
    }
    return {
      asyncTaskList: {},
      show: false,
      innerFormLoading: false,
      emuSignatureType: [
        {
          label: 'V2',
          value: 'AWS2'
        },
        {
          label: 'V4',
          value: 'AWS4'
        }
      ],
      enumStorageType: [
        {
          label: '温存储',
          value: 'WARM'
        },
        {
          label: '冷存储',
          value: 'S3'
        },
        {
          label: '冰存储',
          value: 'GLACIER'
        },
        {
          label: 'Amazon S3 Via EC2 IAM Role',
          value: 'IAM'
        },
        {
          label: 'NAS',
          value: 'NAS'
        }
        // {
        //   label: 'CACHE',
        //   value: 'CACHE'
        // }
      ],
      regions: [
        {
          label: '亚太地区(香港)', value: 'ap-east-1'
        }
      ],
      refreshId: [],
      defNextForm: {
        search: '',
        deviceId: '',
        radio: '',
        resourceId: '',
        flag: 'next' // default/next
      },
      defNextSort: {
        prop: 'default',
        order: 'descending'
      },
      sortConfig: {},
      defNextResource: [],
      copyDefNextResource: [],
      defNextFlag: false,
      defaultSort: {
        prop: 'storageResourceModelList',
        order: 'descending'
      },
      filterText: '',
      showDescDevice: '',
      treeOpt: {
        label: 'deviceName',
        id: 'deviceId',
        children: 'storageResourceModelList'
      },
      opType: 'add',
      optDType: 'add',
      rules: {
        storageName: [
          {
            required: true, message: '资源名称必填', trigger: ['blur', 'change']
          },
          {
            message: "请输入2-64位英文、中文、数字、'_-.'", pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5\-\.]{2,64}$/
          }
        ],
        url: [
          {
            required: true, message: '资源路径必填', trigger: ['blur', 'change']
          },
          {
            validator: (rule, val, cb) => {
              // const reg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
              // const regPrefix = /^(http:\/\/)(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
              // if (this.form.storageType !== 'NAS') {
              //   if (!regPrefix.test(val)) {
              //     return cb('资源路径需符合http:// + IP的格式')
              //   } else {
              //     return cb('')
              //   }
              // } else if (!reg.test(val)) {
              //   return cb('资源路径需符合IP格式')
              // }
              if (val.length < 2 || val.length > 64) {
                return cb('请输入2-64字符')
              }
              return cb('')
            }
          }
          // {
          //   validator: (rule, val, cb) => {
          //     const reg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
          //     if (this.form.storageType !== 'S3') {
          //       if (!reg.test(val)) {
          //         return cb('资源路径需符合IP格式')
          //       } else {
          //         return cb()
          //       }
          //     } else {
          //       return cb()
          //     }
          //   }
          // }
        ],
        bucketName: [
          {
            required: true, message: '存储桶名必填', trigger: ['blur', 'change']
          },
          {
            validator: validBucketName, trigger: ['blur', 'change']
          }
        ],
        region: [
          {
            required: true, message: '区域必填', trigger: ['blur', 'change']
          }
        ],
        accessKey: [
          {
            required: true, message: 'access key id 必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 64, message: '请输入2-64字符'
          }
        ],
        secretKey: [
          {
            required: true, message: 'secret key 必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 64, message: '请输入2-64字符'
          }
        ],
        userName: [
          {
            required: true, message: '用户名称必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 64, message: '请输入2-64字符'
          }
        ],
        password: [
          {
            required: true, message: '用户密码必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 64, message: '请输入2-64字符'
          }
        ],
        sign: [
          {
            required: true, message: '标签名必填', trigger: ['blur', 'change']
          },
          {
            min: 2, max: 256, message: '请输入2-256字符'
          }

        ],
        objectCount: { required: true, message: '存储数量上限必填，请输入正整数' },
        objectSize: [
          { required: true, message: '存储数量上限必填，请输入正整数' },
          { validator: validateMaxInt, trigger: ['change', 'blur'] }

        ],
        deviceId: { required: true, message: '请选择存储设备' },
        storageType: { required: true, message: '请选择存储热度' },
        mountDir: { required: true, message: '请设置共享目录' }
      },
      form: {
        storageName: '',
        url: '',
        userName: '',
        password: '',
        isDefault: false,
        sign: '',
        bucketName: '',
        next: false,
        defaultV: false,
        objectCount: -1,
        objectSize: -1,
        objectSizeUnit: '',
        deviceId: '',
        storageType: 'S3', // 初始S3
        accessKey: '',
        secretKey: '',
        unit: 'GB',
        extendInfo: {
          maxObjectSize: '',
          dirMaxFile: '',
          dirMaxDepth: '',
          dirMaxSubDir: ''
        },
        storageUseType: 'DEFAULT',
        param: {
          connectionTimeoutTime: '',
          sync: false
        },
        mountDir: ''
      },
      placeholder: [
        { label: '容量上限不超过8,000,000,000GB', value: '容量上限不超过8,000,000,000GB' },
        { label: '容量上限不超过83886TB', value: '容量上限不超过83886TB' }
      ],
      placeholderValue: '容量上限不超过8,000,000,000GB',
      sizeSelect: [
        { label: 'GB', value: 'GB' },
        { label: 'TB', value: 'TB' }
        // { label: 'NULL', value: 'NULL' }
      ],
      deviceDialog: false,
      deviceForm: {
        deviceName: '',
        isDefault: ''
      },
      copyForm: {},
      selectRow: {},
      modelFormFlag: false,
      deleteFlag: false,
      loading: false,
      pageObj: {
        currentPage: 1,
        pageSize: 10
      },
      tableData: [],
      storageType: [
        { label: 'NAS', value: 'NAS' },
        { label: 'DBS', value: 'DBS' },
        { label: 'REMOTE_DISK', value: 'REMOTE_DISK' },
        { label: '本地磁盘', value: 'LOCAL_DISK' },
        { label: 'DOS', value: 'DOS' }
      ],
      prop: '',
      order: '',
      storageTypeEnu: {
        'OK': '连接正常',
        'NULL': ' 未检测'
        // 'STATUS_NULL': '未检测',
        // 'CONNECTING': '连接正常',
        // 'INVALID_KEY': '账号错误',
        // 'INVALID_SECRET': '密码错误',
        // 'UNCONNECTION': '地址错误',
        // 'NO_SUCH_BUCKET': '桶不存在',
        // 'UNKNOWN_ERROR': '未知错误',
        // 'OFFLINE_RESOURCE': '资源下线',
        // 'REMOUNT': '重新挂载中'
      },
      dRules: {
        deviceName: { message: "请输入2-40位英文、中文、数字、'_-.'", required: true, pattern: /^[a-zA-Z0-9'_\u4e00-\u9fa5\-\.]{2,40}$/ },
        isDefault: { required: true }
      },
      deviceSelectOpt: [],
      fillSourceForm: {},
      fillDeviceForm: {},
      selectObject: {}
    }
  },
  computed: {
    isAdd() {
      return this.opType === 'add'
    },
    renderData() {
      return this.tableData.slice((this.pageObj.currentPage - 1) * this.pageObj.pageSize, this.pageObj.currentPage * this.pageObj.pageSize)
    },
    isAddDevice() {
      return this.optDType === 'add'
    },
    renderDel() {
      return this.opType === 'del'
    },
    getStorageType() {
      return this.form.storageType
    },
    deviceExistNextConifg() {
      return this.form.deviceId && this.tableData.some(x => x.deviceId === this.form.deviceId && x.storageResourceModelList.some(item => item.next))
    },
    judgeS3Type() {
      return this.form.storageType === 'S3'
    },
    ...mapState(['api'])
  },
  watch: {
    // 'form.storageType': function (val) {
    //   this.$refs['form'] && this.$refs['form'].clearValidate()
    //   if (val !== 'NAS') {
    //     this.form.nasAdvancedConfig = false
    //   }
    // },
    deleteFlag(val) {
      if (!val) {
        this.opType = 'add'
        this.optDType = 'add'
      }
    },
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    defNextFlag(val) {
      if (!val) {
        Object.assign(this.defNextForm, { flag: 'next', radio: '', search: '', resourceId: '' })
      }
    }
  },
  mounted() {
    this.prop = this.defaultSort.prop
    this.order = this.defaultSort.order
    this.init().then(() => {
      this.showDefaultResource()
    })
  },
  methods: {
    mapStorageType(data) {
      const existMatch = this.enumStorageType.find(x => x.value === data)
      return existMatch ? existMatch.label : ''
    },
    renderLoadGroupStatus(stauts) {
      let icon = ''
      switch (stauts) {
        case 'GREEN':
          icon = 'loadGroupStatus'
          break
        case 'YELLOW':
          icon = 'loadGroupWarning'
          break
        default:
          icon = 'resourceWarn'
        // 剩余空间（容量|个数超出）
        // resourceWarn
      }
      return '#icon-' + icon
    },
    judgeValidNext() {
      // 禁用选择next
      if (this.deviceExistNextConifg && this.isAdd && this.form.next) {
        this.$confirm('当前设备下已有资源为下一个资源，当前设置将会失效!', '确认', {
          confirmButtonText: '确定',
          showCancelButton: false,
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res => {
          this.form.next = false
        }).catch(() => {
          this.form.next = false
        })
      }
    },
    renderUtilityRatio(data) {
      const {
        objectSize,
        usedSpace,
        unit
      } = data
      if (String(objectSize) === '-1') {
        return [{ val: '' }]
      } else {
        const quotaSize = unit === 'GB' ? objectSize * 1024 ** 3 : objectSize * 1024 ** 4
        const val = (usedSpace / quotaSize) * 100
        const color = parseInt(val) >= 90 ? '#d75a78' : parseInt(val) >= 70 ? '#ff8746' : ''
        return [{
          color,
          val: '(' + (val ? val.toFixed(1) : 0) + '%)'
        }]
      }
    },
    handleNextResource(val) {
      if (val === 'CACHE' && this.form.next) {
        this.$confirm('当前NAS资源存储用途为缓存，下一个资源将会失效，是否继续？', '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res => {
          this.form.next = false
        }).catch(() => {
          this.form.storageUseType = 'DEFAULT'
        })
      }
    },
    validateUrl() {
      setTimeout(() => {
        this.$refs.form.clearValidate('url')
      })
    },
    transRegion(val) {
      if (val === 'ap-east-1') return '亚太地区(香港)'
      else return '-'
    },
    showDefaultResource() {
      const defaultDevice = this.tableData.filter(item => {
        return item.default === 'true'
      })
      if (defaultDevice && defaultDevice.length) {
        if (defaultDevice[0].storageResourceModelList.length) {
          const defaultResource = defaultDevice[0].storageResourceModelList.find(item => {
            return item.default
          })
          if (defaultResource) {
            this.$refs['tree'].setCurrentKey(defaultResource.id)
            this.getInfo(defaultResource)
          }
        } else {
          this.$refs['tree'].setCurrentKey(defaultDevice[0].id)
          this.getInfo(defaultDevice[0])
        }
      }
    },
    // 刷新或者 修改当前设备、资源后重新让tree刷新数据并高亮
    // 新需求、需要获取资源状态
    getCurrentRefresh() {
      this.init().then(() => {
        const { resourceId, storageResourceModelList, deviceName } = this.selectObject
        if (resourceId) {
          const AllResource = this.tableData.map(item => item.storageResourceModelList).flat()
          const existSourceId = AllResource.find(x => x.resourceId === resourceId)
          // 展示更新后的资源
          if (existSourceId) {
            this.getResourceStatus(existSourceId)
            this.$refs['tree'].setCurrentKey(existSourceId.id)
          } else {
            this.showDefaultResource()
          }
        } else if (storageResourceModelList) {
          const existDevice = this.tableData.find(item => {
            return item.deviceName === deviceName
          })
          if (existDevice) {
            this.$refs['tree'].setCurrentKey(existDevice.id)
            this.updateDevice(existDevice, false, true)
            this.showDescDevice = 'device'
          } else {
            this.showDefaultResource()
          }
        } else {
          this.showDefaultResource()
        }
      })
    },
    changelogicUnit(val) {
      if (val == 'TB') {
        this.form.objectSize = ''
        this.placeholderValue = this.placeholder[1].value
      } else {
        this.form.objectSize = ''
        this.placeholderValue = this.placeholder[0].value
      }
    },
    inputPositiveNum(ipt, value, range) {
      // let temp = ''
      // const keys = value.split('.')
      // for (const i of keys) {
      //   temp += `.${i}`
      // }
      // temp = temp.substring(1, temp.length - 1)
      const val = value.split('.')
      const inputValue = ipt.replace(/(^0+)|\D/g, '')
      if (val && val.length == 1) {
        if (range && Number(inputValue) > Number(range)) {
          this.$set(this.form, value, range)
        } else {
          this.$set(this.form, value, inputValue)
        }
      } else {
        if (range && Number(inputValue) > Number(range)) {
          this.$set(this.form[val[0]], val[1], range)
        } else {
          this.$set(this.form[val[0]], val[1], inputValue)
        }
      }
      // let tempV = this
      // for(let item of keys){
      //   this[item] = ipt.replace(/(^0+)|\D/g, '')
      // }
      // console.log(tempV)
      // this[keys[0]][keys[1]] = ipt.replace(/(^0+)|\D/g, '')
    },
    getResourceStatus(row) {
      // console.log(row.storageResourceModelList, 'row')
      // 调用资源
      this.showDescDevice = 'object'
      const { resourceId } = row
      if (resourceId) {
        this.innerFormLoading = true
        getResourceStatus({
          resourceId
        }).then((res) => {
          this.form.gateway = res.data || []
          // this.form.gateway.push(
          //   ...[
          //     {
          //       'gatewayAddress': '10.0.163.43:8300',
          //       'gatewayStatus': true,
          //       'resourceStatus': 'OK'
          //     },
          //     {
          //       'gatewayAddress': '10.250.126.18:8300',
          //       'gatewayStatus': false,
          //       'resourceStatus': 'OK'
          //     }
          //   ]
          // )
          this.updateForm(row, false, true)
        }).finally(() => {
          this.innerFormLoading = false
        })
      }
    },

    transByteToGB(data) {
      // ByteToGB、
      const res = (Number(data) / 1024 ** 3).toFixed(2)
      return res == 0 ? 0 : res
    },
    handleRowChange(row) {
      // 请求成功清除数据 row调用为null
      const resourceId = row && row.resourceId
      this.defNextForm.radio = resourceId
      this.defNextForm.resourceId = resourceId
    },
    defSearch() {
      this.defNextResource = JSON.parse(JSON.stringify(this.copyDefNextResource))
      if (!this.defNextForm.search) {
        return
      } else {
        this.defNextResource = this.defNextResource.filter(item => {
          return Object.keys(item).some(itx => {
            return item[itx] && item[itx].toString().indexOf(this.defNextForm.search) > -1
          })
        })
      }
    },
    sortFunctionDef(val) {
      this.defNextSort.prop = val.prop
      this.defNextSort.order = val.order
      this.defNextResource.sort(this.sortMethod(val.prop, val.order))
    },
    getCurrentRow(row) {
      this.defNextForm.resourceId = row.resourceId
    },
    transferBool(val) {
      return this.stringToBoolean(val)
    },
    confirmDefNext() {
      const {
        flag,
        deviceId,
        resourceId
      } = this.defNextForm
      if (!this.defNextForm.resourceId) {
        return this.$notify.error('请选择存储资源')
      }
      const item = this.defNextResource.find(item => item.resourceId == resourceId)
      if (item.default && flag === 'next') {
        return this.$notify.error('默认资源和下一个资源不能同时设置在同一个资源中')
      }
      const data = {
        deviceId,
        resourceId
      }
      data[flag] = true
      updateObjectStorageResource(data).then((res) => {
        this.loading = true
        listStorageDevice().then((res) => {
          this.tableData = (res.data || []).map(item => {
            if (item.storageResourceModelList && item.storageResourceModelList.length) {
              item.storageResourceModelList.map(itx => {
                itx.deviceName = itx.storageName
              })
            }
            return item
          }).sort(this.sortMethod(this.prop, this.order))
          // console.log(this.tableData, 'egeg')
          const row = this.tableData.find(item => item.deviceId === this.defNextForm.deviceId)
          this.handleDefNextFlag(row)
          this.$ts({
            type: 'success',
            text: '操作成功'
          })
        }).finally(() => {
          this.loading = false
        })
      })
    },
    handleDefNextFlag(row) {
      this.defNextResource = row.storageResourceModelList.filter(x => x.storageUseType !== 'CACHE')
      this.copyDefNextResource = JSON.parse(JSON.stringify(this.defNextResource))
      this.defNextForm.deviceId = row.deviceId
      this.defNextFlag = true
    },
    handleDemi(row, _, value) {
      value = value === '0' ? '0' : String(value)
      const reg = /\B(?=(\d{3})+(?!\d))/g
      return value.replace(reg, ',')
    },
    filterNode(value, data) {
      if (!value) return true
      return (data.deviceName || data.storageName).toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1
    },
    getInfo(node) {
      this.selectObject = node
      if (Object.keys(node).includes('storageResourceModelList')) {
        this.updateDevice(node, false, true)
        this.showDescDevice = 'device'
        // render Device
      } else {
        this.getResourceStatus(node)
        // render object
      }
    },
    handleDel(type, { row }) {
      if (type === 'device') {
        this.optDType = 'del'
      } else if (type === 'object') {
        this.opType = 'del'
      }
      // console.log(row, 'row')
      this.selectRow = row
      this.deleteFlag = true
    },
    stringToBoolean(string) {
      // console.log(string, 'string')
      if (typeof (string) !== 'string') return string
      switch (string.toLowerCase().trim()) {
        case 'true':
        case 'yes':
        case '1':
          return true
        case 'false':
        case 'no':
        case '0':
        case null:
          return false
        default:
          return Boolean(string)
      }
    },
    // getSingleResourceStatus (item) {
    //   const resourceId = item.resourceId
    //   this.asyncTaskList[resourceId] = false
    //   return new Promise((resolve) => {
    //     getResourceStatus({
    //       resourceId
    //     }).then(res => {
    //       // 资源连接不上、
    //       const {
    //         objectCount,
    //         objectSize,
    //         usedCount,
    //         usedSpace,
    //         unit
    //       } = item
    //       const errorStatus = res.data.filter(x => x.resourceStatus !== 'OK')
    //       let validUse = true
    //       if (objectCount !== '-1' && Number(objectCount) < Number(usedCount)) {
    //         validUse = false
    //       }
    //       if (objectSize !== '-1') {
    //         const totalSize = unit === 'GB' ? 1024 ** 3 * objectSize : 1024 ** 4 * objectSize
    //         validUse = (totalSize - usedSpace) > 0
    //       }
    //       if (errorStatus.length === res.data.length) {
    //         // danger
    //         resolve('DANGER')
    //       } else {
    //         resolve(validUse ? 'GREEN' : 'YELLOW')
    //       }
    //     }).catch(() => {
    //       resolve('DANGER')
    //     })
    //       .finally(() => {
    //         this.asyncTaskList[resourceId] = true
    //       })
    //   })
    // },
    init() {
      return new Promise((resolve) => {
        this.loading = true
        listStorageDevice().then((res) => {
          this.tableData = (res.data || []).map(item => {
            item.id = 'device' + item.deviceId
            if (item.storageResourceModelList && item.storageResourceModelList.length) {
              item.storageResourceModelList.map(async(itx) => {
                itx.deviceName = itx.storageName
                itx.id = 'resource' + itx.resourceId
                // itx.resourceStatus = await this.getSingleResourceStatus(itx)
                // 资源利用空间优先、剩余空间满展示黄色、连接不可用
              })
            }
            return item
          }).sort((a, b) => this.transferBool(b.default) - this.transferBool(a.default))
          // 按照默认资源（先）下一个资源（后）进行排序
          this.tableData.forEach(item => {
            if (item.storageResourceModelList && item.storageResourceModelList.length) {
              item.storageResourceModelList.sort((a, b) => {
                const aDefault = a.default
                const bDefault = b.default
                const aNext = a.next
                const bNext = b.next
                if (aDefault - bDefault > 0) {
                  return -1
                } else if (aDefault - bDefault < 0) {
                  return 1
                } else if (aNext - bNext > 0) {
                  return -1
                } else if (aNext - bNext < 0) {
                  return 1
                } else {
                  return 0
                }
              })
            }
          })
        })
          // .catch(() => {
          //   this.tableData = [
          //     {
          //       deviceName: 'deviceName',
          //       storageResourceModelList: [
          //         { storageName: 'resource1',
          //           resourceId: 1, storageType: 'NAS' }
          //       ]
          //     },
          //     {
          //       deviceName: 'nameDevice',
          //       storageResourceModelList: [
          //         { storageName: 'resource2',
          //           resourceId: 2, storageType: 'S3' }
          //       ]
          //     }
          //   ]
          // })
          .finally(() => {
            const keepLoad = () => {
              const flag = Object.keys(this.asyncTaskList).some(x => !this.asyncTaskList[x])
              if (flag) {
                setTimeout(() => {
                  keepLoad()
                }, 200)
              } else {
                this.loading = false
                resolve(true)
              }
            }
            keepLoad()
            // this.asyncTaskList
            // .this.loading = false
          })
      })
    },
    // 点击创建、再修改、数据情况回显问题
    async updateForm(row, flag = false, needFill = false) {
      this.opType = 'update'
      // console.log(row.objectSize, 'egeg')
      // region、
      Object.assign(this.form, { ...row, objectSize: Number(row.objectSize), objectCount: Number(row.objectCount), defaultV: row.default, mountDir: row.bucketName })
      if (row.unit === 'NULL' || !row.unit) {
        this.form.unit = 'GB'
      } else {
        this.form.unit = row.unit
      }
      if (this.form.storageType === 'NAS') {
        this.form.storageUseType = this.form.storageUseType === 'CACHE' ? 'CACHE' : 'DEFAULT'
      }
      if (needFill) {
        this.fillSourceForm = JSON.parse(JSON.stringify(this.form))
        if (this.fillSourceForm.storageType === 'NAS') {
          this.fillSourceForm.storageUseType = this.fillSourceForm.storageUseType === 'CACHE' ? 'CACHE' : 'DEFAULT'
        }
      }
      // console.log(this.fillSourceForm, 'fillSourceForm')
      if (flag) {
        if (this.judgeS3Type) {
          const str = this.form.url.slice(0, 7)
          this.form.url = str === 'http://' ? this.form.url.slice(7) : this.form.url
        }
        this.copyForm = JSON.parse(JSON.stringify(this.form))
        await this.loadAsyncOption()
        this.modelFormFlag = true
        this.$nextTick(() => {
          this.$refs['form'] && this.$refs['form'].clearValidate()
        })
      }
    },
    updateDevice(row, flag = false, needFill = false) {
      this.optDType = 'update'
      Object.assign(this.deviceForm, {
        ...row, isDefault: this.stringToBoolean(row.default)
      })
      if (needFill) {
        this.fillDeviceForm = JSON.parse(JSON.stringify(this.deviceForm))
      }
      if (flag) {
        this.deviceDialog = true
        this.$nextTick(() => {
          this.$refs['Dform'] && this.$refs['Dform'].clearValidate()
        })
      }
    },
    createDevice() {
      this.$refs['Dform'].validate((valid) => {
        if (valid) {
          const { deviceName, isDefault, deviceId } = this.deviceForm
          if (this.isAddDevice) {
            addStorageDevice({
              deviceName, default: isDefault
            }).then(() => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.deviceDialog = false
              this.getCurrentRefresh()
            }).catch((err) => {
              this.init()
            })
          } else {
            updateStorageDevice({
              default: isDefault, deviceId
            }).then(() => {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.deviceDialog = false
              this.getCurrentRefresh()
            }).catch((err) => {
              this.init()
            })
          }
        }
        // console.log(valid, 'valid', this.deviceForm)
      })
    },
    handleSizeChange(val) {
      this.pageObj.currentPage = 1
      this.pageObj.pageSize = val
    },
    // 当前页改变时触发 跳转其他页
    handleCurrentChange(val) {
      this.pageObj.currentPage = val
    },
    getRowClass({ row }) {
      if (row.storageResourceModelList && !row.storageResourceModelList.length) {
        return ['hide-dropdown']
      } else {
        return ['']
      }
    },
    expandChange(row, any) {
      this.$set(row, 'loading', true)
      setTimeout(() => {
        this.$set(row, 'loading', false)
      }, 200)
    },
    dialogOpen(e) {
      const ipt = e
      this.$nextTick(function() {
        this.$refs[ipt].$el.querySelector('input').focus()
      })
    },
    async showCreate(cName, id = '') {
      if (cName === 'device') {
        Object.assign(this.deviceForm, {
          deviceName: '',
          isDefault: false
        })
        this.deviceDialog = true
        this.optDType = 'add'
        this.$nextTick(() => {
          this.$refs['Dform'].clearValidate()
        })
      } else if (cName === 'object') {
        await this.loadAsyncOption()
        this.opType = 'add'
        this.modelFormFlag = true
        this.form.deviceId = id
        this.$set(this, 'form', {
          storageName: '',
          url: '',
          userName: '',
          password: '',
          isDefault: true,
          sign: '',
          bucketName: '',
          next: false,
          defaultV: false,
          objectCount: -1,
          objectSize: -1,
          deviceId: '',
          unit: 'GB',
          storageType: 'S3',
          mountDir: '',
          extendInfo: {
            maxObjectSize: '64',
            dirMaxFile: '10000',
            dirMaxDepth: '2',
            dirMaxSubDir: '10'
          },
          accessKey: '',
          secretKey: '',
          region: 'ap-east-1',
          storageUseType: 'DEFAULT',
          signatureType: 'AWS2'
          // param: {
          //   connectionTimeoutTime: '',
          //   sync: false
          // }
        })
        this.$nextTick(() => {
          this.$refs['form'].clearValidate()
        })
        // 重置 form的值 为空
        // console.log(this.form, 'form')
        // getRegions
      }
    },
    async loadAsyncOption() {
      const res = await listStorageDevice()
      this.deviceSelectOpt = (res.data || []).map(item => {
        return {
          label: item.deviceName,
          value: item.deviceId
        }
      })
      // const res2 = await new Promise((res) => {
      //   setTimeout(() => {
      //     res(['亚太地区(香港)'])
      //   }, 200)
      // })
      // this.regions = res2.map(item => {
      //   return { label: item, value: item }
      // })
    },
    deleteForm() {
      if (this.renderDel) {
        const { resourceId, deviceId } = this.selectRow
        // 删除存储资源 校验关联负载组
        removeObjectStorageResource({
          resourceId,
          deviceId
        })
          .then(res => {
            if (res.msg === 'success') {
              this.$ts({
                type: 'success',
                text: this.$ts('response.success')
              })
              this.showDescDevice = ''
            }
          })
          .catch((err) => {
            console.log(err)
          })
          .finally(() => {
            this.deleteFlag = false
            this.getCurrentRefresh()
          })
      } else {
        deleteStorageDevice({
          deviceId: this.selectRow.deviceId
        }).then((res) => {
          if (res.msg === 'success') {
            this.$ts({
              type: 'success',
              text: this.$ts('response.success')
            })
            this.showDescDevice = ''
          }
        })
          .catch(err => {
            console.log(err)
          })
          .finally(() => {
            this.deleteFlag = false
            this.getCurrentRefresh()
          })
      }
    },
    confirmCreate() {
      this.$refs['form'].validate((valid, object) => {
        const {
          userName,
          password,
          storageName,
          bucketName,
          url,
          sign,
          next,
          objectCount,
          objectSize,
          deviceId,
          extendInfo,
          // param,
          unit,
          storageType,
          mountDir,
          region,
          storageUseType,
          signatureType
          // accessKey,
          // secretKey
        } = this.form
        const data = {
          storageName,
          sign,
          bucketName,
          next,
          objectCount,
          objectSize,
          deviceId,
          storageType,
          unit
        }
        if (valid) {
          if (this.isAdd) {
            //  新增connect_type
            if (storageType === 'NAS' || storageType === 'CACHE') {
              // region
              Object.assign(data, { extendInfo, bucketName: mountDir, url, storageUseType })
              const extendInfoFlag = Object.keys(extendInfo).every(item => {
                return !extendInfo[item]
              })
              extendInfoFlag && delete data.extendInfo
            } else if (storageType === 'IAM') {
              Object.assign(data, { region, storageUseType: 'DEFAULT' })
              // connect_type: 1
            } else {
              Object.assign(data, { url, userName, password, storageUseType: 'DEFAULT' })
              data.url = 'http://' + data.url
            }
            if (data.objectSize == -1) {
              data.unit = 'NULL'
            }
            if (storageType === 'NAS') {
              data.signatureType = 'NULL'
            } else {
              data.signatureType = signatureType
            }
            addObjectStorageResource(data)
              .then((res) => {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                this.modelFormFlag = false
                this.getCurrentRefresh()
              })
              .catch((err) => {
                this.init()
                console.log(err)
              })
          } else if (this.opType === 'update') {
            // 过滤 extendInfo、param、
            const reqParams = Object.keys(this.form).reduce((cur, pre) => {
              const newVal = this.form[pre]
              const oldVal = this.copyForm[pre]
              // console.log(newVal, 'newold', oldVal)
              if (typeof newVal !== 'object' && typeof oldVal !== 'object') {
                if (newVal !== oldVal) {
                  if (pre == 'defaultV') {
                    pre = 'default'
                  }
                  cur[pre] = newVal
                }
              }
              // newVal !== oldVal ? cur[pre] = newVal : null
              return cur
            }, {})
            reqParams.resourceId = this.form.resourceId
            reqParams.deviceId = deviceId
            reqParams.objectSize = this.form.objectSize
            if (this.judgeS3Type && reqParams.url) {
              reqParams.url = 'http://' + reqParams.url
            }
            // reqParams.unit = this.form.unit
            // if (this.form.objectSize == -1 && this.form.objectCount == -1) {
            //   reqParams.unit = 'NULL'
            // }
            if (this.form.objectSize == -1) {
              reqParams.unit = 'NULL'
            } else {
              reqParams.unit = this.form.unit
            }
            updateObjectStorageResource(reqParams)
              .then((res) => {
                this.$ts({
                  type: 'success',
                  text: this.$ts('response.success')
                })
                if (this.form.objectSize != -1) {
                  this.form.unit == 'GB'
                }
                this.modelFormFlag = false
                this.getCurrentRefresh()
              })
              .catch((err) => {
                this.init()
                console.log(err)
              })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-dialog {
  th {
    &:nth-of-type(1) {
      .cell {
        display: none;
        // .el-checkbox__inner {
        //   position: relative;
        // }
      }
    }
  }

  .el-select {
    width: 100%;
  }

  .extendInfo {
    .el-col-12 {
      label.el-form-item__label {
        width: 177px !important;
        margin-right: -50px;
        & + el-form-item__content {
          margin-left: 200px;
        }
      }

      margin-bottom: 20px;
    }
  }
}

::v-deep .el-table {
  margin-top: 50px;
  .el-table__body-wrapper {
    overflow-x: auto !important;

    .el-table__body {
      table-layout: fixed !important;
      width: 100% !important;

      .el-table__expanded-cell:hover {
        background-color: #2b3d44 !important;
      }
    }
  }

  .el-table__expanded-cell {
    .el-table__cell {
      padding: 3px 10px 3px 0;
    }
  }

  .el-table__row.hide-dropdown {
    .el-table__expand-column {
      pointer-events: none;

      .el-table__expand-icon {
        display: none;
      }
    }
  }

  .cell {
    white-space: nowrap;
  }
}

::v-deep.el-form {
  .el-switch {
    .el-switch__label {
      line-height: 18px;
    }
  }

  label.el-form-item__label {
    margin-left: 0 !important;
  }
}

::v-deep .treeContent {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;

  .tree {
    width: 35%;
    min-width: 400px;
    margin-right: 30px;
    .el-input {
      width: calc(100% - 5px);
    }
    .el-tree-node__content {
      height: 45px;
      box-sizing: border-box;
      width: 100%;
      padding-right: 10px;
    }

    .el-tree-node__children {
      .el-tree-node__content {
        padding-left: 22px !important;
      }
    }

    .el-tree--highlight-current {
      margin-top: 20px;
      padding: 10px 0 0 10px;

      span {
        color: #bdc4c7;
      }

      .el-tree-node.is-current {
        & > .el-tree-node__content {
          background-color: #19272e;

          span {
            color: #fff;
            font-weight: bold;
          }
        }
      }
    }

    .custom-tree-node {
      width: 100%;
      font-size: 15px;
      overflow: hidden;
      .resourceContainer {
        // padding-left: 20px;
        display: flex;
        box-sizing: border-box;
        align-items: center;
        width: 100%;
        // justify-content: space-between;
        .resourcename {
          max-width: 60%;
          width: 60%;
          position: relative;
          top: -2px;
          overflow: hidden;
          & + div {
            margin-left: 5%;
            min-width: 160px;
            // padding-bottom: 6px;
          }
          .el-tag {
            width: 72px;
          }
        }
      }
      .deviceContainer {
        display: flex;
        box-sizing: border-box;
        width: 100%;
        align-items: center;
        // justify-content: space-between;
        .deviceIcon {
          max-width: 60%;
          overflow: hidden;
          width: 60%;
          line-height: 25px;
          & + div {
            min-width: 160px;
            margin-left: calc(5% + 8px);
          }
        }
      }
      .el-tag {
        color: #e39606 !important;
        background-color: #384348;
        border-color: transparent;
        height: 22px;
        line-height: 20px;
        border-radius: 20px;
        margin-left: 5px;
        width: 75px;
        text-align: center;
      }

      .icon {
        margin-right: 5px;
        color: unset;
        font-size: 23px;
      }
    }

    div[role="treeitem"] {
      margin: 5px 0;
    }

    .stauts {
      min-height: 300px;
      max-height: 900px;
      overflow-y: scroll;
    }
  }

  .content {
    flex: 1;
    min-height: 300px;

    .btn {
      margin: 30px 0 0 0px;
    }
  }
}

::v-deep .el-form-item__content {
  word-break: break-word;
  flex: 1;
  margin-right: 15px;
}

.quick-default-style {
  margin-top: 14px;
}

::v-deep .defNextFormDialog {
  .el-table__cell {
    .el-radio__label {
      display: none;
    }
  }
}

::v-deep .expandDeviceForm {
  padding: 20px;
  margin: 0 0 20px 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);

  .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  label.el-form-item__label {
    // width: 50% !important;
    width: 50% !important;
    min-width: 120px;
    font-size: 15px;
    color: #97a2a8 !important;
    font-weight: bold;
  }
  .el-table {
    background-color: #36464e !important;
  }
}

.nasAdvancedConfigBtn {
  i {
    position: relative;
    top: 2px;
  }
}

.blueTxt {
  color: #2e88e5;
}
:deep(.formDialog) {
  min-width: 1200px;
}
</style>
<style lang="scss">
.text-wrap {
  word-break: break-word;
  text-align: left;
  width: fit-content;
  max-width: 500px;
}
</style>
