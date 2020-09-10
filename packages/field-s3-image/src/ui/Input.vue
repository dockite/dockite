<template>
  <el-form-item
    :label="fieldConfig.title"
    :prop="name"
    :rules="rules"
    :class="{ 'is-error': errors.length > 0 }"
    class="dockite-field-s3-image"
  >
    <el-alert
      v-if="bulkEditMode"
      title="Not compatible with bulk edit mode"
      type="error"
      show-icon
      :closable="false"
    >
      The image field is incompatible with bulk edit mode, images may only be assigned per document.
    </el-alert>
    <div v-else>
      <el-alert v-if="!s3Settings" title="No S3 settings found" type="error" show-icon>
        No available S3 settings were found on either the field or schema, please check to make sure
        they are configured
      </el-alert>
      <div v-else>
        <el-upload
          v-show="limit > 0 && fieldData.length < limit"
          :key="key"
          action="#"
          :multiple="settings.multiple"
          :accept="settings.acceptedExtensions.join(',')"
          :http-request="handleUpload"
          :before-upload="handleBeforeUpload"
          :limit="limit"
          :show-file-list="false"
        >
          <el-button type="primary">
            Click to upload
          </el-button>
          <div slot="tip" class="el-upload__tip" style="line-height: 1.2">
            <div v-if="constraints.length > 0" class="block pt-1">
              The uploaded image must satify the following constraints:

              <ul class="list-disc" style="list-style-position: inside;">
                <li class="pt-1">
                  must only be one of the following file types:
                  <strong>{{ settings.acceptedExtensions.join(', ') }}</strong>
                </li>
                <li v-for="(constraint, index) in constraints" :key="index" class="pt-1">
                  {{ constraint }}
                </li>
              </ul>
            </div>
          </div>
        </el-upload>
        <vue-draggable
          v-model="fieldData"
          v-bind="dragOptions"
          handle=".item-handle"
          tag="ul"
          class="ul-upload-list el-upload-list--picture"
          @start="drag = true"
          @end="drag = false"
        >
          <li
            v-for="(file, index) in fieldData"
            :key="file.checksum"
            tabindex="0"
            class="el-upload-list__item is-success"
          >
            <div class="flex items-center">
              <div class="px-3 item-handle cursor-pointer">
                <i class="el-icon-hamburger text-xl" />
              </div>

              <img
                :src="file.url"
                :alt="file.alt"
                class="el-upload-list__item-thumbnail cursor-pointer"
                @click="handleShowImage(file)"
              />

              <div class="flex items-center h-full w-full">
                <div class="dockite-field-s3-image--item">
                  <a
                    class="el-upload-list__item-name dockite-field-s3-image--item-name"
                    :href="file.url"
                  >
                    <i class="el-icon-document" />
                    {{ file.name }}
                  </a>

                  <el-input v-model="file.alt" size="small" placeholder="Image alt text" />
                </div>
              </div>

              <label class="el-upload-list__item-status-label">
                <i class="el-icon-upload-success el-icon-check" />
              </label>

              <i class="el-icon-close" @click="handleRemoveUpload(index)" />
              <i class="el-icon-close-tip">
                press delete to remove
              </i>
            </div>
          </li>
        </vue-draggable>
        <div v-for="(error, index) in errors" :key="index" class="dockite-field-s3-image--error">
          {{ error }}
        </div>
        <div class="el-form-item__description">
          {{ fieldConfig.description }}
        </div>
      </div>
    </div>

    <el-dialog :visible.sync="showLightbox" :destroy-on-close="true" @close="selectedImage = null">
      <img
        v-if="selectedImage"
        :src="selectedImage.url"
        :alt="selectedImage.alt"
        class="w-full"
        style="max-height: 60vh; object-fit: contain;"
      />
      <div class="py-3">
        <a v-if="selectedImage" :href="selectedImage.url" target="_blank">
          <el-button>
            View in New Tab
          </el-button>
        </a>
      </div>
    </el-dialog>
  </el-form-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Schema } from '@dockite/database';
