import { defineComponent, PropType, computed, ref } from 'vue';

import { S3ImageFieldSettings, defaultOptions } from '../types';

interface SettingsComponentProps {
  value: S3ImageFieldSettings;
}

export const SettingsComponent = defineComponent({
  name: 'DockiteFieldS3ImageSettings',

  props: {
    modelValue: {
      type: Object as PropType<SettingsComponentProps['value']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    const settings = computed({
      get: () => props.modelValue,
      set: value => ctx.emit('update:modelValue', value),
    });

    if (!settings.value) {
      settings.value = { ...defaultOptions };
    }

    settings.value = {
      ...defaultOptions,
      ...settings.value,
    };

    return (): JSX.Element => (
      <>
        <el-form-item label="Accepted file types" prop="settings.acceptedExtensions">
          <el-select
            v-model={settings.value.acceptedExtensions}
            multiple
            filterable
            allow-create
            class="w-full"
          >
            {settings.value.acceptedExtensions.map(extension => (
              <el-option value={extension} label={extension} />
            ))}
          </el-select>
        </el-form-item>

        <el-form-item label="Maximum item size" prop="settings.maxSizeKB">
          <el-input-number v-model={settings.value.maxSizeKB} class="w-full" />

          <div class="el-form-item__description">
            The maximum size of an item specified in KB. Set to 0 to allow any size.
          </div>
        </el-form-item>

        <el-form-item label="Minimum number of images" prop="settings.min">
          <el-input-number v-model={settings.value.min} class="w-full" />

          <div class="el-form-item__description">
            The minimum number of images that can be uploaded.
          </div>
        </el-form-item>

        <el-form-item label="Maximum number of images" prop="settings.max">
          <el-input-number v-model={settings.value.max} class="w-full" />

          <div class="el-form-item__description">
            The maximum number of images that can be uploaded.
          </div>
        </el-form-item>

        <el-form-item label="Path Prefix" prop="settings.pathPrefix">
          <el-input v-model={settings.value.pathPrefix} class="w-full" />

          <div class="el-form-item__description">
            The prefix for the S3 object, if left empty the schema name will be used.
          </div>
        </el-form-item>

        <el-form-item label="Use Schema S3 Settings" prop="settings.useSchemaS3Settings">
          <el-switch v-model={settings.value.useSchemaS3Settings} />

          <div class="el-form-item__description">
            Use the schema provided s3 settings instead of those provided on the field. Requires an
            s3 property to be set on the schema settings with the following keys: accessKey,
            secretAccessKey, endpoint and bucket.
          </div>
        </el-form-item>

        <el-form-item
          class={{ hidden: !settings.value.useSchemaS3Settings }}
          label="Access Key"
          prop="settings.accessKey"
        >
          <el-input v-model={settings.value.accessKey} class="w-full" />

          <div class="el-form-item__description">
            The access key for the S3 compatible storage provider
          </div>
        </el-form-item>

        <el-form-item
          class={{ hidden: !settings.value.useSchemaS3Settings }}
          label="Secret Access Key"
          prop="settings.secretAccessKey"
        >
          <el-input v-model={settings.value.secretAccessKey} class="w-full" />

          <div class="el-form-item__description">
            The secret access key for the S3 compatible storage provider
          </div>
        </el-form-item>

        <el-form-item
          class={{ hidden: !settings.value.useSchemaS3Settings }}
          label="Endpoint"
          prop="settings.endpoint"
        >
          <el-input v-model={settings.value.endpoint} class="w-full" />

          <div class="el-form-item__description">
            The endpoint for the S3 compatible storage provider
          </div>
        </el-form-item>

        <el-form-item
          class={{ hidden: !settings.value.useSchemaS3Settings }}
          label="Bucket"
          prop="settings.bucket"
        >
          <el-input v-model={settings.value.bucket} class="w-full" />

          <div class="el-form-item__description">
            The bucket name for the S3 compatible storage provider
          </div>
        </el-form-item>

        <el-form-item label="Make public?" prop="settings.public">
          <el-switch v-model={settings.value.public} />

          <div class="el-form-item__description">
            Whether to make the uploaded items available for public reading.
          </div>
        </el-form-item>

        <el-form-item label="Image validation" prop="settings.imageValidation">
          <el-switch v-model={settings.value.imageValidation} />
        </el-form-item>

        <el-form-item
          class={{ hidden: !settings.value.useSchemaS3Settings }}
          label="Min Image Height"
          prop="settings.minHeight"
        >
          <el-input-number v-model={settings.value.minHeight} style="width: 100%" />
          <small>The mimimum image height in pixels.</small>
        </el-form-item>

        <el-form-item
          class={{ hidden: !settings.value.useSchemaS3Settings }}
          label="Max Image Height"
          prop="settings.maxHeight"
        >
          <el-input-number v-model={settings.value.maxHeight} style="width: 100%" />
          <small>The maximum image height in pixels.</small>
        </el-form-item>

        <el-form-item
          class={{ hidden: !settings.value.useSchemaS3Settings }}
          label="Min Image Width"
          prop="settings.minWidth"
        >
          <el-input-number v-model={settings.value.minWidth} style="width: 100%" />
          <small>The mimimum image width in pixels.</small>
        </el-form-item>

        <el-form-item
          class={{ hidden: !settings.value.useSchemaS3Settings }}
          label="Max Image Width"
          prop="settings.maxWidth"
        >
          <el-input-number v-model={settings.value.maxWidth} style="width: 100%" />
          <small>The maximum image width in pixels.</small>
        </el-form-item>
      </>
    );
  },
});

export default SettingsComponent;
