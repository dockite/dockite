import { defineComponent, Teleport, onMounted, ref } from 'vue';

interface HeaderPortalProps {
  children: JSX.Element | Array<JSX.Element>;
}

export const HeaderPortal = defineComponent<HeaderPortalProps>((props, ctx) => {
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
});

export default HeaderPortal;
