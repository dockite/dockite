<template>
  <div class="dockite-filter-input">
    <el-input
      v-model="filter"
      size="small"
      placeholder="Filter"
      class="input-with-select"
      style="padding-top: 10px"
    >
      <el-select
        slot="append"
        v-model="operator"
        filterable
        default-first-option
        placeholder="Select"
      >
        <el-option v-for="option in options" :key="option" :value="option" :label="option" />
      </el-select>
    </el-input>

    <el-row
      type="flex"
      justify="space-between"
      align="middle"
      style="width: 100%; padding-top: 7px;"
    >
      <el-button type="text" size="mini" @click="handleResetFilter">
        Reset
      </el-button>

      <el-row align="middle" type="flex">
        <el-tooltip placement="bottom">
          <i class="el-icon-question" style="padding-right: 0.25rem;"></i>
          <div slot="content">
            <div v-for="option in options" :key="option">
              <strong> {{ option }}: </strong>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Magni reiciendis a ipsum sit
              velit iure nam reprehenderit officiis.
            </div>
          </div>
        </el-tooltip>
        <el-button type="primary" size="mini" :disabled="!canSubmit" @click="handleApplyFilter">
          Apply Filter
        </el-button>
      </el-row>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Constraint, ConstraintOperator } from '@dockite/where-builder';
import { Component, Prop, Vue } from 'nuxt-property-decorator';

@Component
export default class FilterInputComponent extends Vue {
  @Prop()
  readonly prop!: string;

  @Prop()
  readonly options!: ConstraintOperator[];

  public filter = '';

  public operator = this.options[0];

  get constraint(): Constraint {
    return {
      name: this.prop,
      operator: this.operator,
      value: this.filter,
    };
  }

  get canSubmit(): boolean {
    return this.prop !== '' && this.prop !== '';
  }

  public handleApplyFilter(): void {
    if (this.canSubmit) {
      this.$emit('add-filter', this.constraint);
    }
  }

  public handleResetFilter(): void {
    this.filter = '';
    this.operator = this.options[0];

    this.$emit('remove-filter', this.prop);
  }
}
</script>

<style lang="scss">
.dockite-filter-input {
  .el-select .el-input {
    width: 100px;
  }

  .input-with-select .el-input-group__append {
    background-color: #fff;
  }
}
</style>
