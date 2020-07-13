<template>
  <div v-if="Object.keys(settings).length > 0">
    <el-form-item label="Required" prop="settings.required">
      <el-switch v-model="settings.required" />
    </el-form-item>

    <el-form-item label="Accepted image types" prop="settings.acceptedExtensions">
      <el-select v-model="settings.acceptedExtensions" multiple style="width: 100%">
        <el-option v-for="extension in imageTypeExtensions" :key="extension" :value="extension" />
      </el-select>
    </el-form-item>

    <el-form-item label="Maximum image size" prop="settings.maxSizeKB">
      <el-input-number v-model="settings.maxSizeKB" style="width: 100%" />
      <small>
        The maximum size of an image specified in KB.
      </small>
    </el-form-item>

    <el-form-item label="Image validation" prop="settings.imageValidation">
      <el-switch v-model="settings.imageValidation" />
    </el-form-item>

    <el-form-item
      v-show="settings.imageValidation"
      label="Min Image Height"
      prop="settings.minHeight"
    >
      <el-input-number v-model="settings.minHeight" style="width: 100%" />
      <small>
        The mimimum image height in pixels.
      </small>
    </el-form-item>

    <el-form-item
      v-show="settings.imageValidation"
      label="Max Image Height"
      prop="settings.maxHeight"
    >
      <el-input-number v-model="settings.maxHeight" style="width: 100%" />
      <small>
        The maximum image height in pixels.
      </small>
    </el-form-item>

    <el-form-item
      v-show="settings.imageValidation"
      label="Min Image Width"
      prop="settings.minWidth"
    >
      <el-input-number v-model="settings.minWidth" style="width: 100%" />
      <small>
        The mimimum image width in pixels.
      </small>
    </el-form-item>

    <el-form-item
      v-show="settings.imageValidation"
      label="Max Image Width"
      prop="settings.maxWidth"
    >
      <el-input-number v-model="settings.maxWidth" style="width: 100%" />
      <small>
        The maximum image width in pixels.
      </small>
    </el-form-item>

    <el-form-item v-show="settings.imageValidation" label="Image Ratio" prop="settings.ratio">
      <el-input-number v-model="settings.ratio" :step="0.01" :precision="10" style="width: 100%" />
      <small>
        The ratio of the image.
      </small>
    </el-form-item>

    <el-form-item label="Allow Multiple Images" prop="settings.multiple">
      <el-switch v-model="settings.multiple" />
      <small>
        Are multiple image uploads allowed?
      </small>
    </el-form-item>

    <el-form-item v-show="settings.multiple" label="Image Limit" prop="settings.limit">
      <el-input-number v-model="settings.limit" style="width: 100%" />
      <small>
        The maximum number of images that can be uploaded.
      </small>
    </el-form-item>

    <el-form-item label="Use Schema S3 Settings" prop="settings.useSchemaS3Settings">
      <el-switch v-model="settings.useSchemaS3Settings" />
      <small>
        Use the schema provided s3 settings instead of those provided on the field. Requires an s3
        property to be set on the schema settings with the following keys: accessKey,
        secretAccessKey, endpoint and bucket.
      </small>
    </el-form-item>

    <el-form-item
      v-show="!settings.useSchemaS3Settings"
      label="Access Key"
      prop="settings.accessKey"
    >
      <el-input v-model="settings.accessKey" style="width: 100%" />
      <small>
        The access key for the S3 compatible storage provider
      </small>
    </el-form-item>

    <el-form-item
      v-show="!settings.useSchemaS3Settings"
      label="Secret Access Key"
      prop="settings.secretAccessKey"
    >
      <el-input v-model="settings.secretAccessKey" style="width: 100%" />
      <small>
        The secret access key for the S3 compatible storage provider
      </small>
    </el-form-item>

    <el-form-item v-show="!settings.useSchemaS3Settings" label="Endpoint" prop="settings.endpoint">
      <el-input v-model="settings.endpoint" style="width: 100%" />
      <small>
        The endpoint for the S3 compatible storage provider
      </small>
    </el-form-item>

    <el-form-item v-show="!settings.useSchemaS3Settings" label="Bucket" prop="settings.bucket">
      <el-input v-model="settings.bucket" style="width: 100%" />
      <small>
        The bucket name for the S3 compatible storage provider
      </small>
    </el-form-item>
  </div>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { S3ImageFieldSettings, imageTypeExtensions } from '../types';
import { DockiteFieldS3Image } from '..';

@Component({
  components: {
    Fragment,
  },
})
export default class S3ImageFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: S3ImageFieldSettings;

  public imageTypeExtensions = imageTypeExtensions;

  get settings(): S3ImageFieldSettings {
    return this.value;
  }

  set settings(value: S3ImageFieldSettings) {
    this.$emit('input', value);
  }

  mounted() {
    if (Object.keys(this.settings).length === 0) {
      this.settings = {
        ...DockiteFieldS3Image.defaultOptions,
      };
    }

    this.settings = {
      ...DockiteFieldS3Image.defaultOptions,
      ...this.settings,
    };
  }
}
</script>

<style></style>
