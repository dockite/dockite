<template>
  <div class="create-schema-step-1-component">
    <h3>Finally, lets review the Schema</h3>

    <p class="dockite-text--subtitle">
      We've given our Schema a name and added the fields we desire. Before we create the Schema
      let's quickly take a second to ensure it is all correct.
    </p>

    <h2 style="margin-top: 1.5rem;">
      Details for <strong>{{ name }}</strong>
    </h2>
    <el-collapse :value="['groups', 'fields']">
      <el-collapse-item name="groups" title="Groups">
        <ul>
          <li v-for="group in Object.keys(groups)" :key="group">
            <span>
              {{ group }}
            </span>

            <el-tag size="mini"> {{ groups[group].length }} Fields </el-tag>
          </li>
        </ul>
      </el-collapse-item>
      <el-collapse-item name="fields" title="Fields">
        <ul>
          <li v-for="field in fields" :key="field.name">
            <span>
              {{ field.title }}
            </span>

            <el-tag size="mini">type:{{ field.type }}</el-tag>
            <el-tag size="mini">group:{{ getGroupByFieldName(field.name) }}</el-tag>
          </li>
        </ul>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script lang="ts">
import { Field } from '@dockite/types';
import { Component, Vue, Prop } from 'nuxt-property-decorator';
import { Fragment } from 'vue-fragment';

import Logo from '~/components/base/logo.vue';
import * as auth from '~/store/auth';

@Component({
  components: {
    Fragment,
    Logo,
  },
})
export default class CreateSchemaStepThreeComponent extends Vue {
  @Prop({ required: true })
  readonly name!: string;

  @Prop({ required: true })
  readonly fields!: Omit<Field, 'id' | 'schemaId' | 'dockiteField' | 'schema'>[];

  @Prop({ required: true })
  readonly groups!: Record<string, string[]>;

  get user(): string {
    return this.$store.getters[`${auth.namespace}/fullName`];
  }

  public getGroupByFieldName(fieldName: string): string {
    for (const group of Object.keys(this.groups)) {
      if (this.groups[group].some(field => field === fieldName)) {
        return group;
      }
    }

    return '';
  }

  public submit(): void {}
}
</script>

<style lang="scss" scoped>
.dockite-text--subtitle {
  border-left: 4px solid #eeeeee;
  padding-left: 0.5rem;
  color: rgba(0, 0, 0, 0.66);
  font-style: italic;
}

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
