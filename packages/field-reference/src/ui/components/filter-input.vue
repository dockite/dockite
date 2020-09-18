<template>
  <div ref="filterInput" class="dockite-filter-input">
    <el-row type="flex" justify="space-between" align="middle">
      <span class="text-xs">
        Apply a Filter
      </span>

      <el-tooltip placement="top">
        <i class="el-icon-question" style="padding-right: 0.25rem;"></i>

        <div slot="content">
          <div v-for="(description, option) in options" :key="option">
            <strong> {{ option }}: </strong>
            {{ description }}
          </div>
        </div>
      </el-tooltip>
    </el-row>

    <el-input
      ref="valueInput"
      v-model="filter"
      size="small"
      placeholder="Value"
      class="input-with-select"
      style="padding-top: 10px"
      @keyup.enter.native="handleApplyFilter"
    >
      <el-select
        slot="append"
        v-model="operator"
        filterable
        default-first-option
        placeholder="Select"
      >
        <el-option v-for="(_, option) in options" :key="option" :value="option" :label="option" />
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

      <el-button type="primary" size="mini" :disabled="!canSubmit" @click="handleApplyFilter">
        Apply Filter
      </el-button>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Constraint, ConstraintOperator, Operators } from '@dockite/where-builder';
import { Component, Prop, Vue, Watch, Ref } from 'vue-property-decorator';

@Component
export default class FilterInputComponent extends Vue {
  @Prop()
  readonly prop!: string;

  @Prop()
  readonly options!: typeof Operators;

  @Prop()
  readonly value!: Constraint | null;

  @Ref()
  readonly filterInput!: any;

  @Ref()
  readonly valueInput!: any;

  public filter = '';

  public operator = Object.keys(this.options)[0] as ConstraintOperator;

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

  public mounted() {
    this.$nextTick(() => {
      this.valueInput.focus();
    });
  }

  public handleApplyFilter(): void {
    this.$emit('input', this.constraint);

    this.$emit('filter-change');
  }

  @Watch('value', { immediate: true })
  public handleValueChange(): void {
    if (this.value !== null) {
      this.filter = this.value.value;
      this.operator = this.value.operator;
    }
  }

  public handleResetFilter(): void {
    this.filter = '';
    [this.operator] = Object.keys(this.options) as ConstraintOperator[];

    this.$emit('input', null);
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
