import ajaxServices from '@/api/ajaxServices';
export default {
  getExamList: ajaxServices.createAssistantApiMethodGet('/student/exam/getExamList'),
  getExamNotice: ajaxServices.createAssistantApiMethodGet('/student/exam/getExamNotice'),
  getExamInfo: ajaxServices.createAssistantApiMethodGet('/student/exam/getExamInfo')
}
