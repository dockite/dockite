import { defineComponent, PropType, ref, toRefs } from 'vue';

import { DockiteFieldS3ImageEntity, MultipleS3ImageType, S3ImageType } from '../types';

export const ViewComponent = defineComponent({
  name: 'DockiteFieldS3ImageView',

  props: {
    modelValue: {
      type: (null as any) as PropType<S3ImageType | MultipleS3ImageType | null>,
      required: true,
    },

    field: {
      type: Object as PropType<DockiteFieldS3ImageEntity>,
      required: true,
    },
  },

  setup: props => {
    const { modelValue, field } = toRefs(props);

    const modalVisible = ref(false);

    const handleShowModal = (): void => {
      modalVisible.value = true;
    };

    const getImageView = (data: S3ImageType | MultipleS3ImageType): JSX.Element => {
      if (Array.isArray(data)) {
        return (
          <img
            src={data[0].url}
            alt={data[0].alt}
            onClick={handleShowModal}
            class="cursor-pointer w-full mx-auto object-cover"
            style="max-width: 75px;"
          />
        );
      }

      return (
        <img
          src={data.url}
          alt={data.alt}
          onClick={handleShowModal}
          class="cursor-pointer w-full mx-auto object-cover"
          style="max-width: 75px;"
        />
      );
    };

    const getModalView = (data: S3ImageType | MultipleS3ImageType): JSX.Element => {
      if (Array.isArray(data)) {
        return (
          <el-carousel>
            {data.map(item => (
              <el-carousel-item>
                <img src={item.url} alt={item.alt} class="w-full mx-auto object-cover" />
              </el-carousel-item>
            ))}
          </el-carousel>
        );
      }

      return (
        <img
          src={data.url}
          alt={data.alt}
          onClick={handleShowModal}
          class="w-full mx-auto object-cover"
        />
      );
    };

    return () => {
      if (!modelValue.value) {
        return <i class="el-icon-picture-outline font-xl" />;
      }

      return (
        <span>
          {getImageView(modelValue.value)}

          <el-dialog
            v-model={modalVisible.value}
            title={`${field.value.title} - Image View`}
            top="5vh"
            destroyOnClose
          >
            {getModalView(modelValue.value)}
          </el-dialog>
        </span>
      );
    };
  },
});
