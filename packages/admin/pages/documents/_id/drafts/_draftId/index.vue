<template>
  <div>
    {{ draftId }}
  </div>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'nuxt-property-decorator';

@Component({
  name: 'DocumentDraftEditPage',
})
export default class DocumentDraftEditPage extends Vue {
  get draftId(): string {
    return this.$route.params.draftId;
  }

  get documentId(): string {
    return this.$route.params.id;
  }
}
</script>

<style></style>