import axios from 'axios';
import gql from 'graphql-tag';
import VueDraggable from 'vuedraggable';

import {
  S3ImageType,
  S3ImageFieldSettings,
  ImageExtension,
  S3Settings,
  DockiteFieldS3ImageEntity,
} from '../types';

const presignURLMutation = gql`
  mutation PresignS3Object($input: PresignInput!) {
    presignS3Object(input: $input) {
      presignedUrl
      expiry
    }
  }
`;

@Component({
  name: 'S3ImageFieldInputComponent',
  components: {
    VueDraggable,
  },
})
export default class S3ImageFieldInputComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly value!: S3ImageType | S3ImageType[] | null;

  @Prop({ required: true })
  readonly formData!: object;

  @Prop({ required: true })
  readonly fieldConfig!: DockiteFieldS3ImageEntity;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  @Prop({ default: () => false })
  readonly bulkEditMode!: boolean;

  public rules: object[] = [];

  public errors: string[] = [];

  public showLightbox = false;

  public selectedImage: S3ImageType | null = null;

  public drag = false;

  public dragOptions = {
    animation: 200,
    disabled: false,
    ghostClass: 'ghost',
  };

  get settings(): S3ImageFieldSettings {
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

  get fieldData(): S3ImageType[] {
    if (this.value !== null) {
      if (Array.isArray(this.value)) {
        return this.value;
      }

      return [this.value];
    }

    return [];
  }

  set fieldData(value: S3ImageType[]) {
    if (value.length > 0) {
      if (this.settings.multiple) {
        this.$emit('input', value);
      } else {
        this.$emit('input', value.pop());
      }
    } else {
      this.$emit('input', null);
    }
  }

  get limit(): number {
    if (this.settings.max > 0) {
      return this.settings.max;
    }

    if (this.settings.multiple) {
      return Infinity;
    }

    return 1;
  }

  get constraints(): string[] {
    const constraints: string[] = [];

    if (this.settings.maxSizeKB) {
      constraints.push(`must be a file smaller than ${this.settings.maxSizeKB / 1000} MB`);
    }

    if (this.settings.minHeight) {
      constraints.push(`must be at least ${this.settings.minHeight} px tall`);
    }

    if (this.settings.maxHeight) {
      constraints.push(`must be at most ${this.settings.minHeight} px tall`);
    }

    if (this.settings.minWidth) {
      constraints.push(`must be at least ${this.settings.minWidth} px wide`);
    }

    if (this.settings.maxWidth) {
      constraints.push(`must be at most ${this.settings.maxWidth} px wide`);
    }

    if (this.settings.ratio) {
      constraints.push(`must maintain a ${this.settings.ratio} aspect ratio (width ÷ height)`);
    }

    return constraints;
  }

  async handleUpload({ file }: { file: File }) {
    try {
      const checksum = await this.getSHA256ChecksumFromFile(file);

      const path = [
        this.settings.pathPrefix || this.schema.name,
        checksum.substring(0, 8),
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
        },
      });

      const fileUrl = presignedUrl.substring(0, presignedUrl.indexOf('?'));

      if (this.settings.multiple) {
        this.fieldData = [
          ...this.fieldData,
          {
            name: file.name,
            alt: '',
            type: file.type,
            checksum,
            size: file.size,
            url: fileUrl,
            path,
          },
        ];
      } else {
        this.fieldData = [
          {
            name: file.name,
            alt: '',
            type: file.type,
            checksum,
            size: file.size,
            url: fileUrl,
            path,
          },
        ];
      }
    } catch (err) {
      this.addError(`An error occurred whilst uploading your file: ${file.name}`);
    }
  }

  async handleBeforeUpload(file: File): Promise<void> {
    const sizeInKB = file.size / 1000;

    let hasError = false;

    console.log({ file });

    const [fileExtension] = file.name.split('.').reverse();

    if (
      !this.settings.acceptedExtensions.includes(
        `.${fileExtension.toLowerCase()}` as ImageExtension,
      )
    ) {
      this.addError(
        `The file uploaded was not in the list of allowed file types: ${this.settings.acceptedExtensions.join(
          ', ',
        )}, extension provided: .${fileExtension.toLowerCase()}`,
      );
      hasError = true;
    }

    if (sizeInKB > this.settings.maxSizeKB) {
      this.addError(
        `The image uploaded is too large. Max size: ${this.settings.maxSizeKB /
          1000} MB Provided size: ${Math.ceil(sizeInKB / 1000)} MB`,
      );
      hasError = true;
    }

    if (this.settings.imageValidation) {
      const image = new Image();

      const imgPromise = new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      image.src = URL.createObjectURL(file);

      await imgPromise;

      console.log(image);

      if (this.settings.minWidth && image.width < this.settings.minWidth) {
        this.addError(
          `The image uploaded must have a width of atleast ${this.settings.minWidth} pixels`,
        );
        hasError = true;
      }

      if (this.settings.maxWidth && image.width > this.settings.maxWidth) {
        this.addError(
          `The image uploaded must have a width no greater than ${this.settings.maxWidth} pixels`,
        );
        hasError = true;
      }

      if (this.settings.minHeight && image.height < this.settings.minHeight) {
        this.addError(
          `The image uploaded must have a height of atleast ${this.settings.minHeight} pixels`,
        );
        hasError = true;
      }

      if (this.settings.maxHeight && image.height > this.settings.maxHeight) {
        this.addError(
          `The image uploaded must have a height no greater than ${this.settings.maxHeight} pixels`,
        );
        hasError = true;
      }

      const ratio = (image.width / image.height).toFixed(4);

      if (this.settings.ratio && ratio !== Number(this.settings.ratio).toFixed(4)) {
        this.addError(
          `The image uploaded must have an aspect ratio of ${this.settings.ratio} (width ÷ height) ratio provided: ${ratio}`,
        );
        hasError = true;
      }
    }

    if (hasError) {
      throw new Error('Error during beforeUpload');
    }
  }

  public handleRemoveUpload(index: number): void {
    this.fieldData = this.fieldData.filter((_, i) => i !== index);
  }

  async getSHA256ChecksumFromFile(file: File): Promise<string> {
    const checksumeArrayBuffer = await window.crypto.subtle.digest(
      'SHA-256',
      await file.arrayBuffer(),
    );

    const checksum = Array.from(new Uint8Array(checksumeArrayBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return checksum;
  }

  public addError(message: string): void {
    this.errors.unshift(message);

    window.setTimeout(() => {
      this.errors.pop();
    }, 7000);
  }

  beforeMount(): void {
    if (this.value === null) {
      // this.$emit('input', );
    }

    if (this.settings.multiple) {
      if (this.settings.min) {
        this.rules.push(this.getMinRule());
      }

      if (this.settings.max) {
        this.rules.push(this.getMaxRule());
      }
    }
  }

  public handleShowImage(image: S3ImageType): void {
    this.selectedImage = image;
    this.showLightbox = true;
  }

  public getMinRule(): object {
    return {
      type: 'array',
      min: this.settings.min,
      message: `${this.fieldConfig.title} must contain at least ${this.settings.min} images.`,
      trigger: 'blur',
    };
  }

  public getMaxRule(): object {
    return {
      type: 'array',
      max: this.settings.max,
      message: `${this.fieldConfig.title} must contain at most ${this.settings.max} images.`,
      trigger: 'blur',
    };
  }
}
</script>

<style lang="scss">
.dockite-field-s3-image--item {
  display: flex;
  height: 100%;
  width: 100%;

  flex-direction: column;
  justify-content: center;
}

.dockite-field-s3-image--item-name {
  line-height: 1.2 !important;
  padding-bottom: 7px;
}

.dockite-field-s3-image--error {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}

.dockite-field-s3-image {
  .el-upload-list__item {
    padding: 10px;
  }

  .el-upload-list__item-thumbnail {
    object-fit: contain;
  }

  .el-upload-list--picture .el-upload-list__item-thumbnail {
    margin: 0;
  }
}
</style>
