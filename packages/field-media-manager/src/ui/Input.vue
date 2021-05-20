<template>
  <el-form-item
    v-loading="loading > 0"
    :label="fieldConfig.title"
    :prop="name"
    :rules="rules"
    :class="{ 'is-error': errors.length > 0 }"
    class="dockite-field-media-manager"
  >
    <el-alert
      v-if="bulkEditMode"
      title="Not compatible with bulk edit mode"
      type="error"
      show-icon
      :closable="false"
    >
      The media manager field is incompatible with bulk edit mode, images may only be assigned per
      document.
    </el-alert>
    <div v-else>
      <el-alert v-if="!s3Settings" title="No S3 settings found" type="error" show-icon>
        No available S3 settings were found on either the field or schema, please check to make sure
        they are configured
      </el-alert>

      <div v-else>
        <el-upload
          v-if="fieldData"
          v-show="settings.max === 0 || fieldData.items.length < settings.max"
          :key="key"
          action="#"
          mutiple
          :accept="settings.acceptedExtensions.join(',')"
          :http-request="handleUpload"
          :before-upload="handleBeforeUpload"
          :limit="settings.max !== 0 ? settings.max : Infinity"
          :show-file-list="false"
        >
          <el-button type="primary" :disabled="loading > 0">
            Click to upload
          </el-button>

          <div slot="tip" class="el-upload__tip">
            Accepted files: {{ settings.acceptedExtensions.join(', ') }}
            <span v-if="settings.maxSizeKB > 0">
              with a file size less than {{ settings.maxSizeKB / 1000 }} MB
            </span>
          </div>
        </el-upload>

        <ul v-if="fieldData" class="el-upload-list el-upload-list--picture">
          <li
            v-for="(file, index) in fieldData.items"
            :key="file.checksum"
            tabindex="0"
            class="el-upload-list__item is-success"
          >
            <img
              v-if="isImage(file.filename)"
              :src="file.url"
              class="el-upload-list__item-thumbnail"
            />

            <div v-else class="el-upload-list__item-thumbnail">
              <i class="el-icon-picture-outline font-xl" />
            </div>

            <div class="dockite-field-media-manager--item">
              <span class="el-upload-list__item-name dockite-field-media-manager--item-name">
                {{ file.filename }}
              </span>

              <div class="dockite-field-media-manager--item-copy">
                <el-button type="text" @click="handleCopyClick(file, 'markdown')">
                  Copy Markdown
                </el-button>
                <el-button type="text" @click="handleCopyClick(file, 'html')">
                  Copy HTML
                </el-button>
                <el-button type="text" @click="handleCopyClick(file, 'plain')">
                  Copy URL
                </el-button>
              </div>
            </div>

            <label class="el-upload-list__item-status-label">
              <i class="el-icon-upload-success el-icon-check" />
            </label>

            <i class="el-icon-close" @click="handleRemoveUpload(index)" />
            <i class="el-icon-close-tip">
              press delete to remove
            </i>
          </li>
        </ul>

        <div
          v-for="(error, index) in errors"
          :key="index"
          class="dockite-field-media-manager--error"
        >
          {{ error }}
        </div>

        <div class="el-form-item__description">
          {{ fieldConfig.description }}
        </div>
      </div>
    </div>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Schema } from '@dockite/database';
import axios from 'axios';
import gql from 'graphql-tag';

import {
  MediaManagerFieldSettings,
  MediaManagerValue,
  S3Settings,
  DockiteFieldMediaManagerEntity,
  MediaManagerItem,
} from '../types';

const presignURLMutation = gql`
  mutation PresignS3Object($input: PresignInput!) {
    presignS3Object(input: $input) {
      presignedUrl
      expiry
    }
  }
`;

const deleteObjectMutation = gql`
  mutation DeleteS3Object($input: DeleteS3ObjectInput!) {
    deleteS3Object(input: $input)
  }
`;

