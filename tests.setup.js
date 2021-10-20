import Vue from 'vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import flushPromises from 'flush-promises';

Vue.use(Vuetify);
Vue.use(VueRouter);

Vue.config.productionTip = false;
Vue.config.devtools = false;

global.axiosErrorTest = async (dispatch, customActions) => {
  global.mockAxiosError = true;
  customActions();
  await flushPromises();
  expect(dispatch).toBeCalledWith('alert/setError', global.axiosErrorRequestBody, { root: true });
};
