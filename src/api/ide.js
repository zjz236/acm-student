import ajaxServices from '@/api/ajaxServices';
export default {
  getIDEData: ajaxServices.createAssistantApiMethodGet('/student/ide/getIDEData'),
  addIDEData: ajaxServices.createAssistantApiMethodPost('/student/ide/addIDEData')
}