@Component({
  name: 'MediaManagerFieldInputComponent',
})
export default class MediaManagerFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: MediaManagerValue | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldMediaManagerEntity;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  @Prop({ default: () => false })
  readonly bulkEditMode!: boolean;

  public rules: object[] = [];

  public errors: string[] = [];

  public loading = 0;

  get settings(): MediaManagerFieldSettings {
    return this.fieldConfig.settings;
  }

  get s3Settings(): S3Settings | null {
    if (this.settings.useSchemaS3Settings && this.schema.settings.s3) {
      return this.schema.settings.s3;
    }

    if (
      this.settings.accessKey &&
      this.settings.secretAccessKey &&
      this.settings.bucket &&
      this.settings.endpoint
    ) {
      return {
        accessKey: this.settings.accessKey,
        secretAccessKey: this.settings.secretAccessKey,
        endpoint: this.settings.endpoint,
        bucket: this.settings.bucket,
      };
    }

    console.log('settings not found', JSON.stringify(this.settings));
    return null;
  }

  get key(): string {
    return 'no-upload';
  }

  get fieldData(): MediaManagerValue | null {
    return this.value;
  }

  set fieldData(value) {
    this.$emit('input', value);
  }

  public async handleUpload({ file }: { file: File }) {
    try {
      this.loading += 1;

      if (!this.fieldData) {
        throw new Error("fieldData hasn't been initialized");
      }

      const checksum = await this.getSHA256ChecksumFromFile(file);

      const path = [
        this.settings.pathPrefix || this.schema.name,
        this.fieldData.uid,
        file.name.toLowerCase(),
      ].join('/');

      const { data: presignUrlData } = await this.$apolloClient.mutate({
        mutation: presignURLMutation,
        variables: {
          input: {
            ...this.s3Settings,
            object: path,
            public: this.settings.public,
          },
        },
      });

      const { presignedUrl } = presignUrlData.presignS3Object;

      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
          'Cache-Control': 'max-age: 31536000',
        },
      });

      const fileUrl = presignedUrl.substring(0, presignedUrl.indexOf('?'));

      this.fieldData.items = [
        ...this.fieldData.items,
        {
          filename: file.name,
          path,
          type: file.type,
          checksum,
          size: file.size,
          url: fileUrl,
        },
      ];
    } catch (err) {
      this.addError(`An error occurred whilst uploading your file: ${file.name}`);
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async handleBeforeUpload(file: File): Promise<void> {
    const sizeInKB = file.size / 1000;

    let hasError = false;

    const [fileExtension] = file.name.split('.').reverse();

    if (!this.settings.acceptedExtensions.includes(`.${fileExtension.toLowerCase()}`)) {
      this.addError(
        `The file uploaded was not in the list of allowed file types: ${this.settings.acceptedExtensions.join(
          ', ',
        )}, extension provided: .${fileExtension.toLowerCase()}`,
      );

      hasError = true;
    }

    if (this.settings.maxSizeKB > 0 && sizeInKB > this.settings.maxSizeKB) {
      this.addError(
        `The file uploaded is too large. Max size: ${this.settings.maxSizeKB /
          1000} MB Provided size: ${Math.ceil(sizeInKB / 1000)} MB`,
      );

      hasError = true;
    }

    if (hasError) {
      throw new Error('Error during beforeUpload');
    }
  }

  public async handleRemoveUpload(index: number): Promise<void> {
    try {
      this.loading += 1;

      if (!this.fieldData) {
        return;
      }

      const objectToDelete = this.fieldData.items[index];

      await this.$apolloClient.mutate({
        mutation: deleteObjectMutation,
        variables: {
          input: {
            ...this.s3Settings,
            object: objectToDelete.path,
          },
        },
      });

      this.fieldData.items.splice(index, 1);
    } catch (_) {
      this.$message({
        message: 'An error occured whilst trying to remove the uploaded file.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async getSHA256ChecksumFromFile(file: File): Promise<string> {
    const checksumeArrayBuffer = await window.crypto.subtle.digest(
      'SHA-256',
      await file.arrayBuffer(),
    );

    const checksum = Array.from(new Uint8Array(checksumeArrayBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return checksum;
  }

  public handleCopyClick(file: MediaManagerItem, type: 'html' | 'markdown' | 'plain'): void {
    const override = this.settings.overrideBaseUrl;

    let content = file.url;

    if (override) {
      content = override.replace(/\/?$/, '/') + file.path;
    }

    if (type === 'html') {
      if (this.isImage(file.filename)) {
        content = `<img src="${content}" />`;
      } else {
        content = `<object data="${content}></object>`;
      }
    }

    if (type === 'markdown') {
      const fileNameWithoutExtension = file.filename
        .split('.')
        .slice(0, -1)
        .join('.');

      if (this.isImage(file.filename)) {
        content = `![${fileNameWithoutExtension}](${content})`;
      } else {
        content = `[${fileNameWithoutExtension}](${content})`;
      }
    }

    const success = this.copyToClipboard(content);

    if (success) {
      this.$message({
        message: 'Successfully copied to clipboard',
        type: 'success',
      });
    } else {
      this.$message({
        message: 'Unable to copy to clipboard',
        type: 'warning',
      });
    }
  }

  public copyToClipboard(content: string): boolean {
    const textarea = document.createElement('textarea');
    textarea.style.cssText = 'position: fixed; top: 0; left: 0; z-index: -1; opacity: 0;';

    textarea.value = content;

    document.body.appendChild(textarea);

    textarea.select();

    let success = false;

    try {
      success = document.execCommand('copy');
    } catch (_) {
      success = false;
    }

    document.body.removeChild(textarea);

    return success;
  }

  public addError(message: string): void {
    this.errors.unshift(message);

    window.setTimeout(() => {
      this.errors.pop();
    }, 7000);
  }

  public isImage(filename: string): boolean {
    const extension = filename.split('.').pop();

    return ['.gif', '.jpg', '.jpeg', '.png', '.svg', '.webp '].includes(`.${extension}`);
  }

  beforeMount(): void {
    if (this.value === null) {
      this.$emit('input', {
        uid: Date.now().toString(36),
        items: [],
      });
    }

    if (this.value && !this.value.uid) {
      this.$emit('input', {
        uid: Date.now().toString(36),
        items: this.value.items,
      });
    }

    if (this.settings.max) {
      this.rules.push(this.getMaxRule());
    }
  }

  public getMaxRule(): object {
    return {
      type: 'array',
      max: this.settings.max,
      message: `${this.fieldConfig.title} must contain at most ${this.settings.max} files.`,
      trigger: 'blur',
    };
  }
}
</script>

<style lang="scss">
.dockite-field-media-manager {
  .dockite-field-media-manager--item {
    display: flex;
    height: 100%;
    width: 100%;

    flex-direction: column;
    justify-content: center;
  }

  .dockite-field-media-manager--item-copy {
    .el-button {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      font-size: 0.75rem;
    }
  }

  .dockite-field-media-manager--item-name {
    line-height: 1.2 !important;
    padding-bottom: 7px;
    padding-left: 0;
  }

  .dockite-field-media-manager--error {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
  }

  .el-upload-list__item-thumbnail {
    i.el-icon-picture-outline {
      font-size: 2rem;
      line-height: 70px;
      text-align: center;
      width: 100%;
    }
  }
}
</style>
