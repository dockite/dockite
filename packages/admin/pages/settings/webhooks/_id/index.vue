<template>
  <fragment>
    <portal to="header">
      <h2>Edit - {{ (webhook && webhook.name) || '' }}</h2>
    </portal>

    <div v-loading="loading > 0" class="all-webhook-calls-page el-loading-parent__min-height">
      <el-table :data="findWebhookCallsByWebhookId.results" style="width: 100%">
        <el-table-column prop="id" label="ID">
          <template slot-scope="scope">
            {{ scope.row.id | shortDesc }}
          </template>
        </el-table-column>

        <el-table-column label="Success">
          <template slot-scope="scope">
            {{ scope.row.success ? 'Yes' : 'No' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Status Code" />

        <el-table-column prop="executedAt" label="Executed At" :formatter="cellValueFromNow" />

        <el-table-column label="Actions">
          <template slot-scope="scope">
            <el-button type="text" @click="webhookCallToDisplay = scope.row">
              <i class="el-icon-view" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-row type="flex" justify="space-between">
        <span />

        <el-pagination
          :current-page="currentPage"
          class="dockite-element--pagination"
          :page-count="totalPages"
          :pager-count="5"
          :page-size="20"
          :total="totalItems"
          hide-on-single-page
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </el-row>
    </div>

    <el-dialog
      title="Webhook Call - Raw Details"
      custom-class="dockite-dialog--webhook-call"
      :visible="webhookCallToDisplay !== null"
      :destroy-on-close="true"
      @close="webhookCallToDisplay = null"
    >
      <textarea ref="webhookCallDetail" :value="JSON.stringify(webhookCallToDisplay, null, 2)" />
    </el-dialog>
  </fragment>
</template>

<script lang="ts">
import { WebhookCall, Webhook } from '@dockite/database';
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
export default class WebhookCallsPage extends Vue {
  public loading = 0;

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

  get webhook(): Webhook {
    return this.$store.getters[`${data.namespace}/getWebhookById`](this.webhookId);
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

  get totalItems(): number {
    if (!this.findWebhookCallsByWebhookId.totalItems) {
      return 1;
    }

    return this.findWebhookCallsByWebhookId.totalItems;
  }

  public async fetchWebhookCalls(page = 1): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchFindWebhookCallsByWebhookId`, {
        webhookId: this.webhookId,
        page,
      });
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst fetching webhook calls, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  public cellValueFromNow(_row: never, _column: never, cellValue: string, _index: never): string {
    return formatDistanceToNow(new Date(cellValue)) + ' ago';
  }

  public handlePageChange(newPage: number): void {
    this.fetchWebhookCalls(newPage);
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

  public async fetchWebhookById(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchWebhookById`, {
        id: this.webhookId,
      });
    } catch (_) {
      this.$message({
        message: 'An error occurred whilst fetching the webhook, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  @Watch('webhookId', { immediate: true })
  handleWebhookIdChange(): void {
    this.fetchWebhookById();
    this.fetchWebhookCalls();
  }
}
</script>

<style lang="scss">
.all-webhook-calls-page {
  background: #ffffff;
}

.dockite-element--pagination {
  padding: 1rem;
}

.dockite-dialog--webhook-call {
  width: 80%;
  max-width: 650px;
}
</style>
