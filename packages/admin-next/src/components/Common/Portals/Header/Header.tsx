import { defineComponent, Teleport, onMounted, ref } from 'vue';

export const HeaderPortal = defineComponent({
  name: 'HeaderPortalComponent',

  setup: (_, ctx) => {
    const canRender = ref(false);

    onMounted(() => {
      canRender.value = true;
    });

    return () => {
      if (canRender) {
        return (
          <Teleport to=".el-header">
            Hullo
            {ctx.slots.default && ctx.slots.default()}
          </Teleport>
        );
      }

      return <div>Can't render</div>;
    };
  },
});

export default HeaderPortal;
