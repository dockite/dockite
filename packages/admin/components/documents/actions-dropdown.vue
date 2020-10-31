<template>
  <el-dropdown
    :type="disabled && 'primary'"
    :disabled="!disabled"
    split-button
    @click="handleSaveAndPublishClick"
  >
    Save and Publish
    <el-dropdown-menu slot="dropdown">
      <!-- <el-dropdown-item>Save as Draft</el-dropdown-item> -->
      <!-- <el-dropdown-item>Add to Release</el-dropdown-item> -->
      <el-dropdown-item>
        <router-link class="block w-full" :to="`/documents/${documentId}/revisions`">
          View Revisions
        </router-link>
      </el-dropdown-item>
      <el-dropdown-item>
        <router-link
          v-if="schema && $can(`schema:${schema.name}:delete`)"
          class="block w-full text-red-400 hover:text-red-500"
          :to="`/documents/${documentId}/delete`"
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

  // At the moment this actually refers to whether the document is "dirty"
  @Prop({ required: true })
  readonly disabled!: boolean;

  @Prop({ required: true, type: Object })
  readonly document!: Document;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  @Prop({ required: true, type: Function })
  readonly handleSaveAndPublish!: Function;

  public handleSaveAndPublishClick(): void {
    if (!this.disabled) {
      this.$message({
        message: 'Document has not been edited, not performing save.',
        type: 'warning',
      });

      return;
    }

    this.handleSaveAndPublish();
  }
}

export default DocumentActionsComponent;
</script>
