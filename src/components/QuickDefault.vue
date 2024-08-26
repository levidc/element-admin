<template>
  <div
    class="quick-default"
    :class="[vertical?'vertical':'horizontal']"
  >
    <el-radio-group
      v-model="isDefaultVal"
      :disabled="disabled"
      @change="onSelect"
    >
      <el-radio :label="true">{{ labelOfDefault }}</el-radio>
      <el-radio :label="false">{{ labelOfValue }}</el-radio>
    </el-radio-group>
    <div
      v-show="!isDefaultVal"
      class="value-input"
    >
      <slot
        :data="inside"
        :onChange="doChangeValue"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickDefault',
  components: {},
  props: {
    value: {
      type: [String, Number, Object, Array, undefined],
      default: undefined
    },
    defaultValue: {
      type: [String, Number, Object, Array, undefined],
      default: undefined
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    labelOfDefault: {
      type: String,
      default: '默认值'
    },
    labelOfValue: {
      type: String,
      default: '自定义'
    },
    vertical: {
      type: Boolean,
      default: false
    },
    checkValueIsDefault: {
      type: Function,
      default: (a, b) => a === b
    },
    manually: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inside: {
        value: ''
      },
      isDefaultVal: true
    }
  },
  watch: {
    value() {
      this.inside.value = this.value
      this.refresh()
    },
    isDefault() {
      this.isDefaultVal = this.isDefault
    }
  },
  mounted() {
    this.inside.value = this.value
    this.isDefaultVal = this.isDefault
    this.refresh()
  },
  methods: {
    refresh() {
      if (this.manually) return
      this.isDefaultVal = this.checkValueIsDefault(this.inside.value, this.defaultValue)
    },
    onSelect(sel) {
      this.isDefaultVal = sel
      if (!this.manually) {
        if (sel) {
          this.inside.value = this.defaultValue
        } else {
          this.inside.value = ''
        }
      }
      this.doChangeValue()
      this.$emit('select', this.isDefaultVal, this.inside.value)
    },
    doChangeValue(val = undefined) {
      if (this.manually) return
      if (val !== undefined) this.inside.value = val
      this.refresh()
      this.$emit('input', this.inside.value)
    }
  }
}
</script>

<style lang="scss" scoped>
.quick-default {
  display: flex;

  &.horizontal {
    align-items: center;

    .value-input {
      margin-left: 10px;
    }
  }

  &.vertical {
    flex-direction: column;

    .value-input {
      margin-top: 10px;
    }
  }
}
</style>
