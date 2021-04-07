import { DockiteFieldInputComponentProps } from '@dockite/types';
import axios from 'axios';
import { computed, defineComponent, PropType, ref, toRefs, inject } from 'vue';
import VueDraggable from 'vuedraggable';

import {
  DockiteFieldS3ImageEntity,
  S3ImageType,
  MultipleS3ImageType,
  S3Settings,
  ImageExtension,
} from '../types';

import { ImageItemComponent } from './components/ImageItem';
import {
  DELETE_S3_OBJECT_MUTATION,
  PRESIGN_S3_OBJECT_MUTATION,
  PresignS3ObjectMutationResponse,
} from './queries';
import { getSHA256ChecksumFromFile, getImageConstraints, slugifyFileName } from './util';

import './Input.scss';

export type InputComponentProps = DockiteFieldInputComponentProps<
  S3ImageType | MultipleS3ImageType | null,
  DockiteFieldS3ImageEntity
>;

export const InputComponent = defineComponent({
  name: 'DockiteFieldS3ImageInput',

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
    const { errors, fieldConfig, name } = toRefs(props);

    const rules = ref<Array<Record<string, any>>>([]);

    const $graphql = inject<any>('$graphql');
    const $message = inject<any>('$message');

    const loading = ref(0);

    const localErrors = ref<string[]>([]);

    const fieldData = computed<MultipleS3ImageType>({
      get: () => {
        if (Array.isArray(props.modelValue)) {
          return props.modelValue;
        }

        if (props.modelValue) {
          return [props.modelValue];
        }

        return [];
      },

      set: (value: MultipleS3ImageType) => {
        if (value.length > 0) {
          if (props.fieldConfig.settings.multiple) {
            ctx.emit('input', value);
          } else {
            ctx.emit('input', value.pop());
          }
        } else {
          ctx.emit('input', null);
        }
      },
    });

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

    const addLocalError = (message: string): void => {
      localErrors.value.unshift(message);

      setTimeout(() => {
        localErrors.value.pop();
      }, 7000);
    };

    const handleUploadFile = async ({ file }: { file: File }): Promise<void> => {
      try {
        loading.value += 1;

        if (!fieldData.value || !s3Settings.value) {
          throw new Error('Attempt to upload file before field has loaded or S3 settings provided');
        }

        const checksum = await getSHA256ChecksumFromFile(file);

        const pathSegments = [
          settings.value.pathPrefix || props.schema.name,
          checksum.substring(0, 8),
          slugifyFileName(file.name),
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

        fieldData.value.push({
          path,
          checksum,
          name: file.name,
          alt: '',
          type: file.type,
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

      const fileExtension = `.${file.name
        .toLowerCase()
        .split('.')
        .pop()}` as ImageExtension;

      if (!settings.value.acceptedExtensions.includes(fileExtension)) {
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

      if (settings.value.imageValidation && fileExtension !== '.svg' && !error) {
        const image = new Image();

        const imagePromise = new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });

        image.src = URL.createObjectURL(file);

        await imagePromise;

        if (settings.value.minWidth && image.width < settings.value.minWidth) {
          addLocalError(
            `The image uploaded must have a width of atleast ${settings.value.minWidth} pixels`,
          );

          error = true;
        }

        if (settings.value.maxWidth && image.width > settings.value.maxWidth) {
          addLocalError(
            `The image uploaded must have a width no greater than ${settings.value.maxWidth} pixels`,
          );

          error = true;
        }

        if (settings.value.minHeight && image.height < settings.value.minHeight) {
          addLocalError(
            `The image uploaded must have a height of atleast ${settings.value.minHeight} pixels`,
          );

          error = true;
        }

        if (settings.value.maxHeight && image.height > settings.value.maxHeight) {
          addLocalError(
            `The image uploaded must have a height no greater than ${settings.value.maxHeight} pixels`,
          );

          error = true;
        }

        const ratio = (image.width / image.height).toFixed(4);

        if (settings.value.ratio && ratio !== Number(settings.value.ratio).toFixed(4)) {
          addLocalError(
            `The image uploaded must have an aspect ratio of ${settings.value.ratio} (width ÷ height) ratio provided: ${ratio}`,
          );

          error = true;
        }
      }

      if (error) {
        throw new Error('Image failed to meet constraints required for upload.');
      }
    };

    const handleRemoveUploadedFile = async (index = 0): Promise<void> => {
      try {
        loading.value += 1;

        if (!fieldData.value || fieldData.value.length < index) {
          return;
        }

        const fileToDelete = fieldData.value[index];

        await $graphql.executeMutation({
          query: DELETE_S3_OBJECT_MUTATION,
          variables: {
            ...s3Settings.value,
            object: fileToDelete.path,
          },
        });

        fieldData.value.splice(index, 1);
      } catch (_err) {
        $message.error('An error occurred while attempting to delete the uploaded image.');
      } finally {
        loading.value -= 1;
      }
    };

    if (fieldConfig.value.settings.required) {
      rules.value.push({
        required: true,
        message: `${fieldConfig.value.title} is required`,
        trigger: 'blur',
      });
    }

    return () => {
      if (props.bulkEditMode) {
        return (
          <el-alert
            title="Not compatible with bulk edit mode"
            type="error"
            showIcon
            closable={false}
          >
            The media manager field is incompatible with bulk edit mode, images may only be assigned
            per document.
          </el-alert>
        );
      }

      if (!s3Settings.value) {
        return (
          <el-alert title="No S3 settings found" type="error" showIcon closable={false}>
            No available S3 settings were found on either the field or schema, please check to make
            sure they are configured
          </el-alert>
        );
      }

      return (
        <el-form-item
          class={`dockite-field-s3-image ${errors.value[name.value] ? 'is-error' : ''}`}
          label={fieldConfig.value.title}
          prop={name.value}
          rules={rules.value}
        >
          {errors.value[name.value] && (
            <div class="el-form-item__error">{errors.value[name.value]}</div>
          )}
          <el-upload
            action="#"
            mutiple={settings.value.multiple}
            accept={settings.value.acceptedExtensions.join(',')}
            httpRequest={handleUploadFile}
            beforeUpload={handleBeforeUploadFile}
            limit={settings.value.max !== 0 ? settings.value.max : Infinity}
            showFileList={false}
            class={{
              hidden: settings.value.max !== 0 && fieldData.value.length < settings.value.max,
            }}
          >
            {{
              default: () => (
                <el-button type="primary" disabled={loading.value > 0}>
                  Click to upload
                </el-button>
              ),
              tip: () => (
                <div class="block pt-1 cursor-pointer dockite-s3-image--constraints">
                  <span class="underline">
                    The uploaded image must satisfy the following constraints:
                  </span>

                  <ul
                    class="list-disc dockite-s3-image--constraints-list"
                    style="list-style-position: inside;"
                  >
                    <li class="pt-1">
                      must only be one of the following file types:
                      <strong>{settings.value.acceptedExtensions.join(', ')}</strong>
                    </li>

                    {getImageConstraints(settings.value).map(imageConstraint => (
                      <li class="pt-1">{imageConstraint}</li>
                    ))}
                  </ul>
                </div>
              ),
            }}
          </el-upload>

          <VueDraggable
            v-model={fieldData.value}
            itemKey="checksum"
            animation={300}
            easing="cubic-bezier(0.37, 0, 0.63, 1)"
            handle=".item-handle"
            class="ul-upload-list el-upload-list--picture"
            tag="ul"
          >
            {{
              item: ({ index }: { index: number }) => (
                <ImageItemComponent
                  v-model={fieldData.value[index]}
                  onRemoveUpload={() => handleRemoveUploadedFile(index)}
                />
              ),
            }}
          </VueDraggable>

          <div class="el-form-item__description">{fieldConfig.value.description}</div>
        </el-form-item>
      );
    };
  },
});

export default InputComponent;
