<template>
  <div class="setttings-webhook bg-white" style="padding: 1rem;">
    <portal to="title">
      <a-row type="flex" align="middle" justify="space-between" class="title-row">
        <h1>Settings - Webhooks History - {{ $route.params.id }}</h1>
      </a-row>
    </portal>

    <a-form class="webhook-form" @submit.prevent>
      <a-form-item label="ID">
        <a-input :value="getWebhookCall.id" />
      </a-form-item>
      <a-form-item label="Successful">
        <a-input :value="getWebhookCall.success ? 'Yes' : 'No'" />
      </a-form-item>
      <a-form-item label="Status Code">
        <a-input :value="getWebhookCall.status" />
      </a-form-item>
      <a-form-item label="Request Config">
        <vue-codemirror
          class="codemirror-editor"
          :options="getCodeMirorOptions('application/json')"
          :value="JSON.stringify(getWebhookCall.request, null, 2)"
        />
      </a-form-item>
      <a-form-item label="Response Headers">
        <vue-codemirror
          class="codemirror-editor"
          :options="getCodeMirorOptions('application/json')"
          :value="JSON.stringify(getWebhookCall.response.headers, null, 2)"
        />
      </a-form-item>
      <a-form-item label="Response Data">
        <vue-codemirror
          class="codemirror-editor"
          :options="getCodeMirorOptions(contentType)"
          :value="responseData"
        />
      </a-form-item>
      <a-form-item label="Executed At">
        <a-input :value="getWebhookCall.executedAt | toLocaleDateTime" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import gql from 'graphql-tag';
import { codemirror as VueCodemirror } from 'vue-codemirror';
import { Vue, Component, Watch } from 'vue-property-decorator';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';

@Component({
  apollo: {
    getWebhookCall: {
      query: gql`
        query($id: String!) {
          getWebhookCall(id: $id) {
            id
            success
            status
            request
            response
            executedAt
          }
        }
      `,
      variables() {
        return { id: this.$route.params.id };
      },
    },
  },

  components: {
    VueCodemirror,
  },
})
export class WebhooksHistoryItemPage extends Vue {
  public getWebhookCall: Record<string, any> = {};

  get contentType(): string {
    const contentType = this.getWebhookCall.response?.headers['content-type'] ?? 'text/html';

    return contentType.split(';')[0];
  }

  get responseData(): string {
    const data = this.getWebhookCall?.response?.data ?? '';

    if (/(json|javascript)/i.test(this.contentType)) {
      return JSON.stringify(data);
    }

    return String(data);
  }

  getCodeMirorOptions(mode: string): object {
    return {
      tabSize: 2,
      mode,
      theme: 'monokai',
      lineNumbers: true,
      line: true,
    };
  }
}

export default WebhooksHistoryItemPage;
</script>

<style lang="scss">
.codemirror-editor {
  line-height: 1.4;
}

.webhook-form {
  .ant-form-item {
    margin-bottom: 0.5rem;

    &:last-of-type {
      margin-bottom: 1rem;
    }
  }
}
</style>
