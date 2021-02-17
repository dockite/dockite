import { computed, defineComponent, PropType } from 'vue';

import { S3ImageType } from '../../types';

export const ImageItemComponent = defineComponent({
  name: 'ImageItemComponent',

  emits: ['removeUpload', 'update:modelValue'],

  props: {
    modelValue: {
      type: Object as PropType<S3ImageType>,
    },

    onRemoveUpload: {
      type: Function as PropType<() => void>,
    },
  },

  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue as S3ImageType,
      set: value => ctx.emit('update:modelValue', value),
    });

    return () => (
      <li tabindex={0} class="el-upload-list__item is-success">
        <div class="flex items-center">
          <div class="px-3 item-handle cursor-pointer">
            <i class="el-icon-hamburger text-xl" />
          </div>

          <el-image
            src={modelValue.value.url}
            alt={modelValue.value.alt}
            class="el-upload-list__item-thumbnail cursor-pointer"
            previewSrcList={[modelValue.value.url]}
          />

          <div class="flex items-center h-full w-full pl-3">
            <div class="dockite-field-s3-image--item">
              <a
                class="el-upload-list__item-name dockite-field-s3-image--item-name"
                href={modelValue.value.url}
              >
                <i class="el-icon-document" />
                {modelValue.value.name}
              </a>

              <el-input v-model={modelValue.value.alt} size="small" placeholder="Image alt text" />
            </div>
          </div>

          <label class="el-upload-list__item-status-label">
            <i class="el-icon-upload-success el-icon-check" />
          </label>

          <i class="el-icon-close" onClick={() => ctx.emit('removeUpload')} />
          <i class="el-icon-close-tip">press delete to remove</i>
        </div>
      </li>
    );
  },
});
