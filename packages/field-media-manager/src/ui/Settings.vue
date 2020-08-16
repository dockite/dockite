<template>
  <div v-if="Object.keys(settings).length > 0">
    <el-form-item label="Base URL" prop="settings.overrideBaseUrl">
      <el-input v-model="settings.overrideBaseUrl" class="w-full" />
      <small>
        The base URL for the files, leave blank to use the URL from the S3 compatible provider.
      </small>
    </el-form-item>

    <el-form-item label="Accepted file types" prop="settings.acceptedExtensions">
      <el-select
        v-model="settings.acceptedExtensions"
        multiple
        filterable
        allow-create
        class="w-full"
      >
        <el-option
          v-for="extension in settings.acceptedExtensions"
          :key="extension"
          :value="extension"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Maximum item size" prop="settings.maxSizeKB">
      <el-input-number v-model="settings.maxSizeKB" class="w-full" />
      <small>
        The maximum size of an item specified in KB. Set to 0 to allow any size.
      </small>
    </el-form-item>

    <el-form-item label="Maximum number of items" prop="settings.max">
      <el-input-number v-model="settings.max" class="w-full" />
      <small>
        The maximum number of items that can be uploaded.
      </small>
    </el-form-item>

    <el-form-item label="Path Prefix" prop="settings.pathPrefix">
      <el-input v-model="settings.pathPrefix" class="w-full" />
      <small>
        The prefix for the S3 object, if left empty the schema name will be used.
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
      <el-input v-model="settings.accessKey" class="w-full" />
      <small>
        The access key for the S3 compatible storage provider
      </small>
    </el-form-item>

    <el-form-item
      v-show="!settings.useSchemaS3Settings"
      label="Secret Access Key"
      prop="settings.secretAccessKey"
    >
      <el-input v-model="settings.secretAccessKey" class="w-full" />
      <small>
        The secret access key for the S3 compatible storage provider
      </small>
    </el-form-item>

    <el-form-item v-show="!settings.useSchemaS3Settings" label="Endpoint" prop="settings.endpoint">
      <el-input v-model="settings.endpoint" class="w-full" />
      <small>
        The endpoint for the S3 compatible storage provider
      </small>
    </el-form-item>

    <el-form-item v-show="!settings.useSchemaS3Settings" label="Bucket" prop="settings.bucket">
      <el-input v-model="settings.bucket" class="w-full" />
      <small>
        The bucket name for the S3 compatible storage provider
      </small>
    </el-form-item>

    <el-form-item label="Make public?" prop="settings.public">
      <el-switch v-model="settings.public" />
      <small>
        Whether to make the uploaded items available for public reading.
      </small>
    </el-form-item>
  </div>
</template>

<script lang="ts">
import { Fragment } from 'vue-fragment';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { MediaManagerFieldSettings, DEFAULT_OPTIONS } from '../types';

@Component({
  name: 'MediaManagerFieldSettingsComponent',
  components: {
    Fragment,
  },
})
export default class MediaManagerFieldSettingsComponent extends Vue {
  @Prop({ required: true })
  readonly value!: MediaManagerFieldSettings;

  get settings(): MediaManagerFieldSettings {
    return this.value;
  }

  set settings(value: MediaManagerFieldSettings) {
    this.$emit('input', value);
  }

  mounted() {
    if (Object.keys(this.settings).length === 0) {
      this.settings = {
        ...DEFAULT_OPTIONS,
      };
    }

    this.settings = {
      ...DEFAULT_OPTIONS,
      ...this.settings,
    };
  }
}
</script>

<style></style>
