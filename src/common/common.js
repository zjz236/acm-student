export const userKey = {
  username: '用户名',
  trueName: '姓名',
  sex: '性别',
  school: '学校',
  email: '邮箱',
  isAdmin: '用户信息',
  createTime: '注册时间',
};
export const getSex = {
  1: '男',
  0: '女',
};
export const menuKeys = {
  '/exam/examList': 'examList',
  '/': 'home',
  '/exam/topicList': 'topicList',
  '/exam/userModify': 'userModify',
  '/exam/rankList': 'rankList',
};
export const languages = ['C语言', 'C++', 'Java', 'Python'];
export const examStatus = (start, end) => {
  if (new Date() < new Date(start)) {
    return 'pending';
  }
  if (new Date() > new Date(start) && new Date() < new Date(end)) {
    return 'starting';
  }
  if (new Date() > new Date(end)) {
    return 'ending';
  }
};

export const badgeColor = {
  pending: '#67C23A',
  starting: '#F56C6C',
  ending: '#909399',
};

export const compileColor = {
  Queuing: '#67C23A',
  Running: '#67C23A',
  'Wrong Answer': '#67C23A',
  Accepted: '#F56C6C',
  'Memory Limit Exceeded': '#909399',
  'Time Limit Exceeded': '#909399',
  'Presentation Error': '#E6A23C',
};

export const difficulty = [0, 60, 70, 80, 90, 100];

export const baseUrl = () => {
  return process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:1236/' : '';
};

export const matchReg = (str) => {
  const reg = /<\/?.+?\/?>/g;
  return str.replace(reg, '');
};

export const languageModel = {
  c: '#include <stdio.h>\nint main()\n{\n    printf("Hello, World!");\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\nint main()\n{\n    cout << "Hello, World!";\n    return 0;\n}',
  java: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}',
  python: '#Hello, World\n \nprint("Hello, World!")',
};

export const gapCodeShow = (code, gaps) => {
  for (const index in gaps) {
    const gap = gaps[parseInt(index)];
    if (gap && code.indexOf(`_(${parseInt(index) + 1})_`) >= 0) {
      code = code.replace(`_(${parseInt(index) + 1})_`, gap);
    }
  }
  return code;
};

export const examMenuPath = [
  '/exam/topicList/',
  '/exam/tfTopic/',
  '/exam/selectTopic/',
  '/exam/gapTopic/',
  '/exam/programTopic/',
  '/exam/userModify/',
  '/exam/rankList/',
];

export const languageMode = {
  c: 'c_cpp',
  cpp: 'c_cpp',
  java: 'java',
  python: 'python',
};
