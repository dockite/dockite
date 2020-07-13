<template>
  <div class="create-schema-step-1-component">
    <slot name="header">
      <h3>Next, lets configre the Settings</h3>

      <p class="dockite-text--subtitle">
        Next up lets configure the schema, we can define the fields that will be displayed in views
        and other useful details that will help manage our content.
      </p>
    </slot>

    <schema-settings v-model="settings" :schema="schema" />
  </div>
</template>

<script lang="ts">
import { Schema } from '@dockite/database';
import { Component, Vue, Prop } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import Logo from '~/components/base/logo.vue';
import SchemaSettings from '~/components/schemas/schema-settings.vue';

@Component({
  components: {
    Fragment,
    Logo,
    SchemaSettings,
  },
})
export default class CreateSchemaStepThreeComponent extends Vue {
  @Prop({ required: true })
  readonly value!: Record<string, any>;

  @Prop({ required: true })
  readonly schema!: Schema;

  get settings(): Record<string, any> {
    return this.value;
  }

  set settings(newValue: Record<string, any>) {
    this.$emit('input', newValue);
  }

  public submit(): void {}
}
</script>

<style lang="scss" scoped>
ul,
li {
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  align-items: center;
  height: 40px;
  border: 1px dashed #cccccc;
  padding: 0 0.5rem;

  &:not(:last-child) {
    margin-bottom: 1rem;
  }

  span:first-child {
    flex: 1;
  }

  .el-tag:not(:last-child) {
    margin-right: 0.25rem;
  }
}
</style>
