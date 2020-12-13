<template>
  <fragment>
    <portal to="header">
      <el-row type="flex" justify="space-between" align="middle">
        <h2>
          <span class="font-bold">Update {{ schema && schema.title }}:</span>
          <span
            class="p-2 rounded hover:bg-gray-200 focus:bg-gray-200 hover:cursor-text inline-block"
            contenteditable
            @blur="
              name = String($event.target.innerText)
                .replace(/\n/g, '')
                .trim()
            "
            @keydown.enter="e => e.preventDefault()"
            v-html="name"
          />
        </h2>

        <div>
          <draft-actions-dropdown
            v-if="schema && draft"
            class="ml-2"
            :disabled="dirty"
            :document="draft"
            :document-id="documentId"
            :draft-id="draftId"
            :schema="schema"
            :handle-update-draft="submit"
            :handle-publish-draft="updateDraft"
          />
        </div>
      </el-row>
    </portal>

    <div v-loading="loading > 0" class="update-document-draft-page el-loading-parent__min-height">
      <div>
        <document-form
          v-if="schema && draft"
          ref="formEl"
          v-model="form"
          :data="draft.data"
          :schema="schema"
          :dirty.sync="dirty"
          :handle-submit="updateDraft"
        />
      </div>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Draft, Schema } from '@dockite/database';
import { Component, Watch, Vue, Ref } from 'nuxt-property-decorator';

import DocumentForm from '~/components/base/document-form.vue';
import DraftActionsDropdown from '~/components/documents/drafts/actions-dropdown.vue';
import * as data from '~/store/data';
import * as draft from '~/store/draft';

@Component({
  name: 'DocumentDraftEditPage',
  components: {
    DraftActionsDropdown,
    DocumentForm,
  },
})
export default class DocumentDraftEditPage extends Vue {
  public form: Record<string, any> = {};

  public ready = false;

  public loading = 1;

  public dirty = false;

  public name = '';

  @Ref()
  readonly formEl!: any;

  get draftId(): string {
    return this.$route.params.draftId;
  }

  get draft(): Draft | null {
    return this.$store.getters[`${data.namespace}/getDraftById`](this.draftId);
  }

  get schema(): Schema | null {
    if (this.schemaId) {
      return this.$store.getters[`${data.namespace}/getSchemaWithFieldsById`](this.schemaId);
    }

    return null;
  }

  get documentId(): string {
    return this.$route.params.id;
  }

  get schemaId(): string {
    if (this.draft) {
      return this.draft.schemaId;
    }

    return '';
  }

  public async fetchDraftById(force = false): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchDraftById`, {
        id: this.draftId,
        force,
      });
    } catch (_) {
      this.$message({
        message: 'An error occurred when fetching the draft, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async fetchSchemaById(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${data.namespace}/fetchSchemaWithFieldsById`, {
        id: this.schemaId,
      });
    } catch (_) {
      this.$message({
        message:
          'An error occurred whilst fetching the schema for the draft, please try again later.',
        type: 'error',
      });
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async submit(): Promise<void> {
    try {
      this.loading += 1;

      await this.formEl.submit();
    } catch (_) {
    } finally {
      this.$nextTick(() => {
        this.loading -= 1;
      });
    }
  }

  public async updateDraft(): Promise<void> {
    try {
      this.loading += 1;

      await this.$store.dispatch(`${draft.namespace}/updateDraft`, {
        name: this.name,
        data: this.form,
        documentId: this.documentId,
        draftId: this.draftId,
        schemaId: this.schemaId,
      });

      await this.fetchDraftById(true);

      this.$message({
        message: 'Draft updated successfully!',
        type: 'success',
      });
    } catch (e) {
      console.log(e);

      this.$message({
        message: 'An error occurred whilst updating the draft, please try again later.',
        type: 'error',
      });
    } finally {
      this.loading -= 1;
    }
  }

  @Watch('name')
  public handleNameChanged(): void {
    if (this.draft && this.draft.name !== this.name) {
      this.dirty = true;
    }
  }

  async mounted(): Promise<void> {
    await this.fetchDraftById();
    await this.fetchSchemaById();

    this.loading -= 1;
  }

  @Watch('draft', { deep: true })
  public handleDraftChange(draft: Draft | null): void {
    if (draft) {
      this.name = draft.name;
    }
  }
}
</script>

<style></style>
