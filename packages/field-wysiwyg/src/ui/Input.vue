<template>
  <el-form-item
    :label="fieldConfig.title"
    :prop="name"
    :rules="rules"
    class="dockite-field-wysiwyg"
  >
    <el-editor v-model="fieldData" :height="400" :extensions="extensions" lang="en" />
    <div class="el-form-item__description">
      {{ fieldConfig.description }}
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import * as ElementTipTap from 'element-tiptap';

import { WysiwygFieldSettings, DockiteFieldWysiwygEntity, AvailableExtensions } from '../types';
import { AvailableExtensionItem } from '../../lib/types';

import 'element-tiptap/lib/index.css';

@Component({
  name: 'WysiwygFieldInputComponent',
  components: {
    ElEditor: ElementTipTap.ElementTiptap,
  },
})
export default class WysiwygFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: string | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldWysiwygEntity;

  public rules: object[] = [];

  public extensions: any[] = [];

  get fieldData(): string {
    if (this.value !== null) {
      return this.value;
    }

    return '';
  }

  set fieldData(value: string) {
    this.$emit('input', value);
  }

  get settings(): WysiwygFieldSettings {
    return this.fieldConfig.settings;
  }

  beforeMount(): void {
    if (this.value === null) {
      this.$emit('input', '');
    }

    const extensions: AvailableExtensionItem[] = [];

    if (this.settings.extensions && this.settings.extensions.length > 0) {
      extensions.push(...this.settings.extensions);
    } else {
      extensions.push(...AvailableExtensions);
    }

    this.extensions = extensions.map(extension => {
      switch (extension) {
        case 'Heading':
          return new ElementTipTap[extension]({ bubble: true, level: 5 });
        case 'Bold':
        case 'Italic':
        case 'Underline':
        case 'Strike':
        case 'Link':
          return new ElementTipTap[extension]({ bubble: true });
        default:
          return new ElementTipTap[extension]();
      }
    });

    if (this.settings.required) {
      this.rules.push(this.getRequiredRule());
    }

    if (this.settings.minLen) {
      this.rules.push(this.getMinRule());
    }

    if (this.settings.maxLen) {
      this.rules.push(this.getMaxRule());
    }
  }

  getRequiredRule(): object {
    return {
      required: true,
      message: `${this.fieldConfig.title} is required`,
      trigger: 'blur',
    };
  }

  getMinRule(): object {
    return {
      min: Number(this.settings.minLen),
      message: `${this.fieldConfig.title} must contain atleast ${this.settings.minLen} characters.`,
      trigger: 'blur',
    };
  }

  getMaxRule(): object {
    return {
      max: Number(this.settings.maxLen),
      message: `${this.fieldConfig.title} must contain no more than ${this.settings.maxLen} characters.`,
      trigger: 'blur',
    };
  }
}
</script>

<style lang="scss">
.dockite-field-wysiwyg {
  .el-tiptap-editor > .el-tiptap-editor__content {
    padding: 7px 10px;
  }

  .el-tiptap-editor .ProseMirror {
    height: 100%;
  }
}
</style>
