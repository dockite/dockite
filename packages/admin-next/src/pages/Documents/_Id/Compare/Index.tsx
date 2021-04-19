import CodeMirror from 'codemirror';
import { computed, defineComponent, nextTick, ref, watch } from 'vue';
import { usePromise } from 'vue-composable';
import { useRoute, useRouter } from 'vue-router';

import { DocumentRevision } from '@dockite/database';

import { getDocumentById } from '~/common/api';
import { getDocumentRevision } from '~/common/api/documentRevisions';
import { RenderIfComponent } from '~/components/Common/RenderIf';
import { useState } from '~/hooks';
import { loadScript, stableJSONStringify } from '~/utils';

import 'codemirror/mode/javascript/javascript';

import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/merge/merge';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/search/search';

import 'codemirror/lib/codemirror.css';

import 'codemirror/theme/nord.css';
import 'codemirror/addon/merge/merge.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/lint/lint.css';

import './Input.scss';

export const DocumentComparePage = defineComponent({
  name: 'DocumentComparePage',

  setup: () => {
    const route = useRoute();
    const router = useRouter();

    const state = useState();

    const editor = ref<CodeMirror.MergeView.MergeViewEditor | null>(null);

    const targetEl = ref<HTMLElement | null>(null);

    const highlightRevision = ref(false);

    const isComparingAgainstCurrent = computed(
      () =>
        !route.query.source ||
        (typeof route.query.source === 'string' && route.query.source.toLowerCase() === 'current'),
    );

    const source = usePromise(() => {
      if (!isComparingAgainstCurrent.value) {
        return getDocumentRevision(route.params.documentId as string, route.query.source as string);
      }

      return getDocumentById({
        id: route.params.documentId as string,
        locale: state.locale.id,
      }).then(doc => {
        return {
          id: doc.id,
          data: doc.data,
          user: doc.user,
          userId: doc.userId,
          documentId: doc.id,
          schemaId: doc.schemaId,
          createdAt: doc.updatedAt,
          updatedAt: doc.updatedAt,
        } as DocumentRevision;
      });
    });

    const against = usePromise(() => {
      return getDocumentRevision(route.params.documentId as string, route.query.against as string);
    });

    const sourceData = computed(() => stableJSONStringify(source.result.value?.data));

    const againstData = computed(() => stableJSONStringify(against.result.value?.data));

    const handleCompareAgainstCurrent = (): void => {
      router.push({
        query: {
          ...route.query,
          source: 'current',
        },
      });
    };

    watch(
      [sourceData, againstData],
      () => {
        if (targetEl.value) {
          // assignment to avoid loss of type information
          const t = targetEl.value;

          loadScript(
            'https://cdnjs.cloudflare.com/ajax/libs/diff_match_patch/20121119/diff_match_patch.js',
            'sha512-5YZxUisfaneUbwv58nPp10qwt6DefHuJ+iAfvPoABZAYwLg4WGJHITaLpyyxJdrljfc0ggUoWc87Z0lfoDS84Q==',
            'anonymous',
          ).then(() => {
            nextTick(() => {
              // Since codemirror only appends itself to the target element,
              // we need to clear the inner content before recreating.
              t.innerHTML = '';

              editor.value = CodeMirror.MergeView(t, {
                mode: 'application/json',
                theme: 'nord',

                value: sourceData.value,
                orig: againstData.value,

                allowEditingOriginals: false,
                connect: 'align',
                collapseIdentical: false,
                readOnly: true,
                revertButtons: false,

                autoRefresh: true,
                gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers'],
                lineNumbers: true,
                lineWrapping: true,
                matchBrackets: true,
                tabSize: 2,
              });
            });
          });
        }
      },
      { immediate: true },
    );

    watch(
      () => route.query,
      (value, oldValue) => {
        if (value.source !== oldValue.source) {
          source.exec();
        }

        if (value.against !== oldValue.against) {
          against.exec();
        }
      },
    );

    return () => {
      return (
        <div>
          <div class="text-sm rounded bg-gray-100 p-3 mb-3">
            <div class="-mx-3 flex">
              {/* Left-hand side */}
              <div class="w-1/2 px-3">
                <ul class="flex flex-wrap">
                  <li class="pb-1 w-1/3 font-medium">Revision ID</li>
                  <li class="pb-1 2/3">{source.result.value?.id}</li>

                  <li class="pb-1 w-1/3 font-medium">Created On</li>
                  <li class="pb-1 w-2/3">
                    {source.result.value &&
                      new Date(source.result.value?.createdAt).toLocaleString()}
                  </li>

                  <li class="pb-1 w-1/3 font-medium">Created By</li>
                  <li class="pb-1 w-2/3">{source.result.value?.user?.email || 'Unknown'}</li>
                </ul>
              </div>

              {/* Right-hand side */}
              <div class="w-1/2 px-3">
                <ul class="flex flex-wrap">
                  <li class="pb-1 w-1/3 font-medium">Revision ID</li>
                  <li class="pb-1 2/3">{against.result.value?.id}</li>

                  <li class="pb-1 w-1/3 font-medium">Created On</li>
                  <li class="pb-1 w-2/3">
                    {against.result.value &&
                      new Date(against.result.value?.createdAt).toLocaleString()}
                  </li>

                  <li class="pb-1 w-1/3 font-medium">Created By</li>
                  <li class="pb-1 w-2/3">{against.result.value?.user?.email || 'Unknown'}</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            class={{ 'flex flex-col document-compare-page': true, active: highlightRevision.value }}
            style={{ minHeight: '60vh' }}
            v-loading={source.loading.value || against.loading.value}
            ref={targetEl}
          />

          <div class="flex items-center justify-between pt-3">
            <el-button type="text" onClick={() => router.back()}>
              Go Back
            </el-button>

            <RenderIfComponent condition={isComparingAgainstCurrent.value}>
              <el-button
                type="primary"
                onMouseover={() => {
                  highlightRevision.value = true;
                }}
                onMouseout={() => {
                  highlightRevision.value = false;
                }}
              >
                Restore Revision
              </el-button>
            </RenderIfComponent>

            <RenderIfComponent condition={!isComparingAgainstCurrent.value}>
              <el-button type="primary" onClick={handleCompareAgainstCurrent}>
                Compare against current
              </el-button>
            </RenderIfComponent>
          </div>
        </div>
      );
    };
  },
});

export default DocumentComparePage;
