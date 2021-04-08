import { noop } from 'lodash';
import { defineComponent, PropType, ref, withModifiers } from 'vue';
import { usePromise } from 'vue-composable';

import { Document } from '@dockite/database';

import { getRevisionsForDocument } from '~/common/api/documentRevisions';
import RenderIfComponent from '~/components/Common/RenderIf';
import SpinnerComponent from '~/components/Common/Spinner';

export interface DocumentRevisionsFlyoutComponentProps {
  document: Document;
}

export const DocumentRevisionsFlyoutComponent = defineComponent({
  name: 'DocumentRevisionsFlyoutComponent',

  props: {
    document: {
      type: Object as PropType<DocumentRevisionsFlyoutComponentProps['document']>,
      required: true,
    },
  },

  setup: props => {
    const drawerVisible = ref(false);

    const toggleDrawerVisibility = (): void => {
      drawerVisible.value = !drawerVisible.value;
    };

    const documentRevisions = usePromise(() => getRevisionsForDocument(props.document.id));

    return () => {
      return (
        <>
          <div class="fixed top-0 right-0 h-full flex justify-center items-center">
            <a
              class="bg-white py-2 pl-1 rounded-bl rounded-tl shadow text-sm"
              title="View Document History"
              href="#"
              onClick={withModifiers(toggleDrawerVisibility, ['prevent'])}
            >
              <i class="el-icon-arrow-left" />
            </a>
          </div>

          <el-drawer
            v-model={drawerVisible.value}
            title="Document History"
            appendToBody={true}
            size={400}
          >
            <div class="px-5">
              <RenderIfComponent condition={documentRevisions.loading.value}>
                <div class="el-loading-mask">
                  <div class="el-loading-spinner">
                    <SpinnerComponent />

                    <p class="el-loading-text">Revisions are still loading, please wait...</p>
                  </div>
                </div>
              </RenderIfComponent>

              <RenderIfComponent condition={!documentRevisions.loading.value}>
                <el-timeline>
                  <el-timeline-item
                    timestamp={new Date(props.document.updatedAt).toLocaleString()}
                    type="primary"
                  >
                    Current Status
                  </el-timeline-item>

                  {(documentRevisions.result.value || []).map(item => (
                    <el-timeline-item timestamp={new Date(item.createdAt).toLocaleString()}>
                      Modified by {item.user?.email ?? 'Unknown'}
                    </el-timeline-item>
                  ))}
                </el-timeline>
              </RenderIfComponent>
            </div>
          </el-drawer>
        </>
      );
    };
  },
});

export default DocumentRevisionsFlyoutComponent;
