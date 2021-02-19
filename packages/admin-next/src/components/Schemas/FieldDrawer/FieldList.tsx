import { noop, sortBy } from 'lodash';
import { computed, defineComponent, PropType, ref, toRefs, withModifiers } from 'vue';

import { AvailableFieldItem } from '~/graphql';

export interface SchemaAvailableFieldsListComponentProps {
  availableFields: AvailableFieldItem[];
}

export const SchemaAvailableFieldsListComponent = defineComponent({
  props: {
    availableFields: {
      type: Array as PropType<SchemaAvailableFieldsListComponentProps['availableFields']>,
      required: true,
    },
  },

  setup: (props, ctx) => {
    const { availableFields } = toRefs(props);

    const filter = ref('');

    const filteredFields = computed(() => {
      if (availableFields.value) {
        const fields = availableFields.value.filter(field =>
          // Get all the text content for the available field and then perform
          // a search against it using the lowercase'd filter
          Object.values(field)
            .join(' ')
            .toLowerCase()
            .includes(filter.value.toLowerCase()),
        );

        return sortBy(fields, 'title');
      }

      return [];
    });

    const handleSelectField = (field: AvailableFieldItem): void => {
      ctx.emit('selected:field', field);
    };

    return () => (
      <div class="h-full flex flex-col px-3">
        <div class="py-2">
          <el-input
            v-model={filter.value}
            placeholder="Filter"
            onBlur={withModifiers(noop, ['self'])}
            clearable
          />
        </div>

        <div class="flex-1 flex flex-col items-stretch -my-2">
          {filteredFields.value.map(field => (
            <div class="py-2">
              <div
                class="py-2 px-3 flex flex-col justify-center border rounded hover:bg-gray-200 cursor-pointer"
                style={{ height: '80px' }}
                onClick={() => handleSelectField(field)}
                role="button"
              >
                <span class="block font-semibold">{field.title}</span>

                <p
                  class="text-sm truncate"
                  title={field.description}
                  style={{ maxHeight: '50px', textOverflow: 'ellipsis' }}
                >
                  {field.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
});
