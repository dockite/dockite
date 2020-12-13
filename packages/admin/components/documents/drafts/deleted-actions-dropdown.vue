<template>
  <el-dropdown :disabled="!disabled" split-button @click="handleSaveAndPublish">
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
        <a href="#" @click.prevent="handleRestoreDocument(documentId)">
          Restore Document
        </a>
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script lang="ts">
import { Schema, Document } from '@dockite/database';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component({
  name: 'DeletedDocumentActionsComponent',
})
export class DeletedDocumentActionsComponent extends Vue {
  @Prop({ required: true })
  readonly documentId!: string;

  @Prop({ required: true })
  readonly disabled!: boolean;

  @Prop({ required: true, type: Object })
  readonly document!: Document;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  @Prop({ required: true, type: Function })
  readonly handleSaveAndPublish!: Function;

  @Prop({ required: true, type: Function })
  readonly handleRestoreDocument!: Function;
}

export default DeletedDocumentActionsComponent;
</script>
