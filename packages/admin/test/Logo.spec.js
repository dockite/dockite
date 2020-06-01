import Logo from '@/components/Logo.vue';
import { mount } from '@vue/test-utils';

describe('Logo', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Logo);
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
});
