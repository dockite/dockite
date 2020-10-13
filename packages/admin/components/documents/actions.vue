<template>
  <el-dropdown :disabled="!dirty" split-button @click="handleSaveAndPublish">
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
import { Schema } from '@dockite/database';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component({
  name: 'DocumentActionsComponent',
})
export class DocumentActionsComponent extends Vue {
  @Prop({ required: true })
  readonly documentId!: string;

  @Prop({ required: true })
  readonly disabled!: boolean;

  @Prop({ required: true, type: Object })
  readonly schema!: Schema;

  @Prop({ required: true, type: Function })
  readonly handleSaveAndPublish!: Function;
}

export default DocumentActionsComponent;
</script>
