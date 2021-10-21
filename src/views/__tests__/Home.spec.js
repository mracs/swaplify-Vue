import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import { mount, createLocalVue } from '@vue/test-utils';

import clipboard from '@/plugins/clipboard';
import routes from '@/router/routes';
import Home from '@/views/Home.vue';

jest.mock('@/plugins/axios');

const localVue = createLocalVue();
localVue.use(clipboard);
// eslint-disable-next-line no-proto
window.localStorage.__proto__.getItem = jest.fn().mockReturnValue(null);

describe('view: Home', () => {
  const router = new VueRouter({ routes });
  const factory = () => mount(Home, {
    localVue,
    vuetify: new Vuetify(),
    router,
  });
  let wrapper;

  beforeEach(() => {
    wrapper = factory();
    if (router.currentRoute.path !== '/') {
      router.replace({ path: '/' });
    }
    global.mockAxiosError = false;
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

  describe('methods', () => {
    it('convertToJson should return json from API', async () => {
      wrapper.vm.source = "{'key': None}";
      await wrapper.vm.convertToJson();
      expect(global.url).toBe('/api/pydict-to-json');
      expect(global.body).toStrictEqual({ source: "{'key': None}" });
      expect(wrapper.vm.response).toStrictEqual({ body: '{"key": null}', error: false });

      global.mockAxiosError = true;
      await wrapper.vm.convertToJson();
      expect(wrapper.vm.snackbar.show).toBeTruthy();
    });

    it('shareAndSave should return a token of saved source', async () => {
      expect(wrapper.vm.error).toBeNull();
      expect(wrapper.vm.source).toBeNull();

      await wrapper.vm.shareAndSave();
      expect(wrapper.vm.error).toBe('Fill the input');

      wrapper.vm.source = 'test-source';
      await wrapper.vm.shareAndSave();
      expect(wrapper.vm.share).toContain('/source/some-token');

      expect(wrapper.vm.snackbar.show).toBeFalsy();
      global.mockAxiosError = true;
      await wrapper.vm.shareAndSave();
      expect(wrapper.vm.snackbar.show).toBeTruthy();
    });

    it('getSavedSource should return source by token', async () => {
      expect(wrapper.vm.source).toBeNull();

      await wrapper.vm.getSavedSource();
      expect(wrapper.vm.source).toBe('some-source');

      expect(wrapper.vm.snackbar.show).toBeFalsy();
      global.mockAxiosError = true;
      await wrapper.vm.getSavedSource();
      expect(wrapper.vm.snackbar.show).toBeTruthy();
    });

    it('updateSource should update source by token', async () => {
      // eslint-disable-next-line no-proto
      window.localStorage.__proto__.setItem = jest.fn();
      // eslint-disable-next-line no-proto
      const spyOnLocalStorage = jest.spyOn(window.localStorage.__proto__, 'setItem');
      expect(wrapper.vm.error).toBeNull();
      expect(wrapper.vm.source).toBeNull();
      expect(spyOnLocalStorage).not.toBeCalled();

      await wrapper.vm.updateSource();
      expect(wrapper.vm.error).toBe('Fill the input');

      wrapper.vm.source = 'test-source';
      // eslint-disable-next-line no-proto
      window.localStorage.__proto__.getItem = jest.fn().mockReturnValue('test-source');
      await wrapper.vm.updateSource();
      expect(spyOnLocalStorage).not.toBeCalled();

      expect(wrapper.vm.source).toBe('test-source');
      // eslint-disable-next-line no-proto
      window.localStorage.__proto__.getItem = jest.fn().mockReturnValue(null);
      await wrapper.vm.updateSource();
      expect(spyOnLocalStorage).toBeCalledWith('cached_input', 'test-source');

      expect(wrapper.vm.snackbar.show).toBeFalsy();
      global.mockAxiosError = true;
      await wrapper.vm.updateSource();
      expect(wrapper.vm.snackbar.show).toBeTruthy();
    });

    it('clearSource removes source from cache', async () => {
      // eslint-disable-next-line no-proto
      window.localStorage.__proto__.removeItem = jest.fn();
      // eslint-disable-next-line no-proto
      const spyOnLocalStorage = jest.spyOn(window.localStorage.__proto__, 'removeItem');

      await wrapper.vm.$nextTick();
      expect(spyOnLocalStorage).not.toBeCalled();

      wrapper.vm.source = 'test';
      wrapper.vm.error = true;
      await wrapper.vm.clearSource();
      expect(wrapper.vm.source).toBe('');
      expect(wrapper.vm.error).toBe('');
      expect(spyOnLocalStorage).toBeCalledWith('cached_input');
    });

    it('clearResponse resets response body & error', async () => {
      wrapper.vm.response = {};
      await wrapper.vm.clearResponse();
      expect(wrapper.vm.response).toStrictEqual({ body: '', error: null });
    });

    it('onCopy should copy message to clipboard', async () => {
      const spyOnCopyMethod = jest.spyOn(localVue.prototype, '$copyText');

      await wrapper.vm.$nextTick();
      expect(spyOnCopyMethod).not.toBeCalled();

      await wrapper.vm.onCopy('msg');
      expect(spyOnCopyMethod).toBeCalled();
    });

    it('onSuccess should show snackbar with timeout', async () => {
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.snackbar.show).toBeFalsy();

      await wrapper.vm.onSuccess('success-msg');
      expect(wrapper.vm.snackbar).toStrictEqual({
        show: true, msg: 'success-msg', type: 'success', timeout: 2000,
      });
    });

    it('onError should show snackbar without timeout', async () => {
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.snackbar.show).toBeFalsy();

      await wrapper.vm.onError('error-msg');
      expect(wrapper.vm.snackbar).toStrictEqual({
        show: true, msg: 'error-msg', type: 'error', timeout: -1,
      });
    });
  });
});
