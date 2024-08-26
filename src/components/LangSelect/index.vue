<template>
  <el-dropdown trigger="click" class="international" @command="handleSetLanguage">
    <div>
      <!-- <svg-icon class-name="international-icon" icon-class="language" /> -->
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-language" />
      </svg>
      <span>
        {{ showSelLang }}
      </span>
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item v-for="{value,label} in langList" :key="value" :command="value" :disabled="language===value">
        {{ label }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  data() {
    return {
      langList: [
        {
          value: 'zh',
          label: '中文'
        },
        {
          value: 'en',
          label: 'English'
        },
        {
          value: 'es',
          label: 'Español'
        }, {
          value: 'ja',
          label: '日本語'
        }
      ]
    }
  },
  computed: {
    language() {
      return this.$store.getters.language
    },
    showSelLang() {
      return this.langList.find(x => x.value === this.language)?.label
    }
  },
  methods: {
    handleSetLanguage(lang) {
      this.$i18n.locale = lang
      this.$store.dispatch('app/setLanguage', lang)
      window.location.reload()
      this.$message({
        message: 'Switch Language Success',
        type: 'success'
      })
    }
  }
}
</script>
