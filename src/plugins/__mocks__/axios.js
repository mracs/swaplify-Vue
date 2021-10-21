import qs from 'qs';

const requestError = { response: global.axiosErrorRequestBody };

const getRequestParams = (_url, _body = '') => {
  global.url = _url.match(/[^?]+/) ? _url.match(/[^?]+/)[0] : _url;
  global.params = '';
  if (_body && Object.prototype.hasOwnProperty.call(_body, 'paramsSerializer')) {
    global.params = _body.paramsSerializer(_body.params);
  } else if (_body) global.params = qs.stringify(_body.params);
  else global.params = _url.match(/\?(.+)/) ? _url.match(/\?(.+)/)[1] : '';
};

const baseAxiosMock = (_url) => new Promise((resolve, reject) => {
  if (global.mockAxiosError) reject(requestError);
  getRequestParams(_url);
  resolve();
});

const includesEndpoint = (endpointList) => (
  endpointList.filter((endpoint) => global.url.search(new RegExp(endpoint)) !== -1).length > 0);

module.exports = {
  get: (_url, _body) => new Promise((resolve, reject) => {
    if (global.mockAxiosError) reject(requestError);

    getRequestParams(_url, _body);

    const res = {};
    switch (true) {
      case includesEndpoint(['/source/']):
        res.data = { source: 'some-source' };
        break;

      default:
        res.data = {};
    }
    resolve(res);
  }),
  post: (_url, _body) => new Promise((resolve, reject) => {
    if (global.mockAxiosError) reject(requestError);

    global.url = _url;
    global.body = _body;
    const res = {};
    switch (true) {
      case includesEndpoint(['/pydict-to-json']):
        res.data = { res: '{"key": null}' };
        break;

      case includesEndpoint(['/save-and-share']):
        res.data = { token: 'some-token' };
        break;

      default:
        res.data = {};
    }
    resolve(res);
  }),
  patch: baseAxiosMock,
};
