<template>
  <a-form-model-item
    ref="field"
    :label="fieldConfig.title"
    :colon="true"
    :prop="fieldConfig.name"
  >
    <div class="dockite-field colorpicker relative">
      <div
        v-if="show"
        class="dockite-field colorpicker popup"
      >
        <color-picker
          :value="fieldData"
          :disable-alpha="true"
          :preset-colors="[]"
          @input="
            v => {
              fieldData = v.hex;
            }
          "
        />
      </div>
      <div
        class="dockite-field colorpicker color-bar"
        @click="show = !show"
      >
        <div
          :style="{ background: fieldData, color: textColor }"
        >
          <span>{{ fieldData }}</span>
        </div>
      </div>
    </div>
    <p slot="extra">
      {{ fieldConfig.description }}
    </p>
  </a-form-model-item>
</template>

<script>
import { Sketch } from 'vue-color';
import tinycolor from 'tinycolor2';

export default {
  name: 'ColorpickerField',

  components: {
    ColorPicker: Sketch,
  },

  props: {
    name: {
      type: String,
      required: true,
    },
    value: {
      validator: (value) => typeof value === 'string' || value === null,
      required: true,
    },
    formData: {
      type: Object,
      required: true,
    },
    fieldConfig: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      show: false,
      eventListener: null,
    };
  },

  computed: {
    fieldData: {
      get() {
        if (this.value !== null) {
          return this.value;
        }

        return '#000000';
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    textColor() {
      return tinycolor(this.fieldData).isDark() ? '#ffffff' : '#000000';
    },
  },

  mounted() {
    if (this.value === null) {
      this.$emit('input', '#000000');
    }

    const rules = [this.getHexColorRule()];

    if (this.fieldConfig.settings.required) rules.push(this.getRequiredRule());

    this.$emit('update:rules', { [this.fieldConfig.name]: rules });

    window.addEventListener('click', this.handleOutsideClick);

    this.$refs.field.$el.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  },

  destroyed() {
    window.removeEventListener('click', this.handleOutsideClick);
  },


  methods: {
    getRequiredRule() {
      return {
        required: true,
        message: `${this.fieldConfig.title} is required`,
        trigger: 'change',
      };
    },

    getHexColorRule() {
      return {
        pattern: /^#(?:\d{6}|d{8})$/,
        message: `${this.fieldConfig.title} must be a valid hexadecimal color`,
        trigger: 'change',
      };
    },

    handleOutsideClick() {
      this.show = false;
    },
  },
};
</script>

<style lang="scss">
.dockite-field.colorpicker {
  &.color-bar {
    height: 60px;
    width: 100%;
    padding: 7px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #d9d9d9;
    box-sizing: border-box;
    border-radius: 4px;

    cursor: pointer;

    div {
      flex: 1 1 auto;

      height: 100%;
      width: 100%;

      display: flex;
      justify-content: center;
      align-items: center;

      border-radius: 4px;
    }

    span {
      font-size: 1rem;
    }
  }

  &.relative {
    position: relative;
  }

  &.popup {
    position: absolute;
    left: 0;
    bottom: 60px;
    padding-bottom: 20px;
    z-index: 9999;
  }
}
</style>
