import ajaxServices from '@/api/ajaxServices';
export default {
  getExamList: ajaxServices.createAssistantApiMethodGet('/student/exam/getExamList'),
  getExamInfo: ajaxServices.createAssistantApiMethodGet('/student/exam/getExamInfo')
}
