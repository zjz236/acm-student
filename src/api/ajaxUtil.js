import axios from 'axios';
import { setCookie, getCookie } from '@/common/cookieUtil';
import { baseUrl } from '@/common/common';

const timeout = 30 * 1000;

const baseURL = baseUrl();

const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
const axiosInstance = axios.create({ baseURL, timeout, headers });

const requestInterceptor = function(config) {
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
    config.headers['Accept'] = '*/*';
    config.headers['cookies'] = `token=${getCookie('stu-token') || ''}`;
    return config;
  }
  config.headers['cookies'] = `token=${getCookie('stu-token') || ''}`;
  return config;
};
axiosInstance.interceptors.request.use(requestInterceptor);
const responseSuccessInterceptor = function(response) {
  if (response.data && response.data.code === 1) {
    response.data.token && setCookie('stu-token', response.data.token);
    return response;
  } else if (response.data && response.data.code === 0) {
    return { error: true, errorMessage: response.data.msg };
  } else if (response.data && response.data.code === -1) {
    return { error: true, errorMessage: response.data.msg, errorType: 'Invalid Token' };
  } else {
    // eslint-disable-next-line no-undef
    return { error: true, errorMessage: error && error.message || 'server error' };
  }
};
const responseErrorInterceptor = function(error) {
  // eslint-disable-next-line no-console
  console.error(`该API请求出错:${error && error.config && error.config.url}`, error && error.config, error);
  return { error: true, errorMessage: error && error.message || 'server error' };
};
axiosInstance.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

export default axiosInstance;
