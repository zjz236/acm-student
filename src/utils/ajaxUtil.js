import axios from 'axios';
import {setCookie, getCookie} from './cookieUtil';

const timeout = 30 * 1000;
let baseURL
if (process.env.NODE_ENV==='development'){
    baseURL = 'http://127.0.0.1:1236'
} else {
    baseURL = 'https://zjyc.zjzhmx.xyz'
}
const headers = {'Content-Type': 'application/json', 'Accept': 'application/json'};
const axiosInstance = axios.create({baseURL, timeout, headers});

const requestInterceptor = function (config) {
    if (config.data instanceof FormData) {
        config.headers["Content-Type"] = 'multipart/form-data';
        config.headers["Accept"] = '*/*';
        config.headers['Authorization'] = getCookie('token') || ''
        return config;
    }
    config.headers['Authorization'] = getCookie('token') || ''
    return config
}
axiosInstance.interceptors.request.use(requestInterceptor)
const responseSuccessInterceptor = function (response) {
    if (response.data && response.data.code === 1) {
        if (response.data.token) setCookie('token', response.data.token)
        return response
    } else if (response.data && response.data.code === 0) {
        return {error: true, errorMessage: response.data.msg};
    } else if (response.data && response.data.code === 3) {
        return {error: true, errorMessage: response.data.msg, errorType: 'Invalid Token'};
    } else {
        return {error: true, errorMessage: response.data || 'server error'};
    }
};
const responseErrorInterceptor = function (error) {
    console.error(`该API请求出错:${error && error.config && error.config.url}`, error && error.config, error);
    return {error: true, errorMessage: error && (error.message || 'server error')};
};
axiosInstance.interceptors.response.use(responseSuccessInterceptor, responseErrorInterceptor);

export default axiosInstance;
