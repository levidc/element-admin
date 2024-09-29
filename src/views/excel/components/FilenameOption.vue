<template>
  <div style="display:inline-block;">
    <!-- $ts is vue-i18n global function to translate lang -->
    <label class="radio-label" style="padding-left:0;">Filename: </label>
    <el-input v-model="filename" :placeholder="$ts('excel.placeholder')" style="width:350px;" prefix-icon="el-icon-document" />
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    filename: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  }
}
</script>
