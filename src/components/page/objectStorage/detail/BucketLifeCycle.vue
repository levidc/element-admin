<template>
  <div class="mv_10">
    <div class="bucket-detail">
      <div class="bucket-detail-inner">
        <div class="bucket-panel">
          <div id="lifeCycle-info-field" class="param-box">
            <div class="param-hd">
              <h3 id="lifeCycle">{{ $ts('route.BucketLifeCycle') }}</h3>
            </div>
            <!-- <div class="bucket-18-input-tips mt-10">
              注：可以配置规则用于定期沉降文件、删除文件和未上传完成的文件碎片。<br>
              <span style="margin-left: 2em">
                由于低频和归档存储类型的对象规格限制，沉降后的对象有最小规格限制，您的存储用量可能增加。
              </span>
            </div> -->
            <div v-loading="loading" class="param-bd">
              <el-row class="mv_10 clearfix">
                <div class="left">
                  <el-button type="primary" class="blue" :disabled="operateDisable" @click="visibleFlagInfo = true">{{
                    $ts('page.detail') }}</el-button>
                  <el-button v-access="'s3:PutLifecycleConfiguration'" class="blue" type="primary"
                    :disabled="operateDisable" @click="addModBtn('modify')">{{ $ts('page.modify') }}</el-button>
                  <el-button v-access="'s3:PutLifecycleConfiguration'" type="danger" class="red"
                    :disabled="deleteDisable" @click="delLifecycle">{{ $ts('page.delete') }}</el-button>
                  <el-button v-access="'s3:PutLifecycleConfiguration'" class="golden" @click="addModBtn('add')">{{
                    $ts('page.create') }}</el-button>
                </div>
                <div class="right">
                  <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
                    <i class="el-icon-refresh" @click="getBucketLifecycle" />
                  </el-tooltip>
                </div>
              </el-row>
              <el-input v-model="searchName" class="searchIpt" clearable
                :placeholder="$ts('bucket.searchLifeCycleRuleName')" />
              <el-table ref="multipleTable" :data="tableSlicePage" border tooltip-effect="dark" style="width: 100%"
                :row-key="(row) => row.ID" highlight-current-row @selection-change="handleSelection">
                <!-- @current-change="handleRowChange" -->
                <!-- <el-table-column label="" width="50" center>
                  <template slot-scope="scope">
                    <el-radio
                      v-model="radio"
                      class="radio"
                      :label="scope.$index"
                      @change.native="getCurrentRow(scope.row)"
                    >&nbsp;
                    </el-radio>
                  </template>
