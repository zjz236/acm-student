import ajaxUtil from './ajaxUtil';
import { message } from 'antd';
import router from 'umi/router';


const interceptor = (func) => (param, customTipError) => new Promise((resolve, reject) => {
  func(param).then((res = {}) => {
    if (res.error) {
      let errorMessage =
        (res.errorMessage) ||
        ('unKnow error');
      let errorType = res.errorType;
      if (errorType && errorType === 'Invalid Token') {
        router.push('/exam/login/' + param.examId)
      }
      if (customTipError instanceof Function) {
        customTipError(res);
      } else if (!customTipError && errorMessage) {
        // tipRequestErrorMessage(errorMessage);
      }
      message.error(errorMessage);
      res.errorMessage = errorMessage;
      reject(res);
    } else {
      resolve(res.data);
    }
  }, (...e) => {
    if (customTipError instanceof Function) customTipError(...e);
    reject(...e);
  });
});
const createAssistantApiMethodGet = (uri, defaultData) => interceptor((data = defaultData) => ajaxUtil.get(uri, { params: data }));
const createAssistantApiMethodPost = (uri, defaultData) => interceptor((data = defaultData) => ajaxUtil.post(uri, data));
export default {
  createAssistantApiMethodPost,
  createAssistantApiMethodGet,
};
