<template>
  <div>
    <div class="page_content_wrap">
      <el-row class="mv_10">
        <el-button v-access="'admin:CreatePolicy'" size="small" type="primary" class="golden" @click="createPolicy">{{
          $ts("page.create") }}</el-button>
        <el-tooltip :content="$ts('page.refresh')" placement="top" effect="dark">
          <i class="el-icon-refresh right" @click="searchVal = ''; refresh()" />
        </el-tooltip>
        <el-input v-model="searchVal" class="search_style right" :placeholder="$ts('policies.nameSearch')" width="14"
          clearable />
      </el-row>
      <PoliciesTable ref="policyTable" :search-val="searchVal" />
    </div>
  </div>
</template>
<script>
import PoliciesTable from './PoliciesTable.vue'
export default {
  name: 'GeneralStrategy',
  components: {
    PoliciesTable
  },
  data () {
    return {
      searchVal: '',
    }
  },
  computed: {
  },
  watch: {
  },
  mounted () { },
  methods: {
    refresh () {
      this.$refs['policyTable'].listPolicies()
    },
    createPolicy () {
      this.$router.push({
        name: 'PolicyDetail',
        params: { name: 'create' }
      })
    },
  }
}
</script>
