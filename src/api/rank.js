import ajaxServices from '@/api/ajaxServices';
export default {
  getRankList: ajaxServices.createAssistantApiMethodGet('student/rank/getRankList')
}
