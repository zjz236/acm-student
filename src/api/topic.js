import ajaxServices from '@/api/ajaxServices';
export default {
  getTopicList: ajaxServices.createAssistantApiMethodGet('/student/topic/getTopicList'),
  getTopicInfo: ajaxServices.createAssistantApiMethodGet('/student/topic/getTopicInfo')
}
