<template>
  <fragment>
    <portal to="header">
      <h2>All Webhooks</h2>
    </portal>

    <div class="all-documents-page">
      <el-table :data="findWebhookCallsByWebhookId.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            {{ scope.row.id.slice(0, 8) + '...' }}
          </template>
        </el-table-column>
        <el-table-column label="Success">
          <template slot-scope="scope">
            {{ scope.row.success ? 'Yes' : 'No' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status Code"></el-table-column>
        <el-table-column prop="executedAt" label="Executed At" :formatter="cellValueFromNow" />
        <el-table-column label="Actions">
          <template slot-scope="scope">
            <el-button type="text" @click="webhookCallToDisplay = scope.row">
              <i class="el-icon-view" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="dockite-element--pagination"
        :current-page="currentPage"
        :page-count="totalPages"
        :pager-count="5"
        hide-on-single-page
        layout="prev, pager, next"
      />
    </div>

    <el-dialog
      title="Webhook Call - Raw Details"
      custom-class="dockite-dialog--webhook-call"
      :visible="webhookCallToDisplay !== null"
      @close="webhookCallToDisplay = null"
    >
      <textarea
        ref="webhookCallDetail"
        :value="JSON.stringify(webhookCallToDisplay, null, 2)"
      ></textarea>
    </el-dialog>
  </fragment>
</template>

<script lang="ts">
import { WebhookCall } from '@dockite/types';
import CodeMirror from 'codemirror';
import { formatDistanceToNow } from 'date-fns';
import { Component, Vue, Watch, Ref } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/theme/nord.css';

import { FindWebhookCallsResultItem, ManyResultSet } from '~/common/types';
import * as data from '~/store/data';

@Component({
  components: {
    Fragment,
  },
})
export default class AllDocumentsPage extends Vue {
  public showWebhookCallDetail = false;

  public webhookCallToDisplay: null | WebhookCall = null;

  @Ref()
  readonly webhookCallDetail!: HTMLTextAreaElement;

  get findWebhookCallsByWebhookId(): ManyResultSet<FindWebhookCallsResultItem> {
    const state: data.DataState = this.$store.state[data.namespace];

    return state.findWebhookCallsByWebhookId;
  }

  get webhookId(): string {
    return this.$route.params.id;
  }

  get currentPage(): number {
    if (!this.findWebhookCallsByWebhookId.currentPage) {
      return 1;
    }

    return this.findWebhookCallsByWebhookId.currentPage;
  }

  get totalPages(): number {
    if (!this.findWebhookCallsByWebhookId.totalPages) {
      return 1;
    }

    return this.findWebhookCallsByWebhookId.totalPages;
  }

  public fetchWebhookCalls(): void {
    this.$store.dispatch(`${data.namespace}/fetchFindWebhookCallsByWebhookId`, this.webhookId);
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  @Watch('webhookCallToDisplay', { immediate: true })
  handleWebhookCallToDisplayChange(): void {
    if (this.webhookCallToDisplay !== null) {
      this.$nextTick(() => {
        CodeMirror.fromTextArea(this.webhookCallDetail, {
          mode: 'application/json',
          tabSize: 2,
          lineNumbers: true,
          lineWrapping: true,
          theme: 'nord',
        });
      });
    }
  }

  @Watch('webhookId', { immediate: true })
  handleWebhookIdChange(): void {
    this.fetchWebhookCalls();
  }
}
</script>

<style lang="scss">
.dockite-element--pagination {
  /* background: #ffffff; */
  background: transparent;

  li {
    background: transparent;
  }

  button {
    background: transparent;
  }
}

.dockite-dialog--webhook-call {
  width: 80%;
  max-width: 650px;
}
</style>
