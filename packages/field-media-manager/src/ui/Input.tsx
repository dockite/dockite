import { DockiteFieldInputComponentProps } from '@dockite/types';
import axios from 'axios';
import { defineComponent, PropType, computed, ref, inject } from 'vue';

import {
  DockiteFieldMediaManagerEntity,
  MediaManagerValue,
  S3Settings,
  MediaManagerItem,
} from '../types';

import {
  PRESIGN_S3_OBJECT_MUTATION,
  PresignS3ObjectMutationResponse,
  DELETE_S3_OBJECT_MUTATION,
} from './queries';
import { getSHA256ChecksumFromFile, isImage, isVideo, copyToClipboard } from './util';

export type InputComponentProps = DockiteFieldInputComponentProps<
  MediaManagerValue,
  DockiteFieldMediaManagerEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldMediaManagerInput',
  props: {
    name: {
      type: String as PropType<InputComponentProps['name']>,
      required: true,
    },
    modelValue: {
      type: (null as any) as PropType<InputComponentProps['value']>,
      required: true,
    },
    formData: {
      type: Object as PropType<InputComponentProps['formData']>,
      required: true,
    },
    schema: {
      type: Object as PropType<InputComponentProps['schema']>,
      required: true,
    },
    fieldConfig: {
      type: Object as PropType<InputComponentProps['fieldConfig']>,
      required: true,
    },
    errors: {
      type: Object as PropType<InputComponentProps['errors']>,
      required: true,
    },
    bulkEditMode: {
      type: Boolean as PropType<InputComponentProps['bulkEditMode']>,
      required: true,
    },
  },
  setup: (props, ctx) => {
    const modelValue = computed({
      get: () => props.modelValue,
      set: value => ctx.emit('update:modelValue', value),
    });

    const $graphql = inject<any>('$graphql');
    const $message = inject<any>('$message');

    const loading = ref(0);

    const localErrors = ref<string[]>([]);

    const settings = computed(() => props.fieldConfig.settings);

    const s3Settings = computed<S3Settings | null>(() => {
      if (settings.value.useSchemaS3Settings) {
        return props.schema.settings.s3;
      }

      if (
        settings.value.accessKey &&
        settings.value.secretAccessKey &&
        settings.value.bucket &&
        settings.value.endpoint
      ) {
        return {
          accessKey: settings.value.accessKey,
          secretAccessKey: settings.value.secretAccessKey,
          endpoint: settings.value.endpoint,
          bucket: settings.value.bucket,
        };
      }

      return null;
    });

    if (!modelValue.value) {
      modelValue.value = {
        items: [],
        uid: Date.now()
          .toString(36)
          .slice(2, -1),
      };
    }

    const addLocalError = (message: string): void => {
      localErrors.value.unshift(message);

      setTimeout(() => {
        localErrors.value.pop();
      }, 7000);
    };

    const handleUploadFile = async ({ file }: { file: File }): Promise<void> => {
      try {
        loading.value += 1;

        if (!modelValue.value || !s3Settings.value) {
          throw new Error('Attempt to upload file before field has loaded or S3 settings provided');
        }

        const checksum = await getSHA256ChecksumFromFile(file);

        const pathSegments = [
          settings.value.pathPrefix || props.schema.name,
          modelValue.value.uid,
          file.name,
        ];

        const path = pathSegments.join('/').toLowerCase();

        const {
          data: presignS3ObjectData,
        }: PresignS3ObjectMutationResponse = await $graphql.executeMutation({
          query: PRESIGN_S3_OBJECT_MUTATION,
          variables: {
            ...s3Settings.value,
            object: path,
            public: settings.value.public,
          },
        });

        const { presignedUrl } = presignS3ObjectData.presignS3Object;

        await axios.put(presignedUrl, file, {
          headers: { 'Content-Type': file.type },
        });

        const fileUrl = presignedUrl.substring(0, presignedUrl.indexOf('?'));

        modelValue.value.items.push({
          filename: file.name,
          path,
          type: file.type,
          checksum,
          size: file.size,
          url: fileUrl,
        });
      } catch (_err) {
        addLocalError(`An error occurred while uploading: ${file.name}`);
      } finally {
        loading.value -= 1;
      }
    };

    const handleBeforeUploadFile = async (file: File): Promise<void> => {
      const fileSizeInKilobytes = file.size / 1000;
      let error = false;

      const fileExtension = file.name.split('.').pop();

      if (!settings.value.acceptedExtensions.includes(`.${fileExtension.toLowerCase()}`)) {
        addLocalError(`The file "${file.name}" has an invalid extension.`);

        error = true;
      }

      if (settings.value.maxSizeKB && settings.value.maxSizeKB > fileSizeInKilobytes) {
        const maxFileSizeInMegabytes = settings.value.maxSizeKB / 1000;

        addLocalError(
          `The file "${file.name}" is to large, max size: ${maxFileSizeInMegabytes} MB`,
        );

        error = true;
      }

      if (error) {
        throw new Error('File failed to meet constraints required for upload.');
      }
    };

    const handleRemoveUploadedFile = async (index: number): Promise<void> => {
      try {
        loading.value += 1;

        if (!modelValue.value || modelValue.value.items.length < index) {
          return;
        }

        const fileToDelete = modelValue.value.items[index];

        await $graphql.executeMutation({
          query: DELETE_S3_OBJECT_MUTATION,
          variables: {
            ...s3Settings.value,
            object: fileToDelete.path,
          },
        });

        modelValue.value.items.splice(index, 1);
      } catch (_err) {
        $message.error('An error occurred while attempting to delete the uploaded file.');
      } finally {
        loading.value -= 1;
      }
    };

    const handleCopyToKeyboardClick = async (
      file: MediaManagerItem,
      type: 'html' | 'markdown' | 'plain',
    ): Promise<void> => {
      const override = settings.value.overrideBaseUrl;

      let { url } = file;

      if (override) {
        url = override.replace(/\/?$/, '/') + file.path;
      }

      const baseUrl = url;

      const isImageFile = isImage(file.filename);
      const isVideoFile = isVideo(file.filename);

      if (type === 'html') {
        url = `<object data="${baseUrl}"></object>`;

        if (isImageFile) {
          url = `<img src="${baseUrl}" />`;
        }

        if (isVideoFile) {
          url = `<video src="${baseUrl}"></video>`;
        }
      }

      if (type === 'markdown') {
        const fileNameWithoutExtension = file.filename
          .split('.')
          .slice(0, -1)
          .join('.');

        url = `[${fileNameWithoutExtension}](${baseUrl})`;

        if (isImageFile || isVideoFile) {
          url = `!${url}`;
        }
      }

      const success = copyToClipboard(url);

      if (!success) {
        $message.error('Unable to copy to clipboard!');

        return;
      }

      $message.success('Successfully copied to clipboard!');
    };

    return () => {
      if (!modelValue.value) {
        return <div>Field loading...</div>;
      }

      if (props.bulkEditMode) {
        return (
          <el-alert
            title="Not compatible with bulk edit mode"
            type="error"
            show-icon
            closable={false}
          >
            The media manager field is incompatible with bulk edit mode, images may only be assigned
            per document.
          </el-alert>
        );
      }

      if (!s3Settings.value) {
        return (
          <el-alert title="No S3 settings found" type="error" show-icon>
            No available S3 settings were found on either the field or schema, please check to make
            sure they are configured
          </el-alert>
        );
      }

      return (
        <>
          <el-upload
            action="#"
            mutiple
            accept={settings.value.acceptedExtensions.join(',')}
            http-request={handleUploadFile}
            before-upload={handleBeforeUploadFile}
            limit={settings.value.max !== 0 ? settings.value.max : Infinity}
            show-file-list={false}
            class={{
              hidden:
                settings.value.max === 0 || modelValue.value.items.length < settings.value.max,
            }}
          >
            {{
              default: () => (
                <el-button type="primary" disabled={loading.value > 0}>
                  Click to upload
                </el-button>
              ),
              tip: () => (
                <div class="el-upload__tip">
                  Accepted files: {settings.value.acceptedExtensions.join(', ')}
                  {settings.value.maxSizeKB && (
                    <span>with a file size less than {settings.value.maxSizeKB / 1000} MB</span>
                  )}
                </div>
              ),
            }}
          </el-upload>

          <ul class="el-upload-list el-upload-list--picture">
            {modelValue.value.items.map((item, index) => (
              <li tabindex={0} class="el-upload-list__item is-success">
                {isImage(item.url) && <img src={item.url} class="el-upload-list__item-thumbnail" />}

                {!isImage(item.url) && (
                  <div class="el-upload-list__item-thumbnail">
                    <i class="el-icon-picture-outline font-xl" />
                  </div>
                )}

                <div class="dockite-field-media-manager--item">
                  <span class="el-upload-list__item-name dockite-field-media-manager--item-name">
                    {item.filename}
                  </span>

                  <div class="dockite-field-media-manager--item-copy">
                    <el-button
                      type="text"
                      onClick={() => handleCopyToKeyboardClick(item, 'markdown')}
                    >
                      Copy Markdown
                    </el-button>
                    <el-button type="text" onClick={() => handleCopyToKeyboardClick(item, 'html')}>
                      Copy HTML
                    </el-button>
                    <el-button type="text" onClick={() => handleCopyToKeyboardClick(item, 'plain')}>
                      Copy URL
                    </el-button>
                  </div>
                </div>

                <label class="el-upload-list__item-status-label">
                  <i class="el-icon-upload-success el-icon-check" />
                </label>

                <i class="el-icon-close" onClick={() => handleRemoveUploadedFile(index)} />

                <i class="el-icon-close-tip">Click on the close icon to delete the file</i>
              </li>
            ))}
          </ul>
        </>
      );
    };
  },
});

export default InputComponent;
