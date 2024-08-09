
<template>
  <div class="container">
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane
        v-for="{components,tabName,label} in resourceList"
        :key="tabName"
        :name="tabName"
        :label="label"
      >
        <component :is="components" v-if="activeName===tabName" />
      </el-tab-pane>
      <!-- <el-tab-pane name="nas" label="NAS资源"><NAS /></el-tab-pane>
      <el-tab-pane name="es" label="ES资源"><ES /></el-tab-pane>
      <el-tab-pane name="hdfs" label="HDFS资源"><BigData /></el-tab-pane>
      <el-tab-pane name="glacier" label="冰存储资源"><Glacier /></el-tab-pane>
      <el-tab-pane name="database" label="数据库资源"><Database /></el-tab-pane> -->
    </el-tabs>
  </div>
</template>

<script>
import NAS from '@/components/page/objectStorage/objectResource/nas'
import ES from '@/components/page/objectStorage/objectResource/ES'
import BigData from '@/components/page/objectStorage/objectResource/BigData'
import Glacier from '@/components/page/objectStorage/objectResource/Glacier'
import Database from '@/components/page/objectStorage/objectResource/Database'
export default {
  name: '',
  components: {
    NAS,
    ES,
    BigData,
    Glacier,
    Database
  },
  props: {},
  data() {
    return {
      activeName: 'nas',
      resourceList: [
        {
          components: NAS,
          tabName: 'nas',
          label: 'NAS资源'
        },
        {
          components: ES,
          tabName: 'es',
          label: 'ES资源'
        }, {
          components: BigData,
          tabName: 'hdfs',
          label: 'HDFS资源'
        }, {
          components: Database,
          tabName: 'database',
          label: '数据库资源'
        }, {
          components: Glacier,
          tabName: 'glacier',
          label: '冰存储资源'
        }
      ]
    }
  },
  computed: {},
  watch: {},
  created() {},
  mounted() {},
  methods: {}
}
</script>
<style lang="scss" scoped>
.container{
  padding-top: 20px;
}
</style>
