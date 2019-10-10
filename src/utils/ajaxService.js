import ajaxUtil from './ajaxUtil'
import {message} from 'antd';
import {tokenError} from './commonUtil'

const interceptor = (func) => (param, customTipError) => new Promise((resolve, reject) => {
    func(param).then((res = {}) => {
        console.log(res)
        if (res.error) {
            console.log(res)
            let errorMessage =
                (res.errorMessage) ||
                ('unKnow error');
            let errorType = res.errorType
            if (errorType && errorType === 'Invalid Token') {
                tokenError();
            }
            if (customTipError instanceof Function) {
                customTipError(res);
            } else if (!customTipError && errorMessage) {
                // tipRequestErrorMessage(errorMessage);
            }
            message.error(errorMessage)
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
const createAssistantApiMethod = (uri, defaultData) => interceptor((data = defaultData) => ajaxUtil.post(uri, data));
const ajaxService = {
    getExamList: createAssistantApiMethod('api/studentExam/getExamList'),
    getExamStatus: createAssistantApiMethod('api/studentExam/getExamStatus'),
    examLogin: createAssistantApiMethod('api/studentExam/examLogin'),
    getExamTopic: createAssistantApiMethod('api/studentExam/getExamTopic'),
    getExamProgram: createAssistantApiMethod('api/studentExam/getExamProgram'),
    submitProgram: createAssistantApiMethod('api/studentExam/submitProgram'),
    getProgramStatus: createAssistantApiMethod('api/studentExam/getProgramStatus'),
    getExamTF: createAssistantApiMethod('api/studentExam/getExamTF'),
    submitTF: createAssistantApiMethod('api/studentExam/submitTF'),
    getExamSelect: createAssistantApiMethod('api/studentExam/getExamSelect'),
    submitSelect: createAssistantApiMethod('api/studentExam/submitSelect'),
    getExamGap: createAssistantApiMethod('api/studentExam/getExamGap'),
    submitGap: createAssistantApiMethod('api/studentExam/submitGap'),
}
export default ajaxService
