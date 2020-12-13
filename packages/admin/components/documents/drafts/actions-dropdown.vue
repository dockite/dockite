<template>
  <el-dropdown
    :type="disabled ? 'primary' : undefined"
    :disabled="!disabled"
    split-button
    @click="handleUpdateDraftClick"
  >
    Save Draft
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item>
        <el-button type="text" @click="handlePublishDraft">
          Publish Draft
        </el-button>
      </el-dropdown-item>
      <!-- <el-dropdown-item>Add to Release</el-dropdown-item> -->
      <el-dropdown-item>
        <router-link
          v-if="schema && $can(`schema:${schema.name}:delete`)"
          class="block w-full text-red-400 hover:text-red-500"
          :to="`/documents/${documentId}/${draftId}/delete`"
        >
          Delete
        </router-link>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Schema, Document } from '@dockite/database';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component({
  name: 'DocumentActionsComponent',
})
export class DocumentActionsComponent extends Vue {
  @Prop({ required: true })
  readonly documentId!: string;

  @Prop({ required: true })
  readonly draftId!: string;

  // At the moment this actually refers to whether the document is "dirty"
  @Prop({ required: true })
  readonly disabled!: boolean;

  @Prop({ required: true, type: Object })
  readonly document!: Document;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  @Prop({ required: true, type: Function })
  readonly handleUpdateDraft!: Function;

  @Prop({ required: true, type: Function })
  readonly handlePublishDraft!: Function;

  public handleUpdateDraftClick(): void {
    if (!this.disabled) {
      this.$message({
        message: 'Draft has not been edited, not performing save.',
        type: 'warning',
      });

      return;
    }

    this.handleUpdateDraft();
  }
}

export default DocumentActionsComponent;
</script>
