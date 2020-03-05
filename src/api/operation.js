import ajaxServices from '@/api/ajaxServices';
export default {
  topicSubmit: ajaxServices.createAssistantApiMethodPost('/student/operation/topicSubmit'),
  getProgramStatus: ajaxServices.createAssistantApiMethodGet('/student/operation/getProgramStatus')
}
