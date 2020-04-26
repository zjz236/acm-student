// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  base: '/stu/',
  publicPath: '/stu/',
  routes: [
    {
      path: '/',
      component: '../layouts/Home/home',
    },
    {
      path: 'exam',
      component: '../layouts/Exam/exam',
      routes: [
        { path: '/exam', redirect: 'examList' },
        { path: '/exam/examList', component: '../pages/ExamList/examList', _title: '考试列表', _title_default: '考试列表' },
        { path: '/exam/login/:examId', component: '../pages/Login/login' },
        { path: '/exam/topicList/:examId', component: '../pages/TopicList/topicList' },
        { path: '/exam/tfTopic/:examId', component: '../pages/TFTopic/tfTopic' },
        { path: '/exam/selectTopic/:examId', component: '../pages/SelectTopic/selectTopic' },
        { path: '/exam/gapTopic/:examId', component: '../pages/GapTopic/gapTopic' },
        { path: '/exam/programTopic/:examId', component: '../pages/ProgramTopic/programTopic' },
        { path: '/exam/userModify/:examId', component: '../pages/UserModify/userModify' },
        { path: '/exam/rankList/:examId', component: '../pages/RankList/rankList' },
      ],
    },
  ],
  cssLoaderOptions: {
    localIdentName: '[local]',
  },
  proxy: {
    '/student': {
      target: 'http://127.0.0.1:1236',
      pathRewrite: {'/student/': '/'},
      changeOrigin: true
    },
    '/oj' : {
      target: 'http://127.0.0.1:7001',
      pathRewrite: {'/oj/': '/'},
      changeOrigin: true
    }
  },
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: false,
        dynamicImport: true,
        title: 'acm-student',
        dll: false,
        routes: {
          exclude: [/components\//],
        },
      },
    ],
  ],
  targets: {
    ie: 8,
  },
};

