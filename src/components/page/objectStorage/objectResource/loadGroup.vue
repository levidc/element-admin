<template>
  <div>
    <div class="page_content_wrap">
      <el-button
        class="golden"
        :disabled="loading || innerFormLoading"
        @click="flag=true;opt='add'"
      >创建负载</el-button>
      <div class="right">
        <el-tooltip
          content="刷新"
          placement="top"
          effect="dark"
        >
          <i
            class="el-icon-refresh"
            @click="filterText='';init()"
          />
        </el-tooltip>
      </div>
    </div>
    <div class="treeContent">
      <div class="tree">
        <el-input
          v-model="filterText"
          placeholder="负载组或资源名过滤"
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
              slot-scope="{ data }"
              class="custom-tree-node"
            >
              <!-- 负载组 -->
              <span v-if="!('storageName' in data)">
                <span class="deviceContainer">
                  <span class="deviceIcon">
                    <svg
                      class="icon"
                      aria-hidden="true"
                    >
                      <use xlink:href="#icon-loadGroup" />
                    </svg>
                    <showToolTip
                      :text="data.loadGroupName"
                      width="60%"
                    />
                  </span>
                  <div>
                    <!-- <svg class="icon" aria-hidden="true" style="position:relative;top:5px;font-size:26px;">
                      <use
                        :xlink:href="renderLoadGroupStatus(data.healthStatus)"
                      />
                    </svg> -->
                    <el-tag v-if="data.defaultGroup">ACTIVE</el-tag>
                    <el-tag v-if="data.groupTag==='DATA'">冷存储</el-tag>
                    <el-tag v-if="data.groupTag==='CACHE'">缓存</el-tag>
                    <el-tag v-if="data.groupTag==='GLACIER'">冰存储</el-tag>
                    <el-tag v-if="data.groupTag==='WARM'">温存储</el-tag>
                  </div>
                </span>
              </span>
              <span v-else-if="data.storageName">
                <span class="resourceContainer">
                  <span class="resourcename">
                    <el-tag style="margin-right:5px;">{{ renderStorageType(data.storageType) }}</el-tag>
                    <showToolTip
                      :text="data.loadGroupName"
                      width="60%"
                    />
                  </span>
                  <div>
                    <!-- <svg class="icon" aria-hidden="true" style="position:relative;top:5px;font-size:26px;">
                      <use
                        :xlink:href="renderLoadGroupStatus(data.resourceStatus)"
                      />
                    </svg> -->
                    <!-- <el-tag v-if=" data.storageType === 'NAS'">{{ data.storageUseType==='CACHE'?'缓存':data.storageUseType==='DEFAULT'?'直接存储':'' }}</el-tag> -->
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
          v-show="showDetailContent ==='loadGroup'&&!innerFormLoading"
          class="expandDeviceForm"
        >
          <el-form
            label-position="left"
            inline
          >
            <el-row>
              <el-col :span="12">
                <el-form-item label="负载名称">
                  <span>{{ fillForm.loadGroupName }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="默认负载">
                  <span
                    v-if="fillForm.defaultGroup"
                    class="green"
                  >是</span>
                  <span v-else>否</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否启用">
                  <span
                    v-if="fillForm.isOpen==='OPEN'"
                    class="green"
                  >是</span>
                  <span
                    v-else
                    class="red"
                  >否</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <span slot="label">
                    状态
                    <el-popover
                      placement="top"
                      width="250"
                      trigger="hover"
                      style="position:absolute;"
                    >
                      <p style="line-height:1.6;"> 绿色：有两个及以上健康资源</p>
                      <p style="line-height:1.6;"> 黄色：只有一个健康资源</p>
                      <p style="line-height:1.6;"> 红色：没有健康资源</p>
                      <i
                        slot="reference"
                        class="fa fa-question-circle"
                        style="margin-left:10px"
                      />
                    </el-popover>
                  </span>
                  <svg
                    class="icon"
                    aria-hidden="true"
                    style="font-size:26px;position:relative;top:6px;left:-4px;"
                  >
                    <use :xlink:href="renderLoadGroupStatus(fillForm.healthStatus)" />
                  </svg>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="负载用途">
                  <span>{{ fillForm.groupTag==='DATA'?'冷存储': fillForm.groupTag==='GLACIER'?'冰存储':'温存储' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="负载类型">
                  <span>{{ fillForm.storageType==='IAM'?'AWS': fillForm.storageType }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <span slot="label">
                    策略类型
                    <el-popover
                      placement="top"
                      width="250"
                      trigger="hover"
                      style="position:absolute;"
                    >
                      <p style="line-height:1.6;">AUTO:按资源的剩余空间大小自动调整写入的分配比例</p>
                      <i
                        slot="reference"
                        class="fa fa-question-circle"
                        style="margin-left:10px"
                      />
                    </el-popover>
                  </span>
                  <span>AUTO</span>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-table
                  :data="fillForm.items"
                  style="width: 90%;margin: 30px 0"
                >
                  <el-table-column
                    prop="storageName"
                    label="资源名称"
                    show-overflow-tooltip
                    min-width="150px"
                  />
                  <el-table-column
                    prop="status"
                    label="状态"
                    align="center"
                    width="150px"
                  >
                    <template slot-scope="scope">
                      <span
                        v-if="Number(scope.row.isOpen)===1"
                        class="green"
                      >启用</span>
                      <span
                        v-else
                        class="red"
                      >禁用</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="resourceStatus"
                    label="占用率"
                    align="center"
                    min-width="180px"
                  >
                    <template slot-scope="scope">
                      <span
                        v-for="(item,i) in renderUtilityRatio(scope.row) "
                        :key="i"
                        :style="{color:item.color}"
                      >
                        {{ item.val }}
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-table
                  :data="fillForm.gateway"
                  style="width:90%"
                >
                  <el-table-column
                    prop="gatewayAddress"
                    label="gateway地址"
                    min-width="150px"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="gatewayStatus"
                    label="服务状态"
                    align="center"
                    width="150px"
                  >
                    <template slot-scope="scope2">
                      <span
                        v-if="scope2.row.gatewayStatus"
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
                    min-width="180px"
                  >
                    <template slot-scope="scope2">
                      <el-table
                        class="innerTable"
                        :data="scope2.row.resourceList"
                      >
                        <el-table-column
                          label=" "
                          prop="storageName"
                        >
                          <template slot-scope="scope">
                            <showToolTip :text="scope.row.storageName" />
                          </template>
                        </el-table-column>
                        <el-table-column
                          label=" "
                          prop="resourceStatus"
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

                    </template>
                  </el-table-column>

                  <!-- =========== -->
                  <!-- <el-table-column prop="storageName" label="资源名称" align="center">
                  <template slot-scope="scope2">
                    <p v-for="item in scope2.row.storageName" :key="item">
                      {{ item }}
                    </p>
                  </template>
                </el-table-column> -->
                </el-table>
              </el-col>
            </el-row>
            <el-row>
              <div class="btn">
                <el-button
                  class="blue"
                  @click="updateForm"
                >{{ $ts('modify') }}</el-button>
                <el-button
                  type="danger"
                  class="red"
                  @click="deleteFlag=true"
                >{{ $ts('delete') }}</el-button>
              </div>
            </el-row>
          </el-form>
        </div>
        <div
          v-show="showDetailContent ==='resource'&&!innerFormLoading"
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
                <el-form-item label="存储类型">
                  <span>{{ fillSourceForm.storageType }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  v-if="fillSourceForm.storageType === 'S3' || fillSourceForm.storageType === 'GLACIER' || fillSourceForm.storageType === 'WARM'"
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
            <el-row>
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
                  <span>{{ fillSourceForm.objectSize == -1 ? '无限制' : fillSourceForm.objectSize }} {{
                    fillSourceForm.unit == 'NULL' ? '' : fillSourceForm.unit }}</span>
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
                    v-for="(item,i) in renderUtilityRatio(fillSourceForm,false) "
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
                  <el-table-column
                    prop="gatewayAddress"
                    label="gateway地址"
                  />
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
            <!-- <div class="btn">
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
          </div> -->
          </el-form>
        </div>
      </div>
    </div>
    <el-dialog
      :title="isAdd?'创建负载':'修改负载'"
      :visible.sync="flag"
      width="1000px"
    >
      <el-form
        ref="form"
        class="createForm"
        :model="form"
        label-width="150px"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              label="负载组名称"
              prop="loadGroupName"
              :rules="rules.loadGroupName"
            >
              <el-input
                v-model="form.loadGroupName"
                placeholder="请输入2-64位英文、中文、数字、'_-."
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <span slot="label">
                默认负载
                <!-- <el-popover placement="top" width="250" trigger="hover" style="position:absolute;">
                  <p style="line-height:1.6;">默认负载在其他负载生效时将不可更改</p>
                  <i slot="reference" class="fa fa-question-circle" style="margin-left:10px" />
                </el-popover> -->
              </span>
              <!-- :disabled="isAdd?disableDefaultGroup:currentDefaultGroup" -->
              <el-radio-group
                v-model="form.defaultGroup"
                :disabled="disableDefaultGroup"
              >
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="是否启用"
              prop="isOpen"
            >
              <el-radio-group v-model="form.isOpen">
                <el-radio label="OPEN">是</el-radio>
                <el-radio label="CLOSE">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item prop="loadStrategy">
              <span slot="label">
                策略类型
                <el-popover
                  placement="top"
                  width="250"
                  trigger="hover"
                  style="position:absolute;"
                >
                  <p style="line-height:1.6;">AUTO:按资源的剩余空间大小自动调整写入的分配比例</p>
                  <i
                    slot="reference"
                    class="fa fa-question-circle"
                    style="margin-left:10px"
                  />
                </el-popover>
              </span>
              <el-radio-group v-model="form.loadStrategy">
                <el-radio label="AUTO">AUTO</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="负载用途"
              prop="groupTag"
            >
              <el-radio-group
                v-model="form.groupTag"
                class="groupTag"
                @change="changeGroupTag"
              >
                <el-radio
                  :disabled="disableGroupTag('WARM')"
                  label="WARM"
                >温存储</el-radio>
                <el-radio
                  :disabled="disableGroupTag('DATA')"
                  label="DATA"
                >冷存储</el-radio>
                <el-radio
                  :disabled="disableGroupTag('GLACIER')"
                  label="GLACIER"
                >冰存储</el-radio>
                <el-radio
                  :disabled="disableGroupTag('CACHE')"
                  label="CACHE"
                >缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="负载类型"
              prop="storageType"
            >
              <el-radio-group
                v-model="form.storageType"
                :disabled="!isAdd"
              >
                <el-radio
                  v-if="form.groupTag==='DATA'"
                  label="S3"
                >S3</el-radio>
                <el-radio
                  v-if="form.groupTag==='WARM'"
                  label="WARM"
                >温存储</el-radio>
                <el-radio
                  v-if="form.groupTag==='DATA'"
                  label="NAS"
                >NAS</el-radio>
                <el-radio
                  v-if="form.groupTag==='DATA'"
                  label="IAM"
                >AWS</el-radio>
                <el-radio
                  v-if="form.groupTag==='GLACIER'"
                  label="GLACIER"
                >冰存储</el-radio>
                <el-radio
                  v-if="form.groupTag==='CACHE'"
                  label="NAS"
                >NAS</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item>
            <span slot="label">
              选择资源
              <el-popover
                placement="top"
                width="300"
                trigger="hover"
                style="position:absolute;"
              >
                <p style="line-height:1.6;">负载组中不能添加不同类型的资源</p>
                <!-- <p style="line-height:1.6;">直接存储的负载组不支持缓存类型的资源</p>
                <p style="line-height:1.6;">缓存的负载组不支持直接存储类型的资源</p> -->
                <i
                  slot="reference"
                  class="fa fa-question-circle"
                  style="margin-left:10px"
                />
              </el-popover>
            </span>
            <el-button
              class="golden"
              @click="addResourceSel"
            >添加</el-button>
          </el-form-item>
          <el-form-item>
            <div
              v-for="(item,index) in form.items"
              :key="index + new Date()"
            >
              <div class="selResourceContainer">
                <el-form-item
                  label=" "
                  :prop="`items.${index}.resourceId`"
                  :rules="rules.resourceId"
                  required
                >
                  <el-cascader
                    :ref="`cascader${index}`"
                    v-model="item.resourceId"
                    popper-class="resCascader"
                    placeholder="请选择存储资源"
                    :show-all-levels="false"
                    :options="disableCascader()"
                    :props="{ expandTrigger:'hover' }"
                    clearable
                  >
                    <template slot-scope="{ node, data }">
                      <el-popover
                        placement="top-start"
                        title="已关联负载组"
                        trigger="hover"
                      >
                        <p
                          v-for="t in data.loadGroupName"
                          :key="t"
                          style="line-height:1.6;"
                        >{{ t }}</p>
                        <i
                          v-if="data.loadGroupName"
                          slot="reference"
                          class="fa fa-exclamation-circle"
                          :style="[{opacity:data.loadGroupName.length?1:0},'position:relative,right:5px']"
                        />
                      </el-popover>
                      <span
                        v-if="node.isLeaf"
                        style="margin-right:10px"
                      >
                        <el-tag class="cascaderTag"> {{ data.storageType === 'IAM' ? 'AWS': data.storageType === 'GLACIER'?'冰存储': data.storageType === 'WARM'?'温存储': data.storageType }} </el-tag>
                        <el-tag
                          v-if="data.type==='CACHE'"
                          class="cascaderTag"
                        >缓存</el-tag>
                        <el-tag
                          v-else-if="data.storageType==='NAS'"
                          class="cascaderTag"
                        >直接存储</el-tag>
                      </span>
                      <span>{{ data.label }}</span>
                      <span v-if="!node.isLeaf"> ({{ renderAccessResCount(data.children) }}) </span>
                    </template>
                  </el-cascader>
                </el-form-item>
                <el-form-item :prop="`items.${index}.isOpen`">
                  <el-radio-group
                    v-model="item.isOpen"
                    style="margin-left:55px"
                  >
                    <el-radio :label="1">启用</el-radio>
                    <el-radio :label="0">禁用</el-radio>
                  </el-radio-group>
                </el-form-item>
                <i
                  v-if="form.items.length!==1"
                  class="el-icon-delete delBtn"
                  @click="delResourceSel(index)"
                />
              </div>
            </div>
          </el-form-item>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="blue"
          @click="flag = false"
        >{{ $ts('button.cancel') }}</el-button>
        <el-button
          class="golden"
          type="primary"
          @click="confirmCreate"
        >{{ $ts('button.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="删除负载组"
      :visible.sync="deleteFlag"
      width="650px"
    >
      <p>{{ `删除如下负载组: ${selectLoadGroup.loadGroupName}` }}
      </p>
      <div slot="footer">
        <el-button
          class="blue"
          @click="deleteFlag = false"
        >{{ $ts('cancel') }}</el-button>
        <el-button
          type="primary"
          class="golden"
          @click="confirmDelete"
        >{{ $ts('delete') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getResourceStatus,
  putLoadGroup,
  getGroupList,
  deleteLoadGroup,
  putSwitch,
  putSwitchItem,
  listStorageDevice
} from '@/api/storage'
export default {
  name: 'LoadGroup',
  data() {
    return {
      listenGroupType: '',
      stateParams: {},
      asyncTaskList: {},
      selResourceId: '',
      showDetailContent: '',
      currentDefaultGroup: true,
      opt: 'add',
      selectLoadGroup: {},
      deleteFlag: false,
      filterSelResource: [],
      storageTypeEnu: {
        'OK': '连接正常',
        'NULL': ' 未检测'
      },
      treeOpt: {
        label: 'loadGroupName',
        id: 'id',
        children: 'items'
      },
      tableData: [],
      fillForm: {},
      fillSourceForm: {},
      innerFormLoading: false,
      loading: false,
      filterText: '',
      flag: false,
      form: {
        loadStrategy: false,
        resourceId: false,
        items: [
          {
            resourceId: '',
            enable: true
          }
        ],
        storageType: 'S3',
        defaultGroup: false,
        groupTag: 'DATA',
        isOpen: true,
        loadGroupName: ''
      },
      requestForm: {},
      resourceListSel: [],
      rules: {
        loadGroupName: {
          required: true,
          trigger: ['blur', 'change'],
          message: "请输入2-64位英文、中文、数字、'_-.'",
          pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5\-\.]{2,64}$/
        },
        resourceId: [{
          validator: (data, val, cb) => {
            if (!val || (val && !val.length)) {
              return cb('请选择存储资源')
            } else {
              return cb('')
            }
          },
          trigger: ['blur', 'change']
        },
        {
          required: true
        }
        ]
      },
      changeStorageTypeFlag: false
    }
  },
  computed: {
    isAdd() {
      return this.opt === 'add'
    },
    // judgeSelItem () {
    //   const exist = this.resourceListSel.find(x => this.selResourceId && this.selResourceId.indexOf(x.storageName) > -1)
    //   return exist
    // },
    disableDefaultGroup() {
      // CACHE、DATA
      // this.form.groupTag
      // 新增和修改区分
      // 使用用途接入判断
      if (this.isAdd) {
        // 列出默认负载
        const existDefault = this.tableData.filter(x => x.defaultGroup)
        if (!existDefault.length) {
          return false
        } else {
          // 有默认负载、需判断默认负载类型和当前选择类型是否一致
          return existDefault.some(x => x.groupTag === this.form.groupTag)
          // return this.form.groupTag === 'CACHE' ? existDefault.some(x => x.groupTag === 'CACHE') : existDefault.some(x => x.groupTag === 'DATA')
        }
      } else {
        const obj = JSON.parse(JSON.stringify(this.selectLoadGroup))
        const { id } = obj
        const existDefault = this.tableData.filter(x => x.defaultGroup)
        if (!existDefault.length) {
          return false
        } else {
          // 数据及缓存负载组 匹配当前所选的id、
          const existCache = existDefault.filter(x => x.groupTag === 'CACHE')
          const existDATA = existDefault.filter(x => x.groupTag === 'DATA')
          const existGLACIER = existDefault.filter(x => x.groupTag === 'GLACIER')
          const existWARM = existDefault.filter(x => x.groupTag === 'WARM')
          // 不同于创建、需要判断当前选中的原先是否
          // 存在cache、故切换cache默认时需提前判断是否是其本身、切换data需判断是否
          if (this.form.groupTag === 'CACHE') {
            // true不禁用、反之、确认是否有
            const isValid = existCache.some(x => x.id === id)
            return isValid ? false : !!existCache.length
          } else if (this.form.groupTag === 'DATA') {
            const isValid = existDATA.some(x => x.id === id)
            return isValid ? false : !!existDATA.length
          } else if (this.form.groupTag === 'GLACIER') {
            const isValid = existGLACIER.some(x => x.id === id)
            return isValid ? false : !!existGLACIER.length
          } else if (this.form.groupTag === 'WARM') {
            const isValid = existWARM.some(x => x.id === id)
            return isValid ? false : !!existWARM.length
          } else {
            return false
          }
        }
      }
    },
    choseResource() {
      return this.form.items.filter(x => x.resourceId.length)
    }
  },
  watch: {
    'form.groupTag'(cur, pre) {
      this.listenGroupType = pre
    },
    'form.storageType'(cur, pre) {
      if (this.changeStorageTypeFlag || !this.isAdd) return
      if (this.choseResource && this.choseResource.length) {
        this.$confirm('更改负载类型将会清空已选择的资源,是否继续?', '请确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => {
          this.form.items = [{
            resourceId: '',
            isOpen: 1
          }]
        }).catch(() => {
          this.changeStorageTypeFlag = true
          this.form.storageType = pre
          setTimeout(() => {
            this.changeStorageTypeFlag = false
          }, 200)
        })
      }
    },
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    flag(val) {
      if (val && this.isAdd) {
        this.initForm()
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    renderStorageType(type) {
      return type === 'IAM' ? 'AWS' : type === 'GLACIER' ? '冰存储' : type === 'WARM' ? '温存储' : type
    },
    disableGroupTag(type) {
      if (!this.isAdd) return true
      else {
        const { defaultGroup } = this.form
        if (!defaultGroup) {
          // 无默认
          return false
        } else {
          // 存在默认、默认负载类型与当前所选不一致、且所选类型与对应不重合
          return this.tableData.some(x => x.defaultGroup && x.groupTag === type)
        }
      }
    },
    clearStateParams() {
      this.stateParams = {}
    },
    transRegion(val) {
      if (val === 'ap-east-1') return '亚太地区(香港)'
      else return '-'
    },
    changeGroupTag(val) {
      // 修改用途得同步负载类型、同步资源交给watch监听 负载类型
      const change = this.listenGroupType
      if (this.choseResource && this.choseResource.length) {
        this.$confirm('更改负载用途将会清空已选择的资源,是否继续?', '请确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }).then(() => {
          this.form.items = [{
            resourceId: '',
            isOpen: 1
          }]
          // data 冷存储默认负载类型S3
          if (val === 'DATA') {
            this.form.storageType = 'S3'
          } else if (val === 'CACHE') {
            this.changeStorageTypeFlag = true
            this.form.storageType = 'NAS'
            setTimeout(() => {
              this.changeStorageTypeFlag = false
            }, 200)
          } else if (val === 'GLACIER') {
            this.changeStorageTypeFlag = true
            this.form.storageType = 'GLACIER'
            setTimeout(() => {
              this.changeStorageTypeFlag = false
            }, 200)
          } else if (val === 'WARM') {
            this.changeStorageTypeFlag = true
            this.form.storageType = 'WARM'
            setTimeout(() => {
              this.changeStorageTypeFlag = false
            }, 200)
          }
        }).catch(() => {
          this.changeStorageTypeFlag = true
          this.form.groupTag = change
          setTimeout(() => {
            this.changeStorageTypeFlag = false
          }, 200)
        })
      } else {
        if (val === 'DATA') {
          this.form.storageType = 'S3'
        } else if (val === 'CACHE') {
          this.form.storageType = 'NAS'
        } else if (val === 'GLACIER') {
          this.form.storageType = 'GLACIER'
        } else if (val === 'WARM') {
          this.form.storageType = 'WARM'
        }
      }
    },
    renderAccessResCount(arr) {
      return arr.filter(x => !x.disabled).length
    },
    // 选择资源 添加 资源限制
    disableCascader() {
      const choseResource = this.form.items.map(x => x.resourceId[1]) // 已添加到配置项的资源
      // 筛选可选资源条件、重复添加及对应类型
      return this.filterSelResource.map(x => {
        x.children && x.children.map(t => {
          //
          if (this.form.storageType === 'NAS') {
            if (this.form.groupTag === 'DATA') {
              t.disabled = choseResource.includes(t.value) || t.type !== 'DEFAULT' || t.storageType !== this.form.storageType
            } else {
              t.disabled = choseResource.includes(t.value) || t.type !== 'CACHE' || t.storageType !== this.form.storageType
            }
          } else {
            t.disabled = choseResource.includes(t.value) || t.storageType !== this.form.storageType
          }
          // warm也支持
          // const duplicated = choseResource.includes(t.value)
          // let flag = false
          // if (this.form.storageType == 'S3') {
          //   flag = this.form.groupTag === 'DATA' ? t.storageType !== 'S3' : t.storageType !== 'WARM'
          // } else if (this.form.storageType === 'GLACIER') {
          //   flag = t.storageType !== 'GLACIER'
          // }
          // t.disabled = duplicated || flag
          //  || (this.form.groupTag === 'DATA' && t.type === 'CACHE') || (this.form.groupTag === 'CACHE' && t.type !== 'CACHE')
        })
        return x
      })
      // const choseResourceType = this.resourceListSel.reduce((pre, cur) => {
      //   choseResource.includes(cur.resourceId) && pre.push(cur.storageType)
      //   return pre
      // }, []) // 已添加的资源类型
      // return this.filterSelResource.map(x => {
      //   x.children && x.children.map(t => {
      //     // 直接存储的负载组、需要解决S3和nas混合使用
      //     t.disabled = (new Set([...choseResourceType, t.storageType]).size === 2 && choseResource.length > 1 && (choseResourceType.filter(x => x == this.judgeSelItem?.storageType).length !== 1)) ||
      //     choseResource.includes(t.value) || // 2重复资源
      //        (this.form.groupTag === 'CACHE' && t.type !== 'CACHE') || // 3缓存添加非缓存资源
      //       (this.form.groupTag === 'DATA' && t.type === 'CACHE') // 4存储添加缓存资源
      //   })
      //   return x
      // })
    },
    // 处理cascader点击时获取当前项、并判断当前项是否满足相关条件||
    // @click.native="$event=>handleFocus(index,$event)"
    // handleFocus (index, row) {
    //   const { target } = row
    //   this.selResourceId = target.value
    //   setTimeout(() => {
    //     this.$nextTick(() => {
    //       // 修复获取禁用条件未及时弹窗问题
    //       this.$refs[`cascader${index}`][0].toggleDropDownVisible(true)
    //     })
    //   }, 100)
    // },
    filterMethods(node, val) {
      return node.label.toLowerCase().indexOf(val.toLowerCase()) > -1
    },
    // judgeGroupTag (val) {
    // const change = val === 'DATA' ? 'CACHE' : 'DATA'
    // const choseResource = this.form.items.filter(x => x.resourceId)
    // if (choseResource.length) {
    //   this.$confirm('更改负载类型将会清空已选择的资源,是否继续?', '请确认', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning',
    //     dangerouslyUseHTMLString: true
    //   }).then(() => {
    //     this.form.items = [{
    //       resourceId: '',
    //       isOpen: 1
    //     }]
    //   }).catch(() => {
    //     this.form.groupTag = change
    //   })
    // }
    // if (this.disableDefaultGroup) {
    //   console.log('66')
    //   // 更改用途后需判断、是否所有的默认负载存在使用用途如所选的
    //   const notValid = this.tableData.filter(x => x.defaultGroup).some(x => x.groupTag === val)
    //   if (notValid && this.form.defaultGroup) {
    //     const text = val === 'DATA' ? '直接存储' : '缓存'
    //     setTimeout(() => {
    //       this.form.groupTag = change
    //       this.$ts({
    //         type: 'warn',
    //         text: `当前${text}的默认负载已存在，请更改`
    //       })
    //     }, 50)
    //   }
    // }
    // },
    handleDemi(row, _, value) {
      value = value === '0' ? '0' : String(value)
      const reg = /\B(?=(\d{3})+(?!\d))/g
      return value.replace(reg, ',')
    },
    renderUtilityRatio(data, showForLoadGroup = true) {
      const {
        usedSpace,
        unit,
        objectSize
      } = data
      if (String(objectSize) === '-1') {
        return showForLoadGroup ? [{ val: '无容量上限' }] : [{ val: '' }]
      } else {
        const quotaSize = unit === 'GB' ? objectSize * 1024 ** 3 : objectSize * 1024 ** 4
        const val = (usedSpace / quotaSize) * 100
        const color = parseInt(val) >= 90 ? '#d75a78' : parseInt(val) >= 70 ? '#ff8746' : ''
        return showForLoadGroup
          ? [{
            color,
            val: (val ? val.toFixed(1) : 0) + '%'
          }] : [{
            color,
            val: '(' + (val ? val.toFixed(1) : 0) + '%)'
          }]
      }
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
          icon = 'loadGroupDanger'
      }
      return '#icon-' + icon
    },
    init() {
      this.loading = true
      const ResourceList = listStorageDevice()
      const GroupList = getGroupList()
      Promise.allSettled([ResourceList, GroupList]).then(res => {
        // console.log('init', '===============', res)
        // console.log('%c ↑', 'color:red;font-size:20px')
        // list添加资源名称、

        // 初始化list、无设备资源及负载组、此处全空、
        if (res[1].value) {
          // this.tableData = []
          // this.mapResourceItems([])
          this.tableData = (res[1].value.data || []).sort((a, b) => {
            return b.defaultGroup - a.defaultGroup
          })
          if (res[0].value) {
            if (res[0].value.data && !res[0].value.data.length) {
              return this.$notify.error('请先创建存储资源')
            } else {
              this.mapResourceItems(res[0].value.data)
            }
          }
        } else {
          this.tableData = []
          this.loading = false
        }
      })
      // return getGroupList().then(res => {
      //   this.tableData = res.data || []
      //   return Promise.resolve(res.data)
      // })
      // .catch(() => {
      //   const res = {
      //     data: [
      //       {
      //         loadGroupName: 'loadGroup1',
      //         defaultGroup: true,
      //         isOpen: true,
      //         groupTag: 'DATA',
      //         items: [
      //           {
      //             resourceId: 1
      //           },
      //           {
      //             resourceId: 2
      //           }
      //         ]
      //       }
      //     ]
      //   }
      //   this.tableData = res.data
      //   return Promise.resolve(res.data)
      // })
    },
    // getSingleResourceStatus (resourceId, id) {
    //   const taskId = resourceId + '' + id
    //   this.asyncTaskList[taskId] = false
    //   return new Promise((resolve) => {
    //     getResourceStatus({
    //       resourceId
    //     }).then(res => {
    //       const errorStatus = res.data.filter(x => x.resourceStatus !== 'OK')
    //       if (!errorStatus.length) {
    //         resolve('GREEN')
    //       } else if (errorStatus.length === res.data.length) {
    //         resolve('danger')
    //       } else {
    //         resolve('YELLOW')
    //       }
    //     }).catch(() => {
    //       resolve('danger')
    //     })
    //       .finally(() => {
    //         this.asyncTaskList[taskId] = true
    //       })
    //   })
    // },
    // 展示负载组（默认及选中）
    showDefaultGroup() {
      if (this.tableData && this.tableData.length) {
        if (JSON.stringify(this.selectLoadGroup) !== '{}') {
          const id = this.selectLoadGroup.id || ''
          const flag = this.tableData.find(x => x.id === id)
          if (flag && flag.id) {
            this.$refs['tree'].setCurrentKey(flag.id)
            this.getInfo(flag)
          } else {
            // 跳转页面非负载组或前一次选中节点非负载组、加载资源
            const id = this.selectLoadGroup.id
            this.$refs['tree'].setCurrentKey(id)
            this.getInfo(this.selectLoadGroup)
            // const existDefault = this.tableData.find(x => {
            //   return x.defaultGroup
            // })
            // if (existDefault) {
            //   this.$refs['tree'].setCurrentKey(existDefault.id)
            //   this.getInfo(existDefault)
            // } else {
            //   this.$refs['tree'].setCurrentKey(this.tableData[0].id)
            //   this.getInfo(this.tableData[0])
            // }
          }
        } else {
          const existDefault = this.tableData.find(x => {
            return x.defaultGroup
          })
          if (existDefault) {
            this.$refs['tree'].setCurrentKey(existDefault.id)
            this.getInfo(existDefault)
          } else {
            this.$refs['tree'].setCurrentKey(this.tableData[0].id)
            this.getInfo(this.tableData[0])
          }
        }
      }
    },
    mapResourceItems(val) {
      // val: 设备资源list添加映射、展示loadGroup下资源名称及相关信息
      if (val && val.length) {
        this.resourceListSel = val.reduce((pre, cur) => {
          const mapItems = cur.storageResourceModelList.map(x => {
            x.deviceName = cur.deviceName
            x.loadGroupName = x.storageName
            return x
          })
          pre.push(...mapItems)
          return pre
        }, []).map(x => {
          return {
            loadGroupName: x.storageName,
            ...x
          }
        })
      } else {
        this.resourceListSel = []
      }
      const obj = this.resourceListSel.reduce((pre, cur) => {
        if (!pre[cur.resourceId]) {
          pre[cur.resourceId] = { ...cur }
        }
        return pre
      }, {})
      this.tableData = this.tableData.map(x => {
        if (x.items && x.items.length) {
          x.items.map(t => {
            // 映射资源detail到loadGroup中
            const {
              resourceId
            } = t
            if (resourceId in obj) {
              // 处理展示资源关联负载组
              let activeLoad = obj[String(resourceId)]['activeLoad']
              activeLoad = activeLoad && activeLoad.length ? activeLoad.concat([x.loadGroupName]) : [x.loadGroupName]
              obj[String(resourceId)]['activeLoad'] = activeLoad
              // console.log(activeLoad, '=======', x.loadGroupName)
              Object.assign(t, {
                ...obj[String(resourceId)]
              })
              // 保留负载组下资源过滤
              t.loadName = x.loadGroupName
              t.id = x.id + '' + resourceId
              // t.resourceStatus = await this.getSingleResourceStatus(resourceId, x.id)
            }
          })
        }
        return x
      })

      // 展示级联选择器
      this.filterSelResource = val.map(x => {
        const temp = {}
        Object.assign(temp, {
          label: x.deviceName,
          value: x.deviceId,
          children: x.storageResourceModelList.map(t => {
            const arr = []
            obj[t.resourceId]['activeLoad'] && arr.push(
              ...obj[t.resourceId]['activeLoad']
            )
            return {
              label: t.storageName,
              value: t.resourceId,
              loadGroupName: arr,
              type: t.storageUseType,
              storageType: t.storageType
            }
          })
        })
        return temp
      })
      this.loading = false
      this.$nextTick(() => {
        this.showDefaultGroup()
      })
      //
      // const keepLoad = () => {
      //   const flag = Object.keys(this.asyncTaskList).some(x => !this.asyncTaskList[x])
      //   if (flag) {
      //     setTimeout(() => {
      //       keepLoad()
      //     }, 200)
      //   } else {
      //     this.loading = false
      //     this.$nextTick(() => {
      //       this.stateParams = JSON.parse(JSON.stringify(this.$route.params))
      //       // console.log(this.$route.params, '1233', this.stateParams)
      //       if (this.$route.params.loadGroupName) {
      //         this.filterText = this.$route.params.loadGroupName
      //         this.selectLoadGroup = this.tableData.find(x => x.loadGroupName === this.filterText)
      //       }
      //       if (this.$route.params.resourceName) {
      //         this.filterText = this.$route.params.resourceName
      //         const flag = this.tableData.find(x => x.loadGroupName === this.$route.params.resourceLoadGroup)
      //         if (flag) {
      //           this.selectLoadGroup = flag.items.find(x => x.loadGroupName === this.filterText)
      //           // console.log(this.selectLoadGroup, 'selectLoadGroup', this.filterText, flag)
      //         }
      //       }
      //       this.showDefaultGroup()
      //     })
      //   }
      // }
      // keepLoad()
    },
    delResourceSel(index) {
      this.form.items.splice(index, 1)
    },
    addResourceSel() {
      this.form.items.push({
        resourceId: '',
        isOpen: 1
      })
    },
    initForm() {
      this.form = {
        loadGroupName: '',
        loadStrategy: 'AUTO',
        resourceId: false,
        defaultGroup: false,
        isOpen: 'OPEN',
        groupTag: 'DATA',
        storageType: 'S3',
        items: [{
          resourceId: '',
          isOpen: 1
        }]
      }
      this.$nextTick(() => {
        this.$refs['form'].clearValidate()
      })
    },
    filterNode(value, data) {
      if (!value) return true
      else {
        // 跳转页面后、需把路由信息记录、用于首次过滤、后续过滤不经过此处过滤
        if (JSON.stringify(this.stateParams) !== '{}') {
          // 路由跳转搜索 负载组名称、负载组下资源也展示
          const params = this.$route.params
          if ('resourceName' in this.stateParams) {
            // 仅展示该负载组下的资源、需过滤其他负载组下的同资源
            // resourceLoadGroup
            return data.loadGroupName.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1 && (data.loadName && data.loadName.indexOf(this.$route.params.resourceLoadGroup) > -1)
          } else if ('loadGroupName' in params) {
            return data.loadGroupName.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1 || (data.loadName && data.loadName.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1)
          }
        } else {
          return data.loadGroupName.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1
        }
      }
    },
    // 负载组详情展示
    // 展示资源、启用禁用、 默认负载auto、策略类型auto
    getInfo(node) {
      this.selectLoadGroup = node
      const keys = Object.keys(node)
      if (keys.includes('loadStrategy')) {
        this.showDetailContent = 'loadGroup'
        this.fillForm = JSON.parse(JSON.stringify(node))
        this.renderGatewayStatus(node)
      } else {
        // 展示资源详情（待定）
        this.showDetailContent = 'resource'
        this.fillSourceForm = node
        this.innerFormLoading = true
        getResourceStatus({
          resourceId: node.resourceId
        }).then((res) => {
          this.fillSourceForm.gateway = res.data || []
        }).finally(() => {
          this.innerFormLoading = false
        })
      }
      // 校验是否是负载组、匹配负载组才不展示默认资源或设备
      // 触发负载的点击、获取详情后、通过父组件刷新或其他事件后展示该负载、
    },
    renderGatewayStatus(node) {
      this.innerFormLoading = true
      const allStatus = node.items && node.items.map(x => {
        return new Promise((resolve, rej) => {
          getResourceStatus({ resourceId: x.resourceId }).then(res => {
            resolve({
              data: res.data,
              storageName: x.storageName
            })
          }).catch(() => {
            rej([])
          })
        })
      }) || []
      Promise.allSettled(allStatus).then(res => {
        const allGateway = res.filter(x => x.value && x.value.data).reduce((pre, cur) => {
          const item = cur.value.data.map(t => {
            t.storageName = cur.value.storageName
            return t
          })
          pre.push(...item)
          return pre
        }, [])
        const obj = {}
        // 合并gateway
        // console.log(obj, allGateway, '555')
        // return
        // 处理资源连接状态和资源名称合并、建议一个数组保存状态
        this.fillForm.gateway = allGateway.reduce((pre, cur) => {
          if (!obj[cur.gatewayAddress]) {
            obj[cur.gatewayAddress] = true
            const {
              resourceStatus,
              storageName
            } = cur

            const temp = Object.assign(cur, {
              resourceList: [{ resourceStatus, storageName }]
            })
            pre.push(temp)
          } else {
            const index = pre.findIndex(x => x.gatewayAddress === cur.gatewayAddress)
            // console.log(pre, index, '============')
            pre[index].resourceList = pre[index].resourceList.concat({
              resourceStatus: cur.resourceStatus, storageName: cur.storageName
            })
          }
          return pre
        }, [])
        this.innerFormLoading = false
      })
    },
    judgeChange(row) {
      // 更改开关
      const index = this.fillForm.items.findIndex(x => {
        return x.resourceId === row.resourceId
      })
      this.$set(this.fillForm.items[index], 'status', !row.status)
      // fetch api
    },
    updateForm() {
      this.opt = 'update'
      this.flag = true
      // console.log(this.selectLoadGroup, '1233')
      const {
        loadGroupName,
        defaultGroup,
        isOpen,
        groupTag,
        loadStrategy,
        id,
        items,
        storageType
      } = JSON.parse(JSON.stringify(this.selectLoadGroup))
      const mapItems = items && items.map(x => {
        return {
          isOpen: x.isOpen,
          resourceId: [x.deviceId, x.resourceId]
        }
      }) || [{
        resourceId: '',
        isOpen: 1
      }]
      this.currentDefaultGroup = !defaultGroup
      // 关联资源数据回填、
      // console.log(this.form, '1233')
      // 修改
      this.$set(this, 'form', {
        loadGroupName,
        loadStrategy,
        defaultGroup,
        isOpen,
        groupTag,
        items: mapItems,
        id,
        storageType
      })
      this.requestForm = JSON.parse(JSON.stringify(this.form))
      // console.log(this.selectLoadGroup, '1233', this.form)
    },
    confirmDelete() {
      deleteLoadGroup({
        loadGroupId: this.selectLoadGroup.id
      }).then(res => {
        this.deleteFlag = false
        this.selectLoadGroup = {}
        this.init()
      })
    },
    confirmCreate() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          const {
            defaultGroup,
            groupTag,
            isOpen,
            loadGroupName,
            items,
            id,
            storageType
          } = this.form
          const mapItems = items.map(x => {
            return {
              isOpen: x.isOpen,
              resourceId: x.resourceId[1]
            }
          })
          // console.log(this.form, '1233')
          const obj = {}
          if (this.isAdd) {
            Object.assign(obj, {
              defaultGroup,
              groupTag,
              isOpen,
              loadGroupName,
              items: mapItems,
              storageType
            })
            putLoadGroup(obj).then(res => {
              this.$ts({
                type: 'success',
                text: '操作成功'
              })
              this.flag = false
            }).finally(() => {
              this.init()
            })
          } else {
            // 修改负载组三个case、
            let mapAsync = []
            const reqParams = Object.keys(this.form).reduce((cur, pre) => {
              const newVal = this.form[pre]
              const oldVal = this.requestForm[pre]
              if (typeof newVal !== 'object' && typeof oldVal !== 'object') {
                if (newVal !== oldVal) {
                  cur[pre] = newVal
                }
              } else {
                const newValIds = this.form['items'].map(x => x.resourceId[1]).sort((a, b) => Number(a) - Number(b))
                const oldIds = this.requestForm['items'].map(x => x.resourceId[1]).sort((a, b) => Number(a) - Number(b))
                if (JSON.stringify(newValIds) === JSON.stringify(oldIds)) {
                  // 资源无添加删除、下面判断是否更改资源状态
                  const diff = this.form['items'].filter(x => {
                    return this.requestForm['items'].some(y => {
                      return x.resourceId[1] === y.resourceId[1] && x.isOpen !== y.isOpen
                    })
                  })
                  // 更改资源状态
                  if (diff.length) {
                    // 额外调用switch开关
                    mapAsync = diff.map(x => {
                      return putSwitchItem({
                        loadGroupId: id,
                        open: x.isOpen,
                        resourceId: x.resourceId[1]
                      })
                    })
                  }
                } else {
                  // 添加/删除资源
                  cur[pre] = newVal.map(x => {
                    return {
                      isOpen: x.isOpen,
                      resourceId: x.resourceId[1]
                    }
                  })
                }
                // 移除重新添加切换顺序也不算更改、此处加入比较是否更改负载组资源逻辑、调用switch接口
              }
              // newVal !== oldVal ? cur[pre] = newVal : null
              return cur
            }, {})
            const keys = Object.keys(reqParams)
            Object.assign(obj, {
              id,
              defaultGroup,
              groupTag,
              loadGroupName,
              storageType,
              isOpen: keys.includes('isOpen') ? this.requestForm['isOpen'] : isOpen,
              items: mapItems
            })
            if (keys && keys.length) {
              // 此处判断是否需要调用change
              if (!keys.includes('isOpen')) {
                if (mapAsync.length) {
                  Promise.allSettled(mapAsync).then(() => {
                    putLoadGroup(obj).then(() => {
                      this.$ts({
                        type: 'success',
                        text: '操作成功'
                      })
                      this.flag = false
                    }).finally(() => {
                      this.init()
                    })
                  })
                } else {
                  putLoadGroup(obj).then(() => {
                    this.$ts({
                      type: 'success',
                      text: '操作成功'
                    })
                    this.flag = false
                  }).finally(() => {
                    this.init()
                  })
                }
              } else if (keys.includes('isOpen') && keys.length > 1) {
                // 调用顺序
                if (mapAsync.length) {
                  Promise.allSettled(mapAsync).then(() => {
                    putLoadGroup(obj).then(() => {
                      putSwitch({
                        loadGroupId: id,
                        open: isOpen === 'CLOSE' ? 0 : 1
                      }).then(() => {
                        this.$ts({
                          type: 'success',
                          text: '操作成功'
                        })
                        this.flag = false
                      }).finally(() => {
                        this.init()
                      })
                    })
                  })
                } else {
                  putLoadGroup(obj).then(() => {
                    putSwitch({
                      loadGroupId: id,
                      open: isOpen === 'CLOSE' ? 0 : 1
                    }).then(() => {
                      this.$ts({
                        type: 'success',
                        text: '操作成功'
                      })
                      this.flag = false
                    }).finally(() => {
                      this.init()
                    })
                  })
                }
              } else if (keys.includes('isOpen') && keys.length == 1) {
                if (mapAsync.length) {
                  Promise.allSettled(mapAsync).then(() => {
                    putSwitch({
                      loadGroupId: id,
                      open: isOpen === 'CLOSE' ? 0 : 1
                    }).then(() => {
                      this.$ts({
                        type: 'success',
                        text: '操作成功'
                      })
                      this.flag = false
                    })
                      .finally(() => {
                        this.init()
                      })
                  })
                } else {
                  putSwitch({
                    loadGroupId: id,
                    open: isOpen === 'CLOSE' ? 0 : 1
                  }).then(() => {
                    this.$ts({
                      type: 'success',
                      text: '操作成功'
                    })
                    this.flag = false
                  })
                    .finally(() => {
                      this.init()
                    })
                }
              }
            } else {
              // 仅修改资源开关
              if (mapAsync.length) {
                Promise.allSettled(mapAsync).then(res => {
                  const flag = res.every(x => x.stauts !== 'rejected')
                  if (flag) {
                    this.$ts({
                      type: 'success',
                      text: '操作成功'
                    })
                    this.flag = false
                  }
                })
                  .finally(() => {
                    this.init()
                  })
              } else {
                // 无事发生
                this.flag = false
              }
              // 啥也没有、负载组字段修改、资源状态修改
            }
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .treeContent {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  .content {
    flex: 1;
    min-height: 300px;
  }
  .tree {
    width: 35%;
    min-width: 400px;
    margin-right: 30px;
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
        width: 100%;
        align-items: center;
        // justify-content: space-between;
        .resourcename {
          max-width: 60%;
          overflow: hidden;
          width: 60%;
          position: relative;
          top: -2px;
          & + div {
            margin-left: 5%;
            min-width: 195px;
            padding-bottom: 6px;
          }
          .el-tag {
            width: 72px;
          }
        }
      }
      .deviceContainer {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        width: 100%;
        // justify-content: space-between;
        .deviceIcon {
          max-width: 60%;
          overflow: hidden;
          width: 60%;
          position: relative;
          top: -2px;
          line-height: 25px;
          & + div {
            min-width: 195px;
            margin-left: calc(5% + 8px);
            // padding-bottom: 6px;
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
      .block {
        width: 20px;
        height: auto;
        display: inline-block;
      }
      .tagContainer {
        float: right;
      }
      .deviceIcon {
        position: relative;
        top: -2px;
      }

      .fw {
        font-weight: bold;
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
}

.cascaderTag.el-tag {
  color: #e39606 !important;
  background-color: #384348;
  border-color: transparent;
  height: 22px;
  line-height: 20px;
  border-radius: 20px;
  margin: 0 5px;
  width: fit-content;
  text-align: center;
}

:deep(.createForm) {
  label.el-form-item__label {
    margin-left: -20px;
  }
  .groupTag{
    .el-radio{
      margin-right: 20px;
    }
  }
  .selResourceContainer {
    margin-bottom: 15px;
    display: flex;
    // justify-content: space-between;
    align-items: center;
    .el-form-item {
      &:first-of-type {
        width: 45%;
        .el-cascader {
          width: 100%;
        }
        label {
          width: 0px !important;
          margin-left: -5px;
          padding-right: 0;
          & + .el-form-item__content {
            margin-left: 10px !important;
          }
        }
      }
    }
  }
  .delBtn {
    margin-left: 100px;
    color: #ff8746;
    cursor: pointer;
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
  .el-form-item__content {
    word-break: break-word;
    flex: 1;
    margin-right: 15px;
  }
  label.el-form-item__label {
    width: 50% !important;
    min-width: 120px;
    margin-left: 0 !important;
    font-size: 15px;
    color: #97a2a8 !important;
    font-weight: bold;
  }
  .btn {
    margin: 30px 0 0 0px;
  }
  .el-table {
    background-color: #36464e !important;
  }
}

:deep(.innerTable) {
  .el-table__header-wrapper {
    display: none;
    & + .el-table__body-wrapper {
      table {
        tbody {
          tr td {
            &:first-of-type {
              padding-left: 20%;
              box-sizing: border-box;
            }
          }
          .cell {
            padding: 0;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.resCascader {
  .el-cascader-node.is-disabled {
    color: #4e565d;
  }
}
</style>
