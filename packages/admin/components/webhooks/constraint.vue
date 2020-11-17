<template>
  <div class="webhook-constraint-form-item">
    <div class="flex justify-between -mx-3">
      <span class=" flex-1 px-3">
        <el-input v-model="constraint.name" placeholder="Record Key" />
      </span>

      <span class="px-3">
        <el-select v-model="constraint.operator" placeholder="Operator">
          <el-option
            v-for="key in Object.keys(WebhookOperators).sort()"
            :key="key"
            :label="key"
            :value="key"
          />
        </el-select>
      </span>

      <span class=" flex-1 px-3">
        <el-input v-model="constraint.value" placeholder="Record Value"></el-input>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { WebhookConstraint, WebhookOperators } from '@dockite/database';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component({
  name: 'WebhookConstraintComponent',
})
export default class WebhookConstraintComponent extends Vue {
  @Prop()
  readonly value!: WebhookConstraint;

  @Prop()
  readonly fields!: string[];

  public WebhookOperators = WebhookOperators;

  get constraint(): WebhookConstraint {
    return this.value;
  }

  set constraint(value) {
    this.$emit('input', value);
  }
}
</script>

<style></style>
