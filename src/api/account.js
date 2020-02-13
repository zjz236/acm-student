import ajaxServices from '@/api/ajaxServices';
export default {
  login: ajaxServices.createAssistantApiMethodPost('student/account/login'),
  userPasswordModify: ajaxServices.createAssistantApiMethodPost('student/account/userPasswordModify'),
  getPublicKey: ajaxServices.createAssistantApiMethodGet('student/account/getPublicKey')
}
