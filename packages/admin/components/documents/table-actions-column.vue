<template>
  <div class="dockite-table-actions--column">
    <el-popconfirm
      v-if="deleted"
      title="Are you sure? The document will be restored and visible again."
      confirm-button-text="Restore"
      cancel-button-text="Cancel"
      @onConfirm="handleRestoreDocument(document.id)"
    >
      <el-button
        v-if="$can('internal:document:update', `schema:${schema.name}:update`)"
        slot="reference"
        type="text"
        title="Restore Document"
      >
        <i class="el-icon-refresh-left" />
      </el-button>
    </el-popconfirm>

    <router-link v-else title="Edit Document" :to="`/documents/${document.id}`">
      <i class="el-icon-edit-outline" />
    </router-link>

    <router-link
      v-if="$can('internal:document:delete', `schema:${schema && schema.name}:delete`)"
      title="Delete Document"
      :to="`/documents/${document.id}/delete`"
    >
      <i class="el-icon-delete" />
    </router-link>

    <router-link title="View Revisions" :to="`/documents/${document.id}/revisions`">
      <i class="el-icon-folder-opened" />
    </router-link>
  </div>
</template>

<script lang="ts">
import { Schema, Document } from '@dockite/database';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component({
  name: 'DocumentTableActionsColumn',
})
export class DocumentTableActionsColumn extends Vue {
  @Prop({ required: true })
  readonly deleted!: boolean;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  @Prop({ required: true, type: Object })
  readonly document!: Document;

  @Prop({ required: true, type: Function })
  readonly handleRestoreDocument!: Function;
}

export default DocumentTableActionsColumn;
</script>
