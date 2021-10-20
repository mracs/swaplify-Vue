import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import { mount, createLocalVue } from '@vue/test-utils';

import axios from '@/plugins/axios';
import routes from '@/router/routes';
import Home from '@/views/Home.vue';

jest.mock('@/plugins/axios');
axios.get.mockImplementation(() => Promise.resolve({ data: [] }));
axios.post.mockImplementation(() => Promise.resolve({ data: [] }));
axios.patch.mockImplementation(() => Promise.resolve());

describe('view: Home', () => {
  const router = new VueRouter({ routes });
  const factory = () => mount(Home, {
    localVue: createLocalVue(),
    vuetify: new Vuetify(),
    router,
  });
  let wrapper;

  beforeEach(() => {
    wrapper = factory();
    router.replace({ path: '/' });
  });

  it('renders valid layout', async () => {
    expect(wrapper.findComponent({ name: 'v-card' }).exists()).toBeTruthy();
    expect(wrapper.findComponent({ name: 'v-snackbar' }).exists()).toBeTruthy();
    expect(wrapper.findComponent({ name: 'v-snackbar' }).exists()).toBeTruthy();
    expect(wrapper.find('.v-snack__wrapper').isVisible()).toBeFalsy();
    expect(wrapper.findAll('.mdi-content-copy').length).toBe(2);
    expect(wrapper.find('.mdi-share-variant').exists()).toBeTruthy();
    expect(wrapper.find('.mdi-content-save').exists()).toBeFalsy();

    await router.push('/source/test-token');
    expect(wrapper.find('.mdi-content-save').exists()).toBeTruthy();
    expect(wrapper.find('.mdi-share-variant').exists()).toBeFalsy();
    expect(wrapper.findAll('.mdi-content-copy').length).toBe(2);

    wrapper.vm.snackbar.show = true;
    wrapper.vm.snackbar.timeout = -1;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.v-snack__wrapper').isVisible()).toBeTruthy();

    wrapper.vm.share = 'test';
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('.mdi-content-copy').length).toBe(2);
  });

  describe('computed', () => {
    it('computed "getSource" shows route param', async () => {
      expect(wrapper.vm.getSource).toBeUndefined();
      await router.push('/source/test-token');
      expect(wrapper.vm.getSource).toBe('test-token');
    });
  });

  // describe('lifecycle', () => {
  //   it('created', async () => {
  //     // eslint-disable-next-line no-proto
  //     window.localStorage.__proto__.getItem = jest.fn().mockReturnValue('test-source');
  //     const spyOnConvertMethod = jest.spyOn(wrapper.vm, 'convertToJson');
  //     const spyOnGetMethod = jest.spyOn(wrapper.vm, 'getSavedSource');
  //     const spyOnLocalStorage = jest.spyOn(window.localStorage, 'getItem');
  //
  //     expect(wrapper.vm.getSource).toBeUndefined();
  //     expect(spyOnConvertMethod).not.toBeCalled();
  //     expect(spyOnGetMethod).not.toBeCalled();
  //     expect(spyOnLocalStorage).not.toBeCalled();
  //
  //     await wrapper.vm.$nextTick();
  //     // expect(wrapper.vm.source).toBe('test-source');
  //     expect(spyOnGetMethod).not.toBeCalled();
  //     expect(spyOnConvertMethod).toBeCalled();
  //
  //     wrapper = factory();
  //     await router.push('/source/test-token');
  //     await wrapper.vm.$nextTick();
  //     expect(wrapper.vm.getSource).toBe('test-token');
  //     expect(spyOnConvertMethod).toBeCalled();
  //     expect(spyOnGetMethod).toBeCalled();
  //     expect(spyOnLocalStorage).not.toBeCalled();
  //   });
  // });
});
