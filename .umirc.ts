import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  base: '/stu/',
  publicPath: '/stu/',
  routes: [
    {
      path: '/',
      component: '@/pages/Home/home',
      title: '首页',
    },
    {
      path: '/exam',
      component: '@/pages/Exam/exam',
      routes: [
        { path: '/exam', redirect: 'examList' },
        {
          path: '/exam/examList',
          component: '@/pages/ExamList/examList',
          title: '考试列表',
        },
        {
          path: '/exam/login/:examId',
          component: '@/pages/Login/login',
          title: '登录',
        },
        {
          path: '/exam/topicList/:examId',
          component: '@/pages/TopicList/topicList',
          title: '题目列表',
        },
        {
          path: '/exam/tfTopic/:examId',
          component: '@/pages/TFTopic/tfTopic',
          title: '判断题',
        },
        {
          path: '/exam/selectTopic/:examId',
          component: '@/pages/SelectTopic/selectTopic',
          title: '选择题',
        },
        {
          path: '/exam/gapTopic/:examId',
          component: '@/pages/GapTopic/gapTopic',
          title: '程序填空题',
        },
        {
          path: '/exam/programTopic/:examId',
          component: '@/pages/ProgramTopic/programTopic',
          title: '程序设计题',
        },
        {
          path: '/exam/userModify/:examId',
          component: '@/pages/UserModify/userModify',
          title: '修改密码',
        },
        {
          path: '/exam/rankList/:examId',
          component: '@/pages/RankList/rankList',
          title: '查看排名',
        },
      ],
    },
    { component: '@/pages/404' },
  ],
  antd: {},
  dynamicImport: {
    loading: '@/components/Loading/loading',
  },
  proxy: {
    '/student': {
      target: 'https://zjz236.xyz:443',
      pathRewrite: { '/student/': '/student/' },
      changeOrigin: true,
    },
    '/oj': {
      target: 'https://zjz236.xyz:443',
      pathRewrite: { '/oj/': '/oj/' },
      changeOrigin: true,
    },
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  targets: {
    ie: 8,
  },
});