</el-table-column> -->
                <!-- <el-table-column type="selection" width="55" reserve-selection /> -->
                <el-table-column type="selection" />
                <el-table-column prop="ID" :label="$ts('bucket.lifeCycleRuleName')" sortable>
                  <template slot-scope="scope">
                    <el-button type="text" @click="handleClickName(scope.row)">{{ scope.row.ID }}</el-button>
                  </template>
                </el-table-column>
                <el-table-column prop="area" :label="$ts('bucket.lifeCycleApplyRange')" sortable>
                  <template slot-scope="scope">
                    {{ applyRange(scope) }}
                  </template>
                </el-table-column>
                <!-- <el-table-column prop="content" label="规则内容" sortable /> -->
                <el-table-column prop="Status" :label="$ts('page.status')" sortable>
                  <template slot-scope="scope">
                    <span :class="scope.row.Status === 'Enabled' ? 'green' : 'red'">
                      {{
                        scope.row.Status === "Enabled" ? $ts('page.enable') : $ts('page.disable')
                      }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="" :label="$ts('page.enable') + '/' + $ts('page.disable')">
                  <template slot-scope="scope">
                    <el-dropdown @command="handleStatus">
                      <el-button v-access="'s3:PutLifecycleConfiguration'" type="primary" class="blue">
                        {{ $ts('page.action') }}<i class="el-icon-arrow-down el-icon--right" />
                      </el-button>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item :command="changeStatus('enable', scope.row)" :class="scope.row.Status === 'Enabled' ? 'forbidBtn' : ''
                          ">{{ $ts('bucket.enableRule') }}</el-dropdown-item>
                        <el-dropdown-item :command="changeStatus('disabled', scope.row)" :class="scope.row.Status === 'Enabled' ? '' : 'forbidBtn'
                          ">{{ $ts('bucket.disableRule') }}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <el-pagination :current-page="currentPage" :page-sizes="[5, 10, 50, 100]" :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
      <el-dialog ref="formData" :title="addOperate ? $ts('bucket.createRule') : $ts('bucket.modifyRule')" width="850px"
        :visible.sync="visibleFlag" class="dialog" @close="handleScroll('formData')">
        <el-form ref="createForm" :model="createForm" :rules="rules">
          <el-form-item :label="$ts('bucket.lifeCycleRuleName')" prop="ID">
            <el-input v-model="createForm.ID"
              :placeholder="$ts('validate.iptItem', { name: $ts('bucket.lifeCycleRuleName') })" clearable />
          </el-form-item>
          <el-form-item :label="$ts('bucket.ruleApplyRange')" class="ruleRange">
            <el-radio v-model="createForm.range" label="1">{{ $ts('bucket.filterRuleConfig') }}
            </el-radio>
            <el-radio v-model="createForm.range" label="2">{{ $ts('bucket.filterApplyAll') }}
            </el-radio>
          </el-form-item>
          <el-row v-if="createForm.range === '1'">
            <!-- <p class="normalText">筛选条件类型</p>
            <p class="tipText">
              您可以按前缀、对象标签、对象大小或者适合您的使用案例的任何组合来筛选对象。
            </p> -->
            <p class="normalText obstacleTop">{{ $ts('bucket.prefix') }}</p>
            <p class="tipText">
              {{ $ts('bucket.prefixTip') }}
            </p>
            <el-form-item prop="prefixIpt">
              <el-input v-model="createForm.prefixIpt"
                :placeholder="$ts('validate.iptItem', { name: $ts('bucket.prefix') })" clearable />
            </el-form-item>

            <!-- 对象标签 -->
            <!-- <p style="font-size: 16px">对象标签</p>
            <p class="tipText">您可以将此规则的范围限制为下面添加的键/值对。</p> -->
            <!-- <div v-if="createForm.tag&&createForm.tag.length > 0">
              <p class="objectLabelTitle">
                <span>键</span>
                <span>值-可选</span>
              </p>
              <div
                v-for="(item, i) in createForm.tag"
                :key="item.id"
                class="objectLabelTitle"
                style="width: 670px"
              >
                <el-form-item :prop="`tag.${i}.Key`" :rules="rules.Key">
                  <el-input v-model="item.Key" placeholder="键" />
                </el-form-item>
                <el-form-item prop="">
                  <el-input
                    v-model="item.Value"
                    placeholder="值"
                    class="obstacleRight"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="danger"
                    @click="createForm.tag.splice(i, 1)"
                  >删除</el-button>
                </el-form-item>
              </div>
            </div> -->
            <!-- <el-button
              style="margin: 20px 0"
              type="primary"
              @click="addLabel"
            >添加标签</el-button> -->
            <!-- <p v-if="showPrefixRule && clickSubmit" class="errorTip">
              限制规则范围时，您必须指定一个对象标签或另一个筛选条件。
            </p> -->

            <!-- 对象大小 -->
            <!-- <p class="normalText">对象大小</p>
            <p class="tipText">
              您可以根据对象的大小来限制此规则应用到对象的范围。例如，您可以筛选掉由于按对象收费而导致转换到
              Glacier Flexible Retrieval (以前称为
              Glacier)可能不具有成本效益的对象。
            </p> -->

            <!-- <el-checkbox-group v-model="objectSize" class="obstacleTop">
              <el-checkbox label="min">指定最小对象大小</el-checkbox>
              <div v-if="objectSize.includes('min')" class="obstacleTop">
                <p style="font-size: 16px">最小对象大小</p>
                <p class="tipText">筛选条件将允许大于输入值的对象。</p>
                <el-form-item prop="minSizeIpt">
                  <el-input
                    v-model="createForm.minSizeIpt"
                    placeholder="输入值"
                    class="obstacleRight"
                    style="width: 320px"
                  />
                  <el-select
                    v-model="minSizeSelect"
                    placeholder="请选择"
                    clearable
                    @change="validateIpt('createForm')"
                  >
                    <el-option
                      v-for="item in sizeSelect"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <span style="margin-left: 20px">{{ minSizeIptBytes }}</span>
                  <p>该整数值必须大于 {{(createForm.minSizeIpt||1)+minSizeSelect}}</p>
                </el-form-item>
              </div>
              <el-checkbox label="max">指定最大对象大小</el-checkbox>
              <div v-if="objectSize.includes('max')" class="obstacleTop">
                <p style="font-size: 16px">最大对象大小</p>
                <p class="tipText">筛选条件将允许小于输入值的对象。</p>
                <el-form-item prop="maxSizeIpt">
                  <el-input
                    v-model="createForm.maxSizeIpt"
                    placeholder="输入值"
                    class="obstacleRight"
                    style="width: 320px"
                  />
                  <el-select
                    v-model="maxSizeSelect"
                    placeholder="请选择"
                    clearable
                    @change="validateIpt('createForm')"
                  >
                    <el-option
                      v-for="item in sizeSelect"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <span style="margin-left: 20px">{{ maxSizeIptBytes }}</span>
                  <p>
                    <i class="el-icon-warning-outline" />
                    该整数值必须大于
                    {{ (createForm.minSizeIpt || 1) + minSizeSelect }}
                  </p>
                </el-form-item>
              </div>
            </el-checkbox-group> -->

          </el-row>
          <h1 class="titleh1">{{ $ts('bucket.ruleOperateTitle') }}</h1>
          <el-checkbox-group v-model="ruleOperate" class="obstacleTop" @change="changeCheckBox">
            <!-- <el-checkbox label="r1">在存储类之间移动对象的当前版本</el-checkbox>
            <el-checkbox label="r2">在存储类之间移动对象的非当前版本</el-checkbox> -->

            <el-checkbox label="r3">{{ $ts('bucket.setCurrentVersionExpired') }}</el-checkbox>
            <el-checkbox label="r4">{{ $ts('bucket.deleteNonCurrentVersion') }}</el-checkbox>
            <el-checkbox label="r5" :disabled="disableDelExpiredRule">{{
              $ts('bucket.deleteExpiredObjectOrAbortMultiple') }}
            </el-checkbox>
          </el-checkbox-group>
          <div style="font-size: 12px; margin: -18px 0 20px 25px;">
            {{ $ts('bucket.filterSignOrObjectSizeTip') }}
          </div>

          <!-- 在存储类之间移动对象的当前版本 -->
          <div v-if="ruleOperate.includes('r1')" class="obstacleTop">
            <h1 class="titleh1">{{ $ts('bucket.changeCurrentVersion') }}</h1>
            <div v-if="createForm.Transition && createForm.Transition.length > 0">
              <p class="objectLabelTitle" style="width:590px">
                <span>{{ $ts('bucket.selectStorageClass') }}</span>
                <span style="margin-left:200px">{{ $ts('bucket.objectCreatedDay') }}</span>
              </p>
              <div v-for="(item, i) in createForm.Transition" :key="item.key" class="objectLabelTitle"
                style="width: 100%;">
                <el-form-item style="margin-right:50px" :prop="`Transition.${i}.key`"
                  :rules="rules.validateMinObjSizeLimit">
                  <el-select v-model="item.key" :popper-append-to-body="false" clearable class="ruleSelect"
                    style="width:350px;" @change="showTransitionRule('currentVer')"
                    @click.native="judgeDisabled(i, 'currentVer')">
                    <el-option v-for="type in storageTransition" :key="type.value" :label="type.label"
                      :value="type.value" :disabled="type.disabled">
                      <span>{{ type.label }}</span>
                      <span>{{ type.tip }}</span>
                      <span>{{ type.day }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :prop="`Transition.${i}.value`" :rules="rules.objTransferDay">
                  <el-input v-model="item.value" :placeholder="$ts('bucket.day')" class="obstacleRight" />
                </el-form-item>
                <el-form-item>
                  <el-button type="danger" @click="delTransition(i, 'currentVer')">{{ $ts('page.delete') }}</el-button>
                </el-form-item>
              </div>
              <el-button :disabled="disableAddTransform" @click="addTransitionType('currentVer')">{{
                $ts('bucket.addTransfer')
              }}</el-button>
            </div>
          </div>

          <!-- 在存储类之间移动对象的非当前版本 -->
          <div v-if="ruleOperate.includes('r2')" class="obstacleTop">
            <h1 class="titleh1">{{ $ts('bucket.changeNonCurrentVersion') }}</h1>
            <div v-if="createForm.NoncurrentVersionTransitions && createForm.NoncurrentVersionTransitions.length > 0">
              <p class="objectLabelTitle" style="width:700px">
                <span>{{ $ts('bucket.selectStorageClass') }}</span>
                <span style="margin-left:80px">{{ $ts('bucket.objectChangeNonCurrent') }}</span>
                <span>{{ $ts('bucket.saveLatestCurrentNo') }}</span>
              </p>
              <div v-for="(item, i) in createForm.NoncurrentVersionTransitions" :key="item.key" class="objectLabelTitle"
                style="width: 800px">
                <el-form-item :prop="`NoncurrentVersionTransitions.${i}.key`" :rules="rules.validateMinObjSizeNCLimit">
                  <el-select v-model="item.key" :popper-append-to-body="false" clearable class="ruleSelect"
                    @change="showTransitionRule('notCurrentVer')" @click.native="judgeDisabled(i, 'notCurrentVer')">
                    <el-option v-for="type in storageTransition" :key="type.value" :label="type.label"
                      :value="type.value" :disabled="type.disabled">
                      <span>{{ type.label }}</span>
                      <span>{{ type.tip }}</span>
                      <span>{{ type.day }}</span>
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item :prop="`NoncurrentVersionTransitions.${i}.value`" :rules="rules.objTransferDayNC">
                  <el-input v-model="item.value" :placeholder="$ts('bucket.day')" class="obstacleRight" />
                </el-form-item>
                <el-form-item :prop="`NoncurrentVersionTransitions.${i}.ver`" :rules="rules.objTransferVerNC">
                  <el-input v-model="item.ver"
                    :placeholder="$ts('validate.iptItem', { name: $ts('bucket.versionCount') })"
                    class="obstacleRight" />
                  <p style="width:250px;line-height:16px;color:rgb(104, 112, 120);font-size:12px">
                    {{ $ts('bucket.HighestVersion') }}
                  </p>
                </el-form-item>
                <el-form-item>
                  <el-button type="danger" @click="delTransition(i, 'notCurrentVer')">{{ $ts('page.delete')
                    }}</el-button>
                </el-form-item>
              </div>
              <el-button :disabled="disableAddTransformNC" @click="addTransitionType('notCurrentVer')">{{
                $ts('bucket.addTransfer') }}</el-button>
            </div>
          </div>

          <!-- r2 end -->

          <div v-if="ruleOperate.includes('r3')" class="obstacleTop">
            <h1 class="titleh1">{{ $ts('bucket.setCurrentVersionExpired') }}</h1>
            <el-form-item :label="$ts('bucket.objectCreatedDay')" prop="Expiration">
              <el-input v-model="createForm.Expiration" style="width: 520px"
                :placeholder="$ts('validate.iptItem', { name: $ts('bucket.day') })" clearable />
            </el-form-item>

          </div>
          <!-- 永久删除对象 -->
          <div v-if="ruleOperate.includes('r4')" class="obstacleTop">
            <h1 class="titleh1">{{ $ts('bucket.deleteNonCurrentVersion') }}</h1>
            <el-row :gutter="60">
              <el-col :span="12">
                <el-form-item :label="$ts('bucket.objectChangeNonCurrent')" prop="noncurrentDays">
                  <el-input v-model="createForm.noncurrentDays"
                    :placeholder="$ts('validate.iptItem', { name: $ts('bucket.day') })" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$ts('bucket.saveLatestCurrentNo')" prop="NewerNoncurrentVersions">
                  <el-input v-model="createForm.NewerNoncurrentVersions"
                    :placeholder="$ts('validate.iptItem', { name: $ts('bucket.versionCount') })" clearable />
                  <p class="tipText">
                    {{ $ts('bucket.HighestVersion') }}
                  </p>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <!-- 删除过期的对象 -->
          <div v-if="ruleOperate.includes('r5')" class="obstacleTop">
            <h1 class="titleh1">{{ $ts('bucket.deleteExpiredObjectOrAbortMultiple') }}</h1>
            <p class="normalText">{{ $ts('bucket.deleteExpirationObject') }}</p>
            <p class="tipText">
              {{ $ts('bucket.deleteExpirationTip') }}
            </p>
            <el-checkbox v-model="createForm.AbortIncompleteMultipartUpload.deleteExpired" class="obstacleTop"
              :disabled="ruleOperate.includes('r3')">{{ $ts('bucket.deleteExpirationObjectMark') }}</el-checkbox>
            <p v-if="ruleOperate.includes('r3')" style="margin: -15px 0 20px 0">
              <i class="el-icon-warning-outline">{{ $ts('bucket.deleteExpirationObjectMarkTip') }}</i>
            </p>
            <p class="normalText">{{ $ts('bucket.uncompletedMultiple') }}</p>
            <p class="tipText">
              {{ $ts('bucket.deleteUncompletedTip') }}
            </p>
            <el-checkbox v-model="createForm.AbortIncompleteMultipartUpload.deleteUncompleted" class="obstacleTop">{{
              $ts('bucket.deleteUncompleted') }}</el-checkbox>
            <div v-if="createForm.AbortIncompleteMultipartUpload.deleteUncompleted">
              <el-form-item :label="$ts('bucket.day')" prop="AbortIncompleteMultipartUpload.deleteUncompletedDay"
                :rules="rules.deleteUncompleted">
                <el-input v-model="createForm.AbortIncompleteMultipartUpload.deleteUncompletedDay" style="width: 520px"
                  clearable :placeholder="$ts('validate.iptItem', { name: $ts('bucket.day') })" />
              </el-form-item>
            </div>
          </div>
          <!-- 审查转换和过期操作 创建修改 -->
          <h1 class="titleh1">{{ $ts('bucket.transferAndExpiration') }}</h1>
          <div class="configList">
            <div class="currentVersion">
              <h3 class="title">{{ $ts('bucket.currentVersionOperate') }}</h3>
              {{ $ts('bucket.zeroDay') }}
              <p>
                <span v-if="ruleOperate.includes('r1') || ruleOperate.includes('r3')">{{ $ts('bucket.uploadObject')
                  }}</span>
                <span v-else>{{ $ts('bucket.noOperate') }}</span>
              </p>
              <!-- 将对象的当前版本设为过期 -->

              <div v-if="ruleOperate.includes('r1')">
                <div v-for="(item) in createForm.Transition" :key="item.key">
                  <i class="el-icon-bottom" />
                  <p>{{ $ts('bucket.countDay', { day: item.value || "--" }) }}</p>
                  <p><span>{{ $ts('bucket.objectMove') }}&nbsp;&nbsp;{{ RuleMap[item.key] }}</span></p>
                </div>
              </div>
              <div v-if="ruleOperate.includes('r3')">
                <i class="el-icon-bottom" />
                <p>{{ $ts('bucket.countDay', { day: createForm.Expiration || "--" }) }}</p>
                <p><span>{{ $ts('bucket.objectExpirationTime') }}</span></p>
              </div>
            </div>
            <div class="notCurrentVersion">
              <h3 class="title">{{ $ts('bucket.nonCurrentVersionOperate') }}</h3>
              {{ $ts('bucket.zeroDay') }}
              <p>
                <span v-if="ruleOperate.includes('r2') || ruleOperate.includes('r4')">{{
                  $ts('bucket.objectTransferNonCurrent') }}</span>
                <span v-else>{{ $ts('bucket.noOperate') }}</span>
              </p>
              <!-- 永久删除对象的非当前版本 option4-->
              <div v-if="ruleOperate.includes('r2')">
                <div v-for="(item) in createForm.NoncurrentVersionTransitions" :key="item.key">
                  <i class="el-icon-bottom" />
                  <p> {{ $ts('bucket.countDay', { day: item.value || "--" }) }}</p>
                  <p><span>{{ $ts('bucket.keepCountNonCurrentVersion', { count: item.ver || 0 }) }}</span></p>
                  <p><span>{{ $ts('bucket.otherNonCurrentVersion') }}&nbsp;&nbsp;{{ RuleMap[item.key] }}</span></p>
                </div>
              </div>

              <div v-if="ruleOperate.includes('r4')">
                <i class="el-icon-bottom" />
                <p> {{ $ts('bucket.countDay', { day: createForm.noncurrentDays || "--" }) }}</p>
                <p><span>{{ $ts('bucket.keepCountNonCurrentVersion', {
                  count: createForm.NewerNoncurrentVersions ||
                    0
                }) }}</span>
                </p>
                <p><span>{{ $ts('bucket.deleteOtherNonCurrentVersion') }}</span></p>
              </div>
            </div>
            <span class="border" />
          </div>
          <p v-if="validRuleOption" style="color: #f56c6c">
            <i class="el-icon-circle-close" />
            {{ $ts('bucket.addOneLeastOpertate') }}
          </p>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button class="blue" @click="visibleFlag = false">{{
            $ts("page.cancel")
          }}</el-button>
          <el-button class="golden" type="primary" @click="submitCreate">{{ addOperate ? $ts('page.create') :
            $ts('page.save') }}</el-button>
        </div>
      </el-dialog>
      <!-- 详情 -->
      <el-dialog ref="infoData" :title="$ts('bucket.ruleDetail')" :visible.sync="visibleFlagInfo" class="infoDialog"
        width="1200px" @close="handleScroll('infoData')">
        <div class="infoMenu titleh1">
          <h3 class="">{{ selectConfig.ID }}</h3>
          <div>
            <el-button v-access="'s3:PutLifecycleConfiguration'" type="primary" class="golden"
              @click="addModBtn('modify'); visibleFlagInfo = false; visibleFlag = true">{{ $ts('page.modify')
              }}</el-button>
            <el-button v-access="'s3:PutLifecycleConfiguration;s3:DeleteBucketLifecycle'" type="danger" class="red"
              @click="delLifecycle">{{ $ts('page.delete') }}</el-button>
            <el-dropdown style="margin-left:10px" @command="handleStatus">
              <el-button v-access="'s3:PutLifecycleConfiguration'" type="primary" class="blue">
                {{ $ts('page.action') }}<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="changeStatus('enable', createForm)" :class="selectConfig.Status === 'Enabled' ? 'forbidBtn' : ''
                  ">{{ $ts('bucket.enableRule') }}</el-dropdown-item>
                <el-dropdown-item :command="changeStatus('disabled', createForm)" :class="selectConfig.Status === 'Enabled' ? '' : 'forbidBtn'
                  ">{{ $ts('bucket.disableRule') }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <div class="configList">
          <p>
            {{ $ts('bucket.lifeCycleRuleName') }} <span>{{ selectConfig.ID }}</span>
          </p>
          <p>
            {{ $ts('bucket.prefix') }} <span>{{ selectConfig.Filter && selectConfig.Filter.Prefix || "-" }}</span>
            <span class="border bL" />
            <span class="border bR" />
          </p>

          <!-- <p>
            最小对象大小<span>{{
              selectConfig.Filter.And.ObjectSizeGreaterThan?byteConvert(selectConfig.Filter.And.ObjectSizeGreaterThan)+' ('+precisionNum(selectConfig.Filter.And.ObjectSizeGreaterThan)+'字节'+')' : "-"
            }}</span>
          </p> -->

          <p>
            {{ $ts('page.status') }}
            <span :style="{
              color: selectConfig.Status === 'Enabled' ? 'green' : 'red',
            }">{{ selectConfig.Status === "Enabled" ? $ts('page.enable') : $ts('page.disable') }}</span>
          </p>

          <!-- <p>
            对象标签<span style="word-break: break-word">{{
              concatKVarray
            }}</span>
          </p> -->

          <!-- <p>
            最大对象大小<span>{{
              selectConfig.Filter.And.ObjectSizeLessThan?byteConvert(selectConfig.Filter.And.ObjectSizeLessThan)+' ('+precisionNum(selectConfig.Filter.And.ObjectSizeLessThan)+'字节'+')'
              : "-"
            }}</span>
          </p> -->

          <p>
            {{ $ts('bucket.lifeCycleApplyRange') }}<span>{{ selectRange }}</span>
          </p>
        </div>
        <h3 class="titleh1">{{ $ts('bucket.transferAndExpiration') }}</h3>
        <div class="configList" style="margin-right: 250px">
          <div class="currentVersion">
            <h3 class="title">{{ $ts('bucket.currentVersionOperate') }}</h3>
            {{ $ts('bucket.zeroDay') }}
            <p>
              <span
                v-if="selectConfig.Expiration && selectConfig.Expiration.Days || selectConfig.Transitions && selectConfig.Transitions.length">{{
                  $ts('bucket.uploadObject') }}</span>
              <span v-else>{{ $ts('bucket.noOperate') }}</span>
            </p>
            <div v-if="selectConfig.Transitions && selectConfig.Transitions.length">
              <div v-for="item in selectConfig.Transitions" :key="item.day">
                <i class="el-icon-bottom" />
                <p>{{ $ts('bucket.countDay', { day: item.Days }) }}</p>
                <p><span>{{ $ts('bucket.objectMove') }}&nbsp;{{ RuleMapTxt[item.StorageClass] }}</span></p>
              </div>
            </div>
            <div v-if="selectConfig.Expiration && selectConfig.Expiration.Days">
              <i class="el-icon-bottom" />
              <p>{{ $ts('bucket.countDay', { day: selectConfig.Expiration.Days }) }}</p>
              <p><span>{{ $ts('bucket.objectExpirationTime') }}</span></p>
            </div>
          </div>
          <div class="notCurrentVersion">
            <h3 class="title">{{ $ts('bucket.nonCurrentVersionOperate') }}</h3>
            {{ $ts('bucket.zeroDay') }}
            <p>
              <span
                v-if="selectConfig.NoncurrentVersionTransitions && selectConfig.NoncurrentVersionTransitions.length || selectConfig.NoncurrentVersionExpiration && selectConfig.NoncurrentVersionExpiration.NoncurrentDays">{{
                  $ts('bucket.objectTransferNonCurrent') }}</span>
              <span v-else>{{ $ts('bucket.noOperate') }}</span>
            </p>
            <div v-if="selectConfig.NoncurrentVersionTransitions && selectConfig.NoncurrentVersionTransitions.length">
              <div v-for="item in selectConfig.NoncurrentVersionTransitions" :key="item.day">
                <i class="el-icon-bottom" />
                <p>
                  {{ $ts('bucket.countDay', { day: item.NoncurrentDays }) }}
                </p>
                <p><span>{{ $ts('bucket.keepCountNonCurrentVersion', {
                  count: item.NewerNoncurrentVersions || "--"
                }) }}</span>
                </p>
                <p><span>{{ $ts('bucket.otherNonCurrentVersion') }}&nbsp;{{ RuleMapTxt[item.StorageClass] }}</span></p>
              </div>
            </div>
            <div v-if="selectConfig.NoncurrentVersionExpiration">

              <i class="el-icon-bottom" />
              <p>
                {{ $ts('bucket.countDay', { day: selectConfig.NoncurrentVersionExpiration.NoncurrentDays || "--" }) }}
              </p>
              <p>
                <span>
                  {{ $ts('bucket.keepCountNonCurrentVersion', {
                    count: selectConfig.NoncurrentVersionExpiration
                      .NewerNoncurrentVersions
                  }) }}</span>
              </p>
              <p><span>{{ $ts('bucket.deleteOtherNonCurrentVersion') }}</span></p>
            </div>
          </div>
        </div>
        <h3 class="titleh1">{{ $ts('bucket.deleteExpirationObjectMarkOrUncompleteMult') }}</h3>
        <div class="configList" style="margin-right:250px">
          <div class="currentVersion">
            {{ $ts('bucket.deleteExpirationObject') }}
            <p><span> {{ selectConfig.Expiration && selectConfig.Expiration.ExpiredObjectDeleteMarker ?
              $ts('bucket.deleteExpirationObjectMark') :
              '-'
                }}</span></p>
          </div>
          <div class="notCurrentVersion">
            {{ $ts('bucket.uncompletedMultiple') }}
            <p>
              <span>
                {{
                  selectConfig.AbortIncompleteMultipartUpload &&
                    selectConfig.AbortIncompleteMultipartUpload.DaysAfterInitiation
                    ?
                    $ts('bucket.deleteAfterCountDay', {
                      day: selectConfig.AbortIncompleteMultipartUpload.DaysAfterInitiation
                    })
                    :
                    '-' }}
              </span>
            </p>
          </div>
        </div>

      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BucketLifeCycle',
  data () {
    // 数字 输出关系表对应的value
    //   var t = res.map(item => {
    //   return {
    //     value: item.value,
    //     id: RuleMap[item.id]
    //   }
    // })
    // 校验当前版本转换对象的天数
    const validateObjTransferDay = (rule, data, callback) => {
      const index = rule.field.match(/\d/)[0]
      // 判断非纯数字及空值
      data = isNaN(Number(data)) ? -1 : data === '' ? -1 : Number(data)
      const trans = this.createForm.Transition
      const currentkey = trans[index].key // 当前编辑天数的存储类型
      const preKey = index > 0 ? Number(trans[index - 1].key) : 0 // 当前类型
      const preData = index > 0 ? Number(trans[index - 1].value) : '' // 当前类型对应的值

      //  需要判断前一项的key 判断其类型 再动态比较其大小
      // console.log(data, preKey, preData)
      if (currentkey === 1) {
        // 遵循一个规则大于30
        if (data < 30) {
          return callback(this.$ts('bucket.standTransitionLimit'))
        }
      }

      // 智能分层
      if (currentkey === 2) {
        if (preKey === 1 && data - preData < 30) {
          return callback(this.$ts('bucket.smartLargeStand30'))
        } else if (!preKey) {
          if (data < 0) {
            return callback(this.$ts('bucket.validNum'))
          } else {
            return callback()
          }
        }
      }
      // 单区  case 1
      if (currentkey === 3) {
        if (preKey === 2 && data - preData < 30) {
          return callback(this.$ts('bucket.iaLargeSmart30'))
        } else if (preKey === 1 && data - preData < 30) {
          // case 2
          return callback(this.$ts('bucket.iaLargeStand30'))
        } else if (!preKey) {
          // case 3
          if (data > 30) {
            return callback()
          } else {
            return callback(this.$ts('bucket.iaTransitionLimit'))
          }
        }
      }

      // GIR

      if (currentkey === 4) {
        if (preKey === 2 && data < preData) {
          return callback(
            this.$ts('bucket.girLargeSmart0')
          )
        } else if (preKey === 1 && data - preData < 30) {
          return callback(
            this.$ts('bucket.girLargeStand30')
          )
        } else if (!preKey) {
          if (data >= 0) {
            return callback()
          } else {
            return callback(this.$ts('bucket.validNum'))
          }
        }
      }

      // GFR
      if (currentkey === 5) {
        if (preKey === 4 && data - preData < 90) {
          return callback(
            this.$ts('bucket.gfrLargeGIR90')
          )
        } else if (preKey === 3 && data - preData < 30) {
          return callback(
            this.$ts('bucket.gfrLargeIA30')
          )
        } else if (preKey === 2 && data < preData) {
          return callback(
            this.$ts('bucket.gfrLargeSmart0')
          )
        } else if (preKey === 1 && data - preData < 30) {
          return callback(
            this.$ts('bucket.gfrLargeStand30')
          )
        } else if (!preKey) {
          if (data >= 0) {
            return callback()
          } else {
            return callback(this.$ts('bucket.validNum'))
          }
        }
      }

      // GDA
      if (currentkey === 6) {
        if (preKey === 5 && data - preData < 90) {
          return callback(
            this.$ts('bucket.gdaLargeGFR90')
          )
        } else if (preKey === 4 && data - preData < 90) {
          return callback(
            this.$ts('bucket.gdaLarageGIR90')
          )
        } else if (preKey === 3 && data - preData < 30) {
          return callback(
            this.$ts('bucket.gdaLargeIA30')
          )
        } else if (preKey === 2 && data < preData) {
          return callback(
            this.$ts('bucket.gdaLargeSmart')
          )
        } else if (preKey === 1 && data - preData < 30) {
          return callback(
            this.$ts('bucket.gdaLargeStand30')
          )
        } else if (!preKey) {
          if (data >= 0) {
            return callback()
          } else {
            return callback(this.$ts('bucket.validNum'))
          }
        }
      }
      callback()
      // end
    }

    // 校验非当前版本转换对象的天数
    const validateObjTransferDayNC = (rule, data, callback) => {
      const index = rule.field.match(/\d/)[0]
      data = isNaN(Number(data)) ? -1 : data === '' ? -1 : Number(data)
      const trans = this.createForm.NoncurrentVersionTransitions
      const currentkey = trans[index].key // 当前编辑天数的存储类型
      const preKey = index > 0 ? Number(trans[index - 1].key) : 0 // 当前类型
      const preData = index > 0 ? Number(trans[index - 1].value) : '' // 当前类型对应的值

      //  需要判断前一项的key 判断其类型 再动态比较其大小
      // console.log(data, preKey, preData)
      if (currentkey === 1) {
        // 遵循一个规则大于30
        if (data < 30) {
          return callback(this.$ts('bucket.standTransitionLimit'))
        }
      }

      // 智能分层
      if (currentkey === 2) {
        if (preKey === 1 && data - preData < 30) {
          return callback(this.$ts('bucket.smartLargeStand30'))
        } else if (!preKey) {
          if (data < 0) {
            return callback(this.$ts('bucket.validNum'))
          } else {
            return callback()
          }
        }
      }
      // 单区  case 1
      if (currentkey === 3) {
        if (preKey === 2 && data - preData < 30) {
          return callback(this.$ts('bucket.iaLargeSmart30'))
        } else if (preKey === 1 && data - preData < 30) {
          // case 2
          return callback(this.$ts('bucket.iaLargeStand30'))
        } else if (!preKey) {
          // case 3
          if (data > 30) {
            return callback()
          } else {
            return callback(this.$ts('bucket.iaTransitionLimit'))
          }
        }
      }

      // GIR

      if (currentkey === 4) {
        if (preKey === 2 && data < preData) {
          return callback(
            this.$ts('bucket.girLargeSmart0')
          )
        } else if (preKey === 1 && data - preData < 30) {
          return callback(
            this.$ts('bucket.girLargeStand30')
          )
        } else if (!preKey) {
          if (data >= 0) {
            return callback()
          } else {
            return callback(this.$ts('bucket.validNum'))
          }
        }
      }

      // GFR
      if (currentkey === 5) {
        if (preKey === 4 && data - preData < 90) {
          return callback(
            this.$ts('bucket.gfrLargeGIR90')
          )
        } else if (preKey === 3 && data - preData < 30) {
          return callback(
            this.$ts('bucket.gfrLargeIA30')
          )
        } else if (preKey === 2 && data < preData) {
          return callback(
            this.$ts('bucket.gfrLargeSmart0')
          )
        } else if (preKey === 1 && data - preData < 30) {
          return callback(
            this.$ts('bucket.gfrLargeStand30')
          )
        } else if (!preKey) {
          if (data >= 0) {
            return callback()
          } else {
            return callback(this.$ts('bucket.validNum'))
          }
        }
      }

      // GDA
      if (currentkey === 6) {
        if (preKey === 5 && data - preData < 90) {
          return callback(
            this.$ts('bucket.gdaLargeGFR90')
          )
        } else if (preKey === 4 && data - preData < 90) {
          return callback(
            this.$ts('bucket.gdaLarageGIR90')
          )
        } else if (preKey === 3 && data - preData < 30) {
          return callback(
            this.$ts('bucket.gdaLargeIA30')
          )
        } else if (preKey === 2 && data < preData) {
          return callback(
            this.$ts('bucket.gdaLargeSmart')
          )
        } else if (preKey === 1 && data - preData < 30) {
          return callback(
            this.$ts('bucket.gdaLargeStand30')
          )
        } else if (!preKey) {
          if (data >= 0) {
            return callback()
          } else {
            return callback(this.$ts('bucket.validNum'))
          }
        }
      }
      callback()
      // end
    }

    // 校验非当前版本版本数
    const validateNCVerDay = (rule, data, callback) => {
      const index = rule.field.match(/\d/)[0]
      const arr = this.createForm.NoncurrentVersionTransitions
      // 每项都可选、基于上一项的合法的值进行比较、递归去找前一项的ver
      function preValidVer (i) {
        const preIndex = i > 0 ? i - 1 : 0
        const pre = arr[preIndex].ver
        if (pre === '' && i !== 0) {
          return preValidVer(preIndex)
        } else {
          return pre
        }
      }
      let preVer
      if (index === 0) {
        preVer = 0
      } else {
        preVer = preValidVer(index)
      }
      const transData = isNaN(Number(data)) ? -1 : Number(data)
      // 当前data为空，则无需校验
      if (transData === -1) {
        return callback(this.$ts('validate.positiveNumber'))
      }
      if (transData > 100) {
        return callback(this.$ts('bucket.topVersion'))
      }
      // 0 校验
      if (data !== '' && transData < preVer) {
        return callback(`${this.$ts('bucket.largerThanOrEqual')}${preVer} 。`)
      }
      callback()
      // 当前的版本数 规则大于等于前一项
    }
    // 校验对象最小大小
    const validateMinIpt = (rule, data, callback) => {
      const reg = /^[\d]*$/
      if (!reg.test(data)) {
        return callback(this.$ts('validate.positiveNumber'))
      } else {
        this.$refs['createForm'].clearValidate('minSizeIpt')
        this.$refs['createForm'].clearValidate('maxSizeIpt')
        if (!this.createForm.maxSizeIpt || !data) {
          return callback()
        }
        if (
          this.covertByte(data, this.minSizeSelect) -
          this.covertByte(this.createForm.maxSizeIpt, this.maxSizeSelect) >
          0 &&
          this.objectSize.includes('max')
        ) {
          return callback(new Error(this.$ts('bucket.minObjectSizeSmallMaxObject')))
        } else {
          callback()
        }
      }
      // 添加筛选条件校验,没有筛选条件终止valid
    }
    // 校验对象最大大小
    const validateMaxIpt = (rule, data, callback) => {
      const reg = /^[\d]*$/
      if (!reg.test(data) || (Number(data) === 0 && data !== '')) {
        return callback(this.$ts('validate.positiveNumber'))
      } else {
        this.$refs['createForm'].validateField('minSizeIpt')
        if (!this.createForm.minSizeIpt || !data) {
          return callback()
        }
        if (
          this.covertByte(this.createForm.minSizeIpt, this.minSizeSelect) -
          this.covertByte(data, this.maxSizeSelect) >=
          0 &&
          this.objectSize.includes('min')
        ) {
          return callback(new Error(this.$ts('bucket.maxObjectSizeLargeminObjectSize')))
        } else {
          callback()
        }
      }
    }
    const validateNewerNoncurrentVersions = (rule, data, callback) => {
      // 如若选择非版本对象转换，则需要再校验大于最高项的版本数
      const len = this.createForm.NoncurrentVersionTransitions.length
      const lastVer = len
        ? this.createForm.NoncurrentVersionTransitions.map(
          item => item.ver
        ).sort((a, b) => b - a)[0]
        : 0
      if (data && String(data).indexOf('.') > -1) {
        return callback(this.$ts('validate.positiveNumber'))
      }
      data = isNaN(Number(data)) ? -1 : Number(data)
      if (data > 10000) {
        return callback(this.$ts('bucket.smallerThanOrEqual10000'))
      } else if (data < lastVer) {
        return callback(`${this.$ts('bucket.largerThanOrEqual')}${lastVer}`)
      } else {
        callback()
      }
    }
    // 校验永久删除对象的非当前版本
    const validateNCDay = (rule, data, callback) => {
      const len = this.createForm.NoncurrentVersionTransitions.length
      const lastDay = len
        ? Number(this.createForm.NoncurrentVersionTransitions[len - 1].value)
        : 0
      if (data && String(data).indexOf('.') > -1) {
        return callback(this.$ts('validate.positiveNumber'))
      }
      data = isNaN(Number(data)) ? -1 : Number(data)
      if (data <= lastDay) {
        return callback(`${this.$ts('bucket.largerThan')}${lastDay}`)
      } else if (data > 36135) {
        return callback(this.$ts('bucket.expirationReg'))
      } else {
        callback()
      }
    }
    const checkPositiveNumber = (rule, data, callback) => {
      if (data > 36135) {
        return callback(this.$ts('bucket.expirationReg'))
      }
      if (data && String(data).indexOf('.') > -1) {
        return callback(this.$ts('validate.positiveNumber'))
      }
      data = isNaN(Number(data)) ? 0 : Number(data)
      if (!data || data < 0) {
        return callback(this.$ts('validate.positiveNumber'))
      } else {
        return callback()
      }
    }

    // 将对象的当前版本设为过期
    const checkValueTransition = (rule, data, callback) => {
      const len = this.createForm.Transition.length
      const lastValue = len
        ? Number(this.createForm.Transition[len - 1].value)
        : 0
      data = isNaN(Number(data)) ? -1 : Number(data)
      if (data <= lastValue) {
        return callback(`${this.$ts('bucket.largerThan')} ${lastValue}`)
      } else {
        callback()
      }
    }
    // validateMinObjSizeSelectLimit
    const validateMinObjSizeSelectLimit = (rule, data, callback) => {
      const name = this.RuleMap[data]
      if (this.minSizeTransLimit && data < 5) {
        return callback(
          this.$ts('bucket.minObjectSizeLimitReg', { name })
        )
      } else {
        callback()
      }
    }

    const validateMinObjSizeSelectNCLimit = (rule, data, callback) => {
      const name = this.RuleMap[data]
      if (this.minSizeTransLimit && data < 5) {
        return callback(
          this.$ts('bucket.minObjectSizeLimitReg', { name })
        )
      } else {
        callback()
      }
    }

    const checkRuleName = (rule, data, callback) => {
      const reg = /^[0-9a-zA-Z]{1,255}$/
      if (!reg.test(data)) {
        return callback(this.$ts('bucket.ruleNameReg'))
      }
      return callback()
    }
    const checknetworkExpiration = (rule, data, callback) => {
      if (data > 36135) {
        return callback(this.$ts('bucket.expirationReg'))
      }
      return callback()
    }
    // const validatedeleteUncompleted = (rule, data, callback) => {
    //   console.log(data, 'egg')
    //   if (data > 36135) {
    //     return callback('该整数值必须小于或等于36135')
    //   } else {
    //     return callback()
    //   }
    // }
    return {
      RuleKeyMap: {
        1: 'STANDARD_IA',
        2: 'INTELLIGENT_TIERING',
        3: 'ONEZONE_IA',
        4: 'GLACIER_IR',
        5: 'GLACIER',
        6: 'DEEP_ARCHIVE'
      },
      RuleMap: {
        1: this.$ts('bucket.standTransition'),
        2: this.$ts('bucket.smartTransition'),
        3: this.$ts('bucket.individualAreaTransition'),
        4: this.$ts('bucket.GlacierInstantRetrieval'),
        5: this.$ts('bucket.GlacierFlex'),
        6: this.$ts('bucket.GlacierDeepArchive')
      },
      RuleMapTxt: {
        STANDARD_IA: this.$ts('bucket.standTransition'),
        INTELLIGENT_TIERING: this.$ts('bucket.smartTransition'),
        ONEZONE_IA: this.$ts('bucket.individualAreaTransition'),
        GLACIER_IR: this.$ts('bucket.GlacierInstantRetrieval'),
        GLACIER: this.$ts('bucket.GlacierFlex'),
        DEEP_ARCHIVE: this.$ts('bucket.GlacierDeepArchive')
      },
      RuleMapVal: {
        STANDARD_IA: 1,
        INTELLIGENT_TIERING: 2,
        ONEZONE_IA: 3,
        GLACIER_IR: 4,
        GLACIER: 5,
        DEEP_ARCHIVE: 6
      },
      showPrefixRule: false,
      clickSubmit: false,
      loading: true,
      tableData: [],
      searchName: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      disableBtn: false,
      radio: '',
      currentRow: null,
      operateType: '',
      visibleFlag: false, // 新建、修改表单
      visibleFlagInfo: false, // 详情 表单
      selectRule: [],
      createForm: {
        ID: '',
        prefixIpt: '',
        range: '1',
        tag: [],
        minSizeIpt: '',
        maxSizeIpt: '',
        noncurrentDays: '',
        NewerNoncurrentVersions: '', // 要保留的较新版本的数量
        Transition: [], // 在存储类之间转移对象的当前版本
        NoncurrentVersionTransitions: [], // 在存储类之间转移对象的当前版本
        Expiration: '', // 将对象的当前版本设为过期 -- 创建对象以来的天数
        NoncurrentVersionExpiration: {
          NoncurrentDays: '', // 对象变为非当前对象以来的天数
          NewerNoncurrentVersions: ''
        },
        AbortIncompleteMultipartUpload: {
          deleteExpired: false,
          deleteUncompleted: false,
          deleteUncompletedDay: ''
        }
      },
      objectSize: [],
      sizeSelect: [
        { label: this.$ts('bucket.byte'), value: 'byte' },
        { label: 'KB', value: 'KB' },
        { label: 'MB', value: 'MB' },
        { label: 'GB', value: 'GB' }
      ],
      minSizeSelect: 'KB',
      maxSizeSelect: 'KB',
      // 规则操作
      ruleOperate: [],
      storageTransition: [
        {
          label: this.$ts('bucket.standTransition'),
          value: 1,
          tip: this.$ts('bucket.standTip'),
          day: this.$ts('bucket.storageTime30Day')
        },
        {
          label: this.$ts('bucket.smartTransition'),
          value: 2,
          tip: this.$ts('bucket.smartTip'),
          day: this.$ts('bucket.storageTimeNoSet')
        },
        {
          label: this.$ts('bucket.individualAreaTransition'),
          value: 3,
          tip:
            this.$ts('bucket.individualAreaTip'),
          day: this.$ts('bucket.storageTime30Day')
        },
        {
          label: this.$ts('bucket.GlacierInstantRetrieval'),
          value: 4,
          tip: this.$ts('bucket.GlacierInstantRetrievalTip'),
          day: this.$ts('bucket.storageTime90Day')
        },
        {
          label: this.$ts('bucket.GlacierFlexibleRetrieval'),
          value: 5,
          tip: this.$ts('bucket.GlacierFlexibleRetrievalTip'),
          day: this.$ts('bucket.storageTime90Day')
        },
        {
          label: this.$ts('bucket.GlacierDeepArchive'),
          value: 6,
          tip: this.$ts('bucket.GlacierDeepArchiveTip'),
          day: this.$ts('bucket.storageTime180Day')
        }
      ],
      selectConfig: {
        Filter: { And: { Tags: [] } },
        ID: '',
        Status: '',
        NoncurrentVersionExpiration: {},
        NoncurrentVersionTransitions: []
      },

      rules: {
        ID: [
          {
            required: true,
            message: this.$ts('validate.requiredReg', { name: this.$ts('bucket.lifeCycleRuleName') }),
            trigger: 'change'
          },
          {
            validator: checkRuleName,
            trigger: 'change'
          }
        ],
        prefixIpt: [
          {
            required: true,
            message: this.$ts('bucket.prefixReg'),
            trigger: 'change'
          },
          { max: 255, message: this.$ts('validate.limitRange', { range: this.$ts('bucket.characterLength') }), trigger: 'change' }
        ],
        Key: [
          { required: true, message: this.$ts('validate.requiredReg', { name: this.$ts('bucket.keyName') }), trigger: ['blur', 'change'] }
        ],
        minSizeIpt: [
          {
            validator: validateMinIpt,
            trigger: ['blur', 'change']
          }
        ],
        maxSizeIpt: [
          {
            validator: validateMaxIpt,
            trigger: ['blur', 'change']
          }
        ],
        NewerNoncurrentVersions: [
          {
            validator: validateNewerNoncurrentVersions,
            trigger: ['blur', 'change']
          }
        ],
        noncurrentDays: [
          {
            required: true,
            message: this.$ts('bucket.expirationTimeTip'),
            trigger: ['blur', 'change']
          },
          {
            validator: validateNCDay,
            trigeer: ['blur', 'change']
          }
        ],
        Expiration: [
          {
            required: true,
            message: this.$ts('bucket.expirationTimeTip'),
            trigger: ['blur', 'change']
          },
          {
            validator: checkPositiveNumber,
            trigger: ['blur', 'change']
          },
          {
            validator: checknetworkExpiration,
            trigger: ['blur', 'change']
          },
          {
            validator: checkValueTransition,
            trigger: ['blur', 'change']
          }
        ],
        objTransferDay: [
          { validator: validateObjTransferDay, trigger: ['blur', 'change'] }
        ],
        objTransferDayNC: [
          { validator: validateObjTransferDayNC, trigger: ['blur', 'change'] }
        ],
        objTransferVerNC: [
          { validator: validateNCVerDay, trigger: ['blur', 'change'] }
        ],
        deleteUncompleted: [
          {
            required: true,
            message: this.$ts('validate.positiveNumber'),
            trigger: ['change', 'blur']
          },
          {
            validator: checkPositiveNumber,
            trigger: ['change', 'blur']
          }
        ],
        validateMinObjSizeLimit: [
          {
            validator: validateMinObjSizeSelectLimit,
            trigger: ['change', 'blur']
          }
        ],
        validateMinObjSizeNCLimit: [
          {
            validator: validateMinObjSizeSelectNCLimit,
            trigger: ['change', 'blur']
          }
        ]
      }
    }
  },
  computed: {
    bucketName () {
      return this.$route.params.id
    },
    tableSlicePage () {
      return this.tableData.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
    },
    addOperate () {
      return this.operateType === 'add'
    },
    deleteDisable () {
      return this.selectRule && !this.selectRule.length
    },
    operateDisable () {
      return this.selectRule && this.selectRule.length !== 1
      // return typeof this.radio !== 'number'
    },
    concatKVarray () {
      var str = ''
      if (
        this.selectConfig.Filter.And.Tags &&
        this.selectConfig.Filter.And.Tags.length
      ) {
        var arr =
          this.selectConfig.Filter.And.Tags &&
          this.selectConfig.Filter.And.Tags
        for (const i of arr) {
          str += ' ' + i.Key + ': ' + i.Value + ', '
        }
      }
      return str || '-'
    },
    selectRange () {
      return Object.keys(this.selectConfig.Filter || {}).length
        ? this.$ts('bucket.hasFilter')
        : this.$ts('bucket.allBucket')
    },
    maxSizeIptBytes () {
      return (
        (this.precisionNum(
          this.covertByte(this.createForm.maxSizeIpt, this.maxSizeSelect)
        ) || '') + 'bytes'
      )
    },
    minSizeIptBytes () {
      return (
        (this.precisionNum(
          this.covertByte(this.createForm.minSizeIpt, this.minSizeSelect)
        ) || '') + 'bytes'
      )
    },
    minSizeTransLimit () {
      // 转换限制小于128kb
      if (
        (this.createForm.minSizeIpt !== '' &&
          this.createForm.minSizeIpt >= 0 &&
          this.covertByte(this.createForm.minSizeIpt, this.minSizeSelect) <
          131072) ||
        (this.createForm.maxSizeIpt &&
          this.covertByte(this.createForm.maxSizeIpt, this.maxSizeSelect) <=
          131072)
      ) {
        return true
      } else {
        return false
      }
    },
    // 添加转换 禁用
    disableAddTransform () {
      const len =
        this.createForm.Transition && this.createForm.Transition.length
      return (
        len === 5 ||
        this.createForm.Transition[len - 1].key === 6 ||
        (this.minSizeTransLimit && this.createForm.Transition[len - 1].key <= 4)
      )
    },
    // disableAddTransformNC
    disableAddTransformNC () {
      const len =
        this.createForm.NoncurrentVersionTransitions &&
        this.createForm.NoncurrentVersionTransitions.length
      return (
        len === 5 ||
        this.createForm.NoncurrentVersionTransitions[len - 1].key === 6 ||
        (this.minSizeTransLimit &&
          this.createForm.NoncurrentVersionTransitions[len - 1].key <= 4)
      )
    },
    // 对象标签或对象大小进行筛选时 禁用删除过期rule rule5
    disableDelExpiredRule () {
      const objectLabel = this.createForm.tag && this.createForm.tag.length
      const objectSize =
        (this.objectSize.includes('min') && this.createForm.minSizeIpt) ||
        (this.objectSize.includes('max') && this.createForm.maxSizeIpt)
      const flag = !!(objectLabel || objectSize)
      if (flag) {
        // 清空已勾选的删除过期配置和显示的配置内容
        this.clearDelItem()
        return true
      } else {
        return false
      }
    },
    // 规则定义至少一个转换或过期操作
    validRuleOption () {
      // 勾选r5 必须选择其中一个
      const r5check1 = this.createForm.AbortIncompleteMultipartUpload
        .deleteExpired
      const r5check2 = this.createForm.AbortIncompleteMultipartUpload
        .deleteUncompleted
      if (
        this.ruleOperate.length === 1 &&
        this.ruleOperate[0] === 'r5' &&
        !r5check1 &&
        !r5check2
      ) {
        return true
      } else {
        return !this.ruleOperate.length && this.clickSubmit
      }
    }
  },
  watch: {
    searchName (val) {
      this.tableData = [...this.copyData]
      this.total = this.tableData.length
      this.currentPage = 1
      if (!val) return
      this.tableData = this.tableData.filter(item => {
        return item.ID.toLowerCase().indexOf(val.toLowerCase()) !== -1
      })
      this.total = this.tableData.length
    },
    // 筛选条件提示
    clickSubmit (val) {
      if (
        val &&
        !this.createForm.prefixIpt &&
        !this.createForm.tag.length &&
        this.createForm.range === '1'
      ) {
        this.showPrefixRule = true
      } else {
        this.showPrefixRule = false
      }
    },
    // 根据输入前缀 显示标签校验
    'createForm.prefixIpt' (val) {
      if (val) {
        this.showPrefixRule = false
      } else if (!this.createForm.tag && this.createForm.tag.length) {
        this.showPrefixRule = true
      }
    },
    'createForm.tag' (val) {
      // 对象标签触发时、取消前缀的校验
      if (val && val.length) {
        this.$refs['createForm'] &&
          this.$refs['createForm'].clearValidate('prefixIpt')
        this.showPrefixRule = false
        this.rules.prefixIpt = []
        console.log(val, this.rules.prefixIpt)
      } else if (!this.createForm.prefixIpt) {
        this.showPrefixRule = true
        this.rules.prefixIpt.push({
          required: true,
          message: this.$ts('bucket.prefixReg'),
          trigger: 'change'
        })
        // this.$refs['createForm'].validateField('prefixIpt')
      }
    },
    // 切换选择对象大小 清除输入内容 清除对应校验
    objectSize (val, old) {
      if (val && val.length === 1) {
        if (val[0] === 'min') {
          this.$refs['createForm'] &&
            this.$refs['createForm'].clearValidate('maxSizeIpt')
          this.createForm.maxSizeIpt = ''
          if (!this.createForm.prefixIpt || !this.createForm.tag.length) {
            this.rules.minSizeIpt.push({
              required: true,
              message:
                this.$ts('bucket.minSizeReg'),
              trigger: 'change'
            })
          }
          // console.log('clearmax')
        } else if (val[0] === 'max') {
          this.$refs['createForm'] &&
            this.$refs['createForm'].clearValidate('minSizeIpt')
          this.createForm.minSizeIpt = ''
          if (!this.createForm.prefixIpt || !this.createForm.tag.length) {
            this.rules.maxSizeIpt.push({
              required: true,
              message:
                this.$ts('bucket.maxSizeReg'),
              trigger: 'change'
            })
          }
        }
        // 勾选最大最小对象，清除前缀、标签校验、添加自身校验
        // 实际情况 最大、最小对象并不需要同时选定、一方选定、一方未填写、去除另一边必填校验
        this.$refs['createForm'] &&
          this.$refs['createForm'].clearValidate('prefixIpt')
        this.rules.prefixIpt = []
        this.showPrefixRule = false
      } else if (val && val.length === 2) {
        //   if (!this.createForm.prefixIpt || !this.createForm.tag.length) {

        //   }
        // this.rules.minSizeIpt.length===2
        //   ? null
        //   : this.rules.minSizeIpt.push({
        //     required: true,
        //     message:
        //         '限制规则范围时，您必须指定最小对象大小或另一个筛选条件。',
        //     trigger: 'change'
        //   })
        // this.rules.maxSizeIpt.length===2
        //   ? null
        //   : this.rules.maxSizeIpt.push({
        //     required: true,
        //     message:
        //         '限制规则范围时，您必须指定最大对象大小或另一个筛选条件。',
        //     trigger: 'change'
        //   })
        this.$refs['createForm'] &&
          this.$refs['createForm'].validateField('minSizeIpt')
        this.$refs['createForm'] &&
          this.$refs['createForm'].validateField('maxSizeIpt')
      } else if (!val.length) {
        this.rules.minSizeIpt.length > 1 && this.rules.minSizeIpt.pop()
        this.rules.maxSizeIpt.length > 1 && this.rules.maxSizeIpt.pop()
        this.createForm.minSizeIpt = ''
        this.createForm.maxSizeIpt = ''
        this.rules.prefixIpt.push({
          required: true,
          message: this.$ts('bucket.prefixReg'),
          trigger: 'change'
        })
        if (!this.createForm.prefixIpt) {
          this.showPrefixRule = true
        }
      }
    },
    // 切换添加r1、r2初始化 第一项规则
    // 切换r1、r2需要将对应的arr清空，不影响r3、r4的校验
    ruleOperate (val, old) {
      // 初始无选项[],
      if (
        !old.includes('r1') &&
        val.includes('r1') &&
        val.length - old.length === 1 &&
        this.createForm.Transition.length === 0
      ) {
        if (!this.minSizeTransLimit) {
          this.createForm.Transition = [
            // { key: '标准-IA', value: '' }
            {
              key: 1,
              value: ''
            }
          ]
        } else {
          this.createForm.Transition = [
            {
              key: 5,
              value: ''
            }
          ]
        }
      } else if (!val.includes('r1') && old.includes('r1')) {
        this.createForm.Transition = []
      } else if (
        !old.includes('r2') &&
        val.includes('r2') &&
        val.length - old.length === 1 &&
        this.createForm.NoncurrentVersionTransitions.length === 0
      ) {
        if (!this.minSizeTransLimit) {
          this.createForm.NoncurrentVersionTransitions = [
            { key: 1, value: '', ver: '' }
          ]
        } else {
          this.createForm.NoncurrentVersionTransitions = [
            {
              key: 5,
              value: ''
            }
          ]
        }
      } else if (!val.includes('r2') && old.includes('r2')) {
        this.createForm.NoncurrentVersionTransitions = []
      } else if (!val.includes('r3') && old.includes('r3')) {
        this.createForm.Expiration = ''
      } else if (!val.includes('r4') && old.includes('r4')) {
        this.createForm.noncurrentDays = ''
        this.createForm.NewerNoncurrentVersions = ''
      } else if (!val.includes('r5') && old.includes('r5')) {
        this.createForm.AbortIncompleteMultipartUpload = {
          deleteExpired: false,
          deleteUncompleted: false,
          deleteUncompletedDay: ''
        }
      }
    },
    'createForm.Transition' (val, old) {
      if (val.length === 0) {
        const index = this.ruleOperate.findIndex(item => item === 'r1')
        if (index !== -1) {
          this.ruleOperate.splice(index, 1)
          this.createForm.Transition = []
        }
      }
    },
    'createForm.NoncurrentVersionTransitions' (val, old) {
      if (val.length === 0) {
        const index = this.ruleOperate.findIndex(item => item === 'r2')
        if (index !== -1) {
          this.ruleOperate.splice(index, 1)
          this.createForm.NoncurrentVersionTransitions = []
        }
      }
    }
  },
  mounted () {
    // this.$store.state.user._S3.deleteBucketLifecycle(
    //   {
    //     Bucket: this.bucketName
    //   },
    //   (err, data) => {
    //     if (err) {
    //       console.error(err)
    //     } else {
    //       console.log(data, 'deleteAll')
    //     }
    //   }
    // )

    this.getBucketLifecycle()
  },
  methods: {
    changeCheckBox (val) {
      if (val.includes('r5') && val.includes('r3')) {
        this.createForm.AbortIncompleteMultipartUpload.deleteExpired = false
      }
    },
    handleClickName (row) {
      const temp = [row]
      this.handleSelection(temp)
      this.$refs['multipleTable'].clearSelection()
      temp.forEach(item => {
        this.$refs['multipleTable'].toggleRowSelection(item)
      })
      this.visibleFlagInfo = true
    },
    handleSelection (val) {
      // 添加多选删除功能
      this.selectRule = val
      if (val && val.length > 1) {
        return
      } else if (val.length === 1) {
        this.radio = this.tableData.findIndex(item => item.ID === val[0].ID)
        this.handleRowChange(val[0])
      }
    },
    jumpToError () {
      this.$nextTick(() => {
        const isError = document.getElementsByClassName('is-error')
        // console.log(isError[0].getBoundingClientRect().top)
        document.querySelector('.bucket-detail .el-dialog__wrapper').scrollTo({
          behavior: 'smooth',
          top:
            isError[0].getBoundingClientRect().top +
            this.$refs['formData'].$el.scrollTop -
            60
        })
      }, 500)
    },

    handleScroll (ref) {
      this.$refs[ref].$el.scrollTop = 0
    },
    applyRange (scope) {
      if (Object.keys(scope.row.Filter || {}).length) {
        return this.$ts('bucket.hasFilter')
      } else {
        return this.$ts('bucket.allBucket')
      }
    },
    clearSelectRadio () {
      this.getBucketLifecycle()
    },
    delLifecycle () {
      if (this.selectRule && this.selectRule.length) {
        const name = this.selectRule.map(item => item.ID).join(';')
        const Rules = this.filterDiff(this.tableData, this.selectRule, 'ID')
        this.$confirm(
          this.$ts('bucket.deleteRuleTip'),
          this.$ts('bucket.deleteNameTip', { name }),
          {
            confirmButtonText: this.$ts('page.delete'),
            cancelButtonText: this.$ts('page.cancel'),
            type: 'warning'
          }
        ).then(() => {
          // 保留的个数大于0就put、无就全部删除
          if (Rules && Rules.length) {
            this.$store.state.user._S3.putBucketLifecycleConfiguration(
              {
                Bucket: this.bucketName,
                LifecycleConfiguration: {
                  Rules
                }
              },
              (err, data) => {
                if (err) {
                  this.showS3Msg(err)
                  console.error(err)
                } else {
                  this.$msg({
                    type: 'success',
                    text: this.$ts('page.responseSuccess')
                  })
                  this.visibleFlagInfo = false
                  this.clearSelectRadio()
                  console.log(data, 'deleteLifeCycle')
                }
              }
            )
          } else {
            this.$store.state.user._S3.deleteBucketLifecycle(
              {
                Bucket: this.bucketName
              },
              (err, data) => {
                if (err) {
                  this.showS3Msg(err)
                  console.error(err)
                } else {
                  this.$msg({
                    type: 'success',
                    text: this.$ts('page.responseSuccess')
                  })
                  this.visibleFlagInfo = false
                  this.clearSelectRadio()
                  console.log(data)
                }
              }
            )
          }
        })
      }
    },
    addModBtn (type) {
      this.operateType = type
      if (type === 'add') {
        this.clearForm()
        // 清空
      }
      this.visibleFlag = true
    },

    // 删除一项版本|非版本规则操作
    delTransition (i, type) {
      switch (type) {
        case 'currentVer':
          this.createForm.Transition.splice(i, 1)
          setTimeout(() => {
            // 删除后索引对应问题 校验报错 延迟校验
            this.validateIpt('createForm')
          })
          break
        case 'notCurrentVer':
          this.createForm.NoncurrentVersionTransitions.splice(i, 1)
          setTimeout(() => {
            this.validateIpt('createForm')
          })
          break
      }
      // 删除后需要重新判断option的禁用
    },

    // 对象转换option的禁用
    judgeDisabled (index, type) {
      // 打开时获取到上次的结果输入框已经禁用，但视图没效果
      this.$forceUpdate()
      let isCurrent
      if (type === 'currentVer') {
        isCurrent = 'Transition'
      } else {
        isCurrent = 'NoncurrentVersionTransitions'
      }
      // 点击项目的index 但是每个项目的option都是相同的
      // 每次打开option的时候，添加禁用,需要获得已有的option从而两头判断
      const option = this.createForm[isCurrent].map(item => item.key)
      // 根据当前的optionKey 判断前后的option的index 重新绘制其作用范围
      const pre = option[index - 1]
      const next = option[index + 1]
      const preK = pre - 1 // 1-6 对应的option index值-1
      const nextk = next - 1
      // 特殊校验 3、4 同类选一
      // 特殊校验 如果对象大小 最小或最大对象大小的值 有小于128kb则 添加option禁用
      // 禁用范围 从标准-IA 到 GIR
      if (this.minSizeTransLimit) {
        for (let i = 0; i < this.storageTransition.length; i++) {
          if (i < 4) {
            this.storageTransition[i].disabled = true
          } else {
            // 无第六项选择 当前释放禁用
            // option 5、6
            console.log(nextk, preK, i)
            if (nextk > 4) {
              this.storageTransition[i].disabled = true
            } else if (preK === 4) {
              this.storageTransition[i].disabled = true
            } else {
              this.storageTransition[i].disabled = false
            }
          }
        }
      } else {
        // 不考虑对象大小，根据已选范围禁用
        this.storageTransition.forEach((item, i) => {
          // 无后项直接根据前一项判断
          if (nextk === -1) {
            if (i <= preK) {
              this.storageTransition[i].disabled = true
            } else {
              this.storageTransition[i].disabled = false
            }
            // 有后项 nextk>-1
          } else {
            // 有前项
            if (preK > -1) {
              if (i >= nextk || i <= preK) {
                this.storageTransition[i].disabled = true
              } else {
                this.storageTransition[i].disabled = false
              }
              // 无前项
            } else {
              if (i >= nextk) {
                this.storageTransition[i].disabled = true
              } else {
                this.storageTransition[i].disabled = false
              }
            }
          }
        })
        // 单区 和 GIR 规则同时只生效一个，且只能由选中一个规则的select切换选中另外一个
        for (let i = 0; i < this.createForm[isCurrent].length; i++) {
          if (this.createForm[isCurrent][i].key === 3 && i !== index) {
            this.storageTransition[3].disabled = true
          } else if (this.createForm[isCurrent][i].key === 4 && i !== index) {
            this.storageTransition[2].disabled = true
          }
        }
      }
    },
    showTransitionRule (type) {
      if (type === 'currentVer') {
        type = 'Transition'
      } else if (type === 'notCurrentVer') {
        type = 'NoncurrentVersionTransitions'
      }
      for (let i = 0; i < this.storageTransition.length; i++) {
        // 初始化禁用,特殊情况过滤,最后面的，不能选前面的，特殊情况待列出
        this.storageTransition[i].disabled = false
        const len = this.createForm[type].length
        for (let j = 0; j < len; j++) {
          // 已选option 禁用
          if (this.createForm[type][j].key === this.storageTransition[i].value) {
            this.storageTransition[i].disabled = true
            // console.log(i, '禁用当前的i', j, '当前的j')
          }
        }
      }
      this.validateIpt('createForm')
    },
    // 添加转换规则，需要获取之前已有 剩余排除
    addTransitionType (type) {
      let arr
      let addItem
      if (type === 'currentVer') {
        arr = this.createForm.Transition.map(item => Number(item.key))
        addItem = {
          key: '',
          value: ''
        }
      } else if (type === 'notCurrentVer') {
        arr = this.createForm.NoncurrentVersionTransitions.map(item =>
          Number(item.key)
        )
        addItem = {
          key: '',
          value: '',
          ver: ''
        }
      }
      const len = arr.length
      // STANDARD_IA  1
      // ONEZONE_IA 2
      // INTELLIGENT_TIERING  3
      // GLACIER_IR  4
      // GLACIER  5
      // DEEP_ARCHIVE  6
      for (let i = 0; i < len; i++) {
        if (arr[i] === 1 && len === 1) {
          addItem.key = 2
        } else if (arr[i] === 2 && len === 2) {
          addItem.key = 3
          // 有标准
        } else if (arr[i] === 2 && len === 1) {
          // 无标准
          addItem.key = 3
        } else if (arr[i] === 3 && len === 3) {
          // 正常3个 第四个跳过GIR
          addItem.key = 5
        } else if (arr[i] === 3 && len === 2) {
          addItem.key = 5
        } else if (arr[i] === 3 && len === 1) {
          addItem.key = 5
        } else if (arr[i] === 4 && len === 3) {
          addItem.key = 5
        } else if (arr[i] === 4 && len === 2) {
          addItem.key = 5
        } else if (arr[i] === 4 && len === 1) {
          addItem.key = 5
        } else if (arr[i] === 5 && len === 4) {
          addItem.key = 6
        } else if (arr[i] === 5 && len === 3) {
          addItem.key = 6
        } else if (arr[i] === 5 && len === 2) {
          addItem.key = 6
        } else if (arr[i] === 5 && len === 1) {
          addItem.key = 6
        }
      }
      switch (type) {
        case 'currentVer':
          this.createForm.Transition.push(addItem)
          break
        case 'notCurrentVer':
          this.createForm.NoncurrentVersionTransitions.push(addItem)
          break
      }
    },

    // 删除规则 重置
    clearDelItem () {
      const index = this.ruleOperate.findIndex(item => {
        return item === 'r5'
      })
      if (index !== -1) {
        this.createForm.AbortIncompleteMultipartUpload.deleteExpired = false
        this.createForm.AbortIncompleteMultipartUpload.deleteUncompleted = false
        this.createForm.AbortIncompleteMultipartUpload.deleteUncompletedDay =
          ''
        this.ruleOperate.splice(index, 1)
      }
    },
    validateIpt (form) {
      this.$refs[form].validate()
    },
    covertByte (num, range) {
      switch (range) {
        case 'byte':
          return num
        case 'KB':
          return num * 1024
        case 'MB':
          return num * 1024 ** 2
        case 'GB':
          return num * 1024 ** 3
      }
    },
    getBucketLifecycle () {
      this.loading = true
      this.tableData = []
      this.total = 0
      this.$store.state.user._S3.getBucketLifecycleConfiguration(
        {
          Bucket: this.bucketName
        },
        (err, data) => {
          if (err) {
            if (err.code !== 'NoSuchLifecycleConfiguration') {
              this.showS3Msg(err)
              console.error(err)
            }
          } else {
            this.tableData = data.Rules
            this.copyData = [...this.tableData]
            this.total = data.Rules.length
          }
          this.currentPage = 1
          this.loading = false
        }
      )
    },
    clearForm () {
      this.createForm.ID = ''
      this.createForm.range = '1'
      this.createForm.prefixIpt = ''
      this.createForm.tag = []
      this.createForm.minSizeIpt = ''
      this.createForm.maxSizeIpt = ''
      this.createForm.Transition = []
      this.createForm.NoncurrentVersionTransitions = []
      this.createForm.AbortIncompleteMultipartUpload = {
        deleteExpired: false,
        deleteUncompleted: false,
        deleteUncompletedDay: ''
      }
      this.createForm.Expiration = ''
      this.createForm.NewerNoncurrentVersions = ''
      this.createForm.noncurrentDays = ''
      this.ruleOperate = []
      this.objectSize = []
      this.minSizeSelect = 'KB'
      this.maxSizeSelect = 'KB'
      this.clickSubmit = false
      setTimeout(() => {
        this.$refs['createForm'] && this.$refs['createForm'].clearValidate()
      })
    },
    submitCreate () {
      this.clickSubmit = true
      const hasSelectOneRule = this.validRuleOption
      this.$refs['createForm'].validate(valid => {
        if (valid) {
          if (hasSelectOneRule) return
          else {
            // const Tags = this.createForm.tag.map(item => {
            //   return {
            //     Key: item.Key,
            //     Value: item.Value
            //   }
            // })
            // const Transitions = this.createForm.Transition.map(item => {
            //   return {
            //     Days: +item.value,
            //     StorageClass: this.RuleKeyMap[item.key]
            //   }
            // })
            // const NoncurrentVersionTransitions = this.createForm.NoncurrentVersionTransitions.map(
            //   item => {
            //     return {
            //       NewerNoncurrentVersions: +item.ver,
            //       NoncurrentDays: +item.value,
            //       StorageClass: this.RuleKeyMap[item.key]
            //     }
            //   }
            // )
            const params = {
              Bucket: this.bucketName,
              LifecycleConfiguration: {
                Rules: [
                  {
                    ID: this.createForm.ID,
                    Status: 'Enabled',
                    Expiration: {
                      Days: +this.createForm.Expiration,
                      ExpiredObjectDeleteMarker: this.createForm
                        .AbortIncompleteMultipartUpload.deleteExpired
                    },
                    // Transitions,
                    // NoncurrentVersionTransitions,
                    NoncurrentVersionExpiration: {
                      NewerNoncurrentVersions: +this.createForm
                        .NewerNoncurrentVersions,
                      NoncurrentDays: +this.createForm.noncurrentDays
                    },
                    AbortIncompleteMultipartUpload: {
                      DaysAfterInitiation: +this.createForm
                        .AbortIncompleteMultipartUpload.deleteUncompletedDay
                    }
                  }
                ]
              }
            }
            if (params.LifecycleConfiguration.Rules[0].Expiration.Days) {
              delete params.LifecycleConfiguration.Rules[0].Expiration
                .ExpiredObjectDeleteMarker
            } else {
              delete params.LifecycleConfiguration.Rules[0].Expiration.Days
            }
            if (!this.ruleOperate.includes('r4')) {
              delete params.LifecycleConfiguration.Rules[0].NoncurrentVersionExpiration
            } else if (!params.LifecycleConfiguration.Rules[0].NoncurrentVersionExpiration.NewerNoncurrentVersions) {
              delete params.LifecycleConfiguration.Rules[0].NoncurrentVersionExpiration.NewerNoncurrentVersions
            }
            // value:0 删除参数
            if (!this.createForm.AbortIncompleteMultipartUpload.deleteUncompleted || !params.LifecycleConfiguration.Rules[0].AbortIncompleteMultipartUpload.DaysAfterInitiation) {
              delete params.LifecycleConfiguration.Rules[0].AbortIncompleteMultipartUpload
            }
            const temp = {
              Prefix: this.createForm.prefixIpt
              // Tags,
              // ObjectSizeGreaterThan: +this.covertByte(
              //   this.createForm.maxSizeIpt,
              //   this.maxSizeSelect
              // ),
              // ObjectSizeLessThan: +this.covertByte(
              //   this.createForm.minSizeIpt,
              //   this.minSizeSelect
              // )
            }
            let Filter = {}
            const res = []
            for (const key in temp) {
              // 值有效、添加到Filter
              if (!Array.isArray(temp[key])) {
                if (temp[key]) {
                  res.push({
                    key,
                    value: temp[key]
                  })
                }
              } else if (temp[key].length) {
                res.push({
                  key,
                  value: temp[key]
                })
              }
            }
            if (res && res.length > 1) {
              Filter.And = {}
              for (const item of res) {
                Filter.And[item.key] = item.value
              }
            } else if (res.length === 1) {
              const obj = res[0]
              if (res[0].key !== 'Tags') {
                Filter[obj.key] = obj.value
              } else {
                Filter = {
                  Tag: { ...obj.value[0] }
                }
              }
            }
            // 无筛选条件 整个存储桶参数为空
            if (this.createForm.range === '2') {
              params.LifecycleConfiguration.Rules[0].Filter = {}
            } else {
              params.LifecycleConfiguration.Rules[0].Filter = Filter
            }
            // 添加
            if (this.addOperate) {
              Array.prototype.push.apply(
                params.LifecycleConfiguration.Rules,
                this.tableData
              )
            } else {
              // 修改、找出tableData中的Id、并替换
              // 由于返回的字段没有唯一值、暂且取index进行替换、字段this.radio
              Array.prototype.push.apply(
                params.LifecycleConfiguration.Rules,
                this.tableData.filter((item, i) => i !== this.radio)
              )
            }
            this.$store.state.user._S3.putBucketLifecycleConfiguration(
              params,
              (err, data) => {
                if (err) {
                  this.showS3Msg(err)
                  console.dir(err)
                } else {
                  this.$msg({
                    type: 'success',
                    text: this.$ts('page.responseSuccess')
                  })
                  this.visibleFlag = false
                  this.getBucketLifecycle()
                }
              }
            )
            // console.log('correct form', this.createForm)
          }
        } else {
          console.error('error submit')
          this.jumpToError()
        }
      })
      // if (!hasSelectOneRule) {
      //   if (this.createForm.Transition && this.createForm.Transition.length) {
      //     Promise.all(
      //       this.createForm.Transition.map((item, i) => {
      //         return new Promise(resolve => {
      //           this.$refs['createForm'].validateField(
      //             `Transition.${i}.value`,
      //             valid => {
      //               resolve(valid)
      //             }
      //           )
      //         })
      //       })
      //     ).then(res => {
      //       console.log(res, '输出res')
      //     })
      //   }
      // }
    },
    // 绑定随机key值防止对应index错乱 影响校验问题
    addLabel () {
      this.createForm.tag.push({
        Key: '',
        Value: '',
        id: Math.random()
          .toString(36)
          .substring(2)
      })
    },
    handleRowChange (val) {
      if (!val) return
      // mod上次数据清除
      this.clearForm()
      // 数据回显、S3filter对象参数根据配置项进行返回，不统一、数据回显问题
      // 统一 对象返回格式
      // 保证若有一个筛选条件就需要添加And
      // if (val.Filter.And) {
      //   this.selectConfig = val
      // } else {
      //   var key = Object.keys(val.Filter)[0]
      //   var value = val.Filter[key]
      //   if (!key) {
      //     this.selectConfig = Object.assign(val, { Filter: { And: {}}})
      //   } else {
      //     var obj = {}
      //     obj[key] = value
      //     this.selectConfig = Object.assign(val, { Filter: { And: obj }})
      //   }
      // }
      this.selectConfig = val
      // 名称
      this.createForm.ID = this.selectConfig.ID

      // 筛选范围
      this.createForm.range = Object.keys(this.selectConfig.Filter || {}).length
        ? '1'
        : '2'
      // 前缀
      this.createForm.prefixIpt =
        (this.selectConfig.Filter && this.selectConfig.Filter.Prefix) || ''

      // // 对象标签
      // this.createForm.tag = this.selectConfig.Filter.And?.Tags || []

      // // 最小最大对象大小、input、select、转化为对应最大单位的数字、分割赋值,无返回默认为空KB
      // var minSize =
      //   this.byteConvert(this.selectConfig.Filter.And?.ObjectSizeGreaterThan) ||
      //   ' KB'
      // var maxSize =
      //   this.byteConvert(this.selectConfig.Filter.And?.ObjectSizeLessThan) ||
      //   ' KB'

      // var minArr = minSize.split(' ')
      // var maxArr = maxSize.split(' ')
      // this.createForm.minSizeIpt = minArr[0]
      // this.createForm.maxSizeIpt = maxArr[0]
      // this.minSizeSelect = minArr[1]
      // this.maxSizeSelect = maxArr[1]
      // if (Number(this.createForm.minSizeIpt)) {
      //   this.objectSize.push('min')
      // }
      // if (Number(this.createForm.maxSizeIpt)) {
      //   this.objectSize.push('max')
      // }

      // 数据回显、操作val的值赋值给createForm r1
      // this.createForm.Transition = this.selectConfig.Transitions.map(item => {
      //   return {
      //     key: this.RuleMapVal[item.StorageClass],
      //     value: item.Days
      //   }
      // })

      // // map 处理返回值 数据绑定 r2
      // this.createForm.NoncurrentVersionTransitions = this.selectConfig.NoncurrentVersionTransitions.map(
      //   item => {
      //     return {
      //       key: this.RuleMapVal[item.StorageClass],
      //       value: item.NoncurrentDays,
      //       ver: item.NewerNoncurrentVersions
      //     }
      //   }
      // )
      // r3
      this.createForm.Expiration =
        (this.selectConfig.Expiration && this.selectConfig.Expiration.Days) ||
        ''

      // r4
      this.createForm.NewerNoncurrentVersions =
        (this.selectConfig.NoncurrentVersionExpiration &&
          this.selectConfig.NoncurrentVersionExpiration
            .NewerNoncurrentVersions) ||
        ''
      this.createForm.noncurrentDays =
        (this.selectConfig.NoncurrentVersionExpiration &&
          this.selectConfig.NoncurrentVersionExpiration.NoncurrentDays) ||
        ''

      // 删除过期的对象删除标记  r5
      this.createForm.AbortIncompleteMultipartUpload.deleteExpired =
        (this.selectConfig.Expiration &&
          this.selectConfig.Expiration.ExpiredObjectDeleteMarker) ||
        false

      // 天数
      this.createForm.AbortIncompleteMultipartUpload.deleteUncompletedDay =
        (this.selectConfig.AbortIncompleteMultipartUpload &&
          this.selectConfig.AbortIncompleteMultipartUpload
            .DaysAfterInitiation) ||
        ''
      this.createForm.AbortIncompleteMultipartUpload.deleteUncompleted = false
      if (this.createForm.AbortIncompleteMultipartUpload.deleteUncompletedDay) {
        // 删除未完成的分段上传
        this.createForm.AbortIncompleteMultipartUpload.deleteUncompleted = true
      }

      // 当前版本、非当前版本、当前版本过期、非当前版本删除、删除过期或未完成对象上传
      if (this.createForm.Transition && this.createForm.Transition.length) {
        this.ruleOperate.push('r1')
      }
      if (
        this.createForm.NoncurrentVersionTransitions &&
        this.createForm.NoncurrentVersionTransitions.length
      ) {
        this.ruleOperate.push('r2')
      }
      if (this.createForm.Expiration) {
        this.ruleOperate.push('r3')
      }
      if (this.createForm.noncurrentDays) {
        this.ruleOperate.push('r4')
      }
      if (
        this.createForm.AbortIncompleteMultipartUpload.deleteExpired ||
        this.createForm.AbortIncompleteMultipartUpload.deleteUncompletedDay
      ) {
        this.ruleOperate.push('r5')
      }

      console.log(this.ruleOperate, 'ruleoperate', this.createForm, 'form')
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.radio = ''
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.radio = ''
    },
    changeStatus (type, row) {
      return {
        row,
        command: type
      }
    },
    handleStatus (str) {
      const selectName = str.row.ID
      const index = this.tableData.findIndex(item => {
        return item.ID === selectName
      })
      // 处理数据格式问题Filter、下的过滤条件、保持统一,
      const copyData = JSON.parse(JSON.stringify(this.tableData))
      // var len = Object.keys(copyData[index].Filter.And)
      // if (len && len.length===1) {
      //   copyData[index]['Filter'] = {
      //     ...copyData[index]['Filter'].And
      //   }
      // }
      // console.log(selectName, index, 'index', str, 'str')
      if (str.command === 'disabled') {
        this.$confirm(
          this.$ts('bucket.disableRuleTip'), this.$ts('bucket.disableNameTip', { name: selectName }),
          {
            confirmButtonText: this.$ts('page.disable'),
            cancelButtonText: this.$ts('page.cancel'),
            type: 'warning'
          }
        ).then(() => {
          copyData[index]['Status'] = 'Disabled'
          this.$store.state.user._S3.putBucketLifecycleConfiguration(
            {
              Bucket: this.bucketName,
              LifecycleConfiguration: {
                Rules: copyData
              }
            },
            (err, data) => {
              if (err) {
                this.showS3Msg(err)
                console.error(err)
              } else {
                console.log(data, 'changeStatus')
                if (this.visibleFlagInfo) {
                  this.selectConfig.Status = 'Disabled'
                }
                this.clearSelectRadio()
                this.$msg({
                  type: 'success',
                  text: this.$ts('page.responseSuccess')
                })
              }
            }
          )
        })
      } else {
        this.$confirm(
          this.$ts('bucket.enableRuleTip'), this.$ts('bucket.enableNameTip', { name: selectName }),
          {
            confirmButtonText: this.$ts('page.enable'),
            cancelButtonText: this.$ts('page.cancel'),
            type: 'warning'
          }
        ).then(() => {
          copyData[index]['Status'] = 'Enabled'
          this.$store.state.user._S3.putBucketLifecycleConfiguration(
            {
              Bucket: this.bucketName,
              LifecycleConfiguration: {
                Rules: copyData
              }
            },
            (err, data) => {
              if (err) {
                this.showS3Msg(err)
                console.error(err)
              } else {
                // console.log(data, 'changeStatus')
                if (this.visibleFlagInfo) {
                  this.selectConfig.Status = 'Enabled'
                }
                this.clearSelectRadio()
                this.$msg({
                  type: 'success',
                  text: this.$ts('page.responseSuccess')
                })
              }
            }
          )
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.fa:hover::after {
  display: none;
}

.searchIpt {
  width: 350px;
  margin: 10px 0;
}

::v-deep .dialog {
  top: -10%;

  .el-dialog__title {
    font-size: 20px;
  }

  .el-form-item {
    .el-form-item__label {
      float: none;
      margin-left: 0;
    }
  }

  .tipText {
    font-size: 12px;
  }

  .objectLabelTitle {
    margin: 10px 0;
    width: 340px;
    display: flex;
    justify-content: space-between;
  }

  .el-checkbox-group.obstacleTop {
    display: flex;
    flex-direction: column;
  }

  .obstacleRight {
    margin-right: 40px;
  }

  .obstacleTop {
    margin: 20px 0;
  }

  .obstacleVertical {
    margin-top: 20px;
  }

  .normalText {
    font-size: 16px;
  }

  .el-input__inner {
    height: 30px;
    line-height: 30px;
  }

  .el-checkbox__label {
    color: #d3d6d8;
  }

  .configList {
    position: relative;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-right: 50px;
    margin-bottom: 20px;

    .border {
      height: 100%;
      left: 55%;
    }

    .el-icon-bottom {
      margin: 30px 0;
    }

    h3 {
      font-size: 16px;
      margin: 20px 0;
    }

    p {
      margin: 20px 0;

      span {
        color: #d3d6d8;
      }
    }

    .currentVersion {
      width: 320px;
      margin-right: 50px;
    }

    .notCurrentVersion {
      width: 320px;

      p {
        word-break: break-word;
      }
    }
  }
}

.titleh1 {
  font-size: 18px;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.border {
  height: 150px;
  position: absolute;
  border-color: #4d5d64;
  border-width: 1px;
  border-style: solid;
  border-left: none;
}

::v-deep .ruleRange {
  .el-form-item__content {
    display: flex;
    flex-direction: column;

    label {
      margin-bottom: 10px;
    }
  }
}

.errorTip {
  margin: -20px 0 10px 0;
  color: #f56c6c;
  font-size: 12px;
}

.infoDialog {
  .configList {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 20px;

    .el-icon-bottom {
      margin: 30px 0;
    }

    .title {
      font-size: 20px;
      margin: 20px 0;
    }

    .notCurrentVersion {
      position: relative;
      border-left: 1px solid #4d5d64;
      padding-left: 40px;
    }

    p {
      width: 320px;
      display: flex;
      flex-direction: column;
      margin: 10px 0;
      box-sizing: border-box;

      &:nth-of-type(3n-1) {
        position: relative;
      }

      span {
        color: #d3d6d8;
      }

      .bL {
        left: -35px;
      }

      .bR {
        right: -35px;
      }
    }
  }

  .infoMenu {
    display: flex;
    justify-content: space-between;
  }
}

.ruleSelect {
  li {
    height: 65px;
  }

  // .el-select-dropdown__item.selected {
  //   border: 1px solid #ccc;
  // }
  span {

    // color: #16191f;
    // font-weight: 0 !important;
    &:nth-of-type(n + 2) {
      display: block;
      margin: -15px 0;
      font-size: 12px;
    }
  }
}
</style>
