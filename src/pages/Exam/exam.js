import React, { useEffect, useState } from 'react';
import {
  Layout,
  Menu,
  BackTop,
  Modal,
  Button,
  Spin,
  Divider,
  Select,
  Carousel,
  Alert,
} from 'antd';
import './exam.less';
import Live2d from '@/components/Live2d/live2d';
import { history } from 'umi';
import { menuKeys, examMenuPath, languageMode } from '@/common/common';
import store from '@/store';
import AceEditor from 'react-ace';
import ide from '@/api/ide';
import { delCookie } from '@/common/cookieUtil';
import exam from '@/api/exam';
import {
  HomeOutlined,
  UnorderedListOutlined,
  UserOutlined,
  StarOutlined,
  ProfileOutlined,
  CodeOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-powershell';
import 'ace-builds/src-noconflict/theme-tomorrow_night_bright';

const { Header, Footer, Content } = Layout;
const { Item: MenuItem } = Menu;
const { Option } = Select;

let timer = null;
const haveMenu = path => {
  for (const item of examMenuPath) {
    if (path.indexOf(item) >= 0) {
      return true;
    }
  }
  return false;
};
const Exam = props => {
  const { children } = props;
  let examIdText = '';
  if (haveMenu(props.history.location.pathname)) {
    const index = props.history.location.pathname.lastIndexOf('/');
    examIdText = props.history.location.pathname.substr(
      index + 1,
      props.history.location.pathname.length,
    );
  }
  const [defaultSelectedKeys, setDefaultSelectedKeys] = useState('');
  const [codeVisible, setCodeVisible] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [inputData, setInputData] = useState('');
  const [outputData, setOutputData] = useState('');
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState([]);
  const [language, setLanguage] = useState('c');
  useEffect(() => {
    setDefaultKey(history.location);
    haveMenu(history.location.pathname) && getExamNotice();
    history.listen(val => {
      setDefaultKey(val);
      haveMenu(history.location.pathname) && getExamNotice();
    });
  }, []);
  /**
   * 设置导航栏初始值
   * @param val
   */
  const setDefaultKey = val => {
    const { pathname } = val;
    let defaultSelectedKeys = '';
    for (const item in menuKeys) {
      if (pathname.indexOf(item) >= 0 && item !== '/') {
        defaultSelectedKeys = menuKeys[item];
      }
    }
    setDefaultSelectedKeys(defaultSelectedKeys);
  };
  /**
   * 获取通知
   * @returns {Promise<void>}
   */
  const getExamNotice = async () => {
    let examId = '';
    if (haveMenu(history.location.pathname)) {
      const index = history.location.pathname.lastIndexOf('/');
      examId = history.location.pathname.substr(
        index + 1,
        history.location.pathname.length,
      );
    }
    try {
      const { data } = await exam.getExamNotice({ examId });
      setNotice(data);
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * 导航栏路由跳转
   * @param key
   */
  const menuRoute = ({ key }) => {
    if (key === 'IDE') {
      setCodeVisible(true);
      return;
    }
    const examId = store.getState();
    if (key === 'logout') {
      delCookie('stu-token');
      history.push('/exam/login/' + examId);
      return;
    }
    for (const item in menuKeys) {
      if (menuKeys[item] === key) {
        if (key === 'home' || key === 'examList') {
          history.push(item);
        } else {
          history.push(item + '/' + examId);
        }
      }
    }
  };
  /**
   * 获取编译信息
   * @param id
   * @returns {Promise<void>}
   */
  const getIDEData = async id => {
    const examId = store.getState();
    try {
      const { data } = await ide.getIDEData({
        id,
        examId,
      });
      if (['Queuing', 'Running'].includes(data.status)) {
        timer = setTimeout(() => getIDEData(id), 500);
      } else {
        clearTimeout(timer);
        setOutputData(data.outputData || data.errMsg);
        setCodeLoading(false);
      }
    } catch (e) {
      console.error(e);
      setCodeLoading(false);
    }
  };
  /**
   * 获取通知信息dom
   * @returns {[]}
   */
  const getNotice = () => {
    const el = [];
    for (const item of notice) {
      el.push(<Alert key={item._id} message={item.content} type="info" />);
    }
    return el;
  };
  /**
   * 向后端传递编译信息
   * @returns {Promise<void>}
   */
  const testDataCompile = async () => {
    const examId = store.getState();
    await setCodeLoading(true);
    try {
      const { data } = await ide.addIDEData({
        code,
        examId,
        language,
        inputData,
      });
      getIDEData(data.insertedId);
    } catch (e) {
      console.error(e);
      setCodeLoading(false);
    }
  };
  return (
    <Layout className="exam">
      <BackTop />
      <Header className="exam-header"></Header>
      <Content style={{ padding: '0 10vw' }}>
        <Menu
          onClick={menuRoute}
          mode="horizontal"
          className="exam-menu"
          selectedKeys={defaultSelectedKeys}
        >
          <MenuItem key="home">
            <HomeOutlined />
            首页
          </MenuItem>
          <MenuItem key="examList">
            <ProfileOutlined />
            考试列表
          </MenuItem>
          {haveMenu(history.location.pathname) && (
            <MenuItem key="topicList">
              <UnorderedListOutlined />
              题目列表
            </MenuItem>
          )}
          {haveMenu(history.location.pathname) && (
            <MenuItem key="userModify">
              <UserOutlined />
              密码修改
            </MenuItem>
          )}
          {haveMenu(history.location.pathname) && (
            <MenuItem key="rankList">
              <StarOutlined />
              成绩排名
            </MenuItem>
          )}
          {haveMenu(history.location.pathname) && (
            <MenuItem key="IDE">
              <CodeOutlined />
              在线IDE
            </MenuItem>
          )}
          {haveMenu(history.location.pathname) && (
            <MenuItem key="logout" style={{ float: 'right' }}>
              <LogoutOutlined />
              退出登录
            </MenuItem>
          )}
        </Menu>
        <Modal
          maskClosable={false}
          width={800}
          className="ide-modal"
          onCancel={() => {
            setCodeLoading(false);
            setCodeVisible(false);
            setCode('');
            setInputData('');
            setOutputData('');
            setLanguage('c');
            clearTimeout(timer);
          }}
          visible={codeVisible}
          title={
            <section>
              <span className="ant-modal-title" style={{ marginRight: 20 }}>
                {' '}
                在线IDE{' '}
              </span>
              <Select
                style={{ width: 100 }}
                onChange={e => setLanguage(e)}
                value={language}
              >
                <Option value="c">C语言</Option>
                <Option value="cpp">C++</Option>
                <Option value="java">Java</Option>
                <Option value="python">Python</Option>
              </Select>
            </section>
          }
          bodyStyle={{ display: 'flex' }}
          footer={
            <section>
              <Button disabled={codeLoading} onClick={() => testDataCompile()}>
                运行
              </Button>
            </section>
          }
        >
          <Spin spinning={codeLoading} wrapperClassName="spin">
            <div className="code-input">
              <Divider orientation="left">程序代码</Divider>
              <AceEditor
                mode={languageMode[language]}
                height="350px"
                width="100%"
                theme="tomorrow_night_bright"
                value={code}
                onChange={e => setCode(e)}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
              />
            </div>
            <div className="test-data">
              <div className="input test">
                <Divider orientation="left">输入样例</Divider>
                <AceEditor
                  mode="powershell"
                  height="130px"
                  width="100%"
                  value={inputData}
                  onChange={e => setInputData(e)}
                  theme="tomorrow_night_bright"
                  editorProps={{ $blockScrolling: true }}
                />
              </div>
              <div className="output test">
                <Divider orientation="left">输出样例</Divider>
                <AceEditor
                  mode="powershell"
                  height="130px"
                  width="100%"
                  value={outputData}
                  theme="tomorrow_night_bright"
                  readOnly={true}
                  editorProps={{ $blockScrolling: true }}
                />
              </div>
            </div>
          </Spin>
        </Modal>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          {haveMenu(history.location.pathname) && (
            <Carousel style={{ marginBottom: 15 }} autoplay dots={false}>
              {getNotice()}
            </Carousel>
          )}
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        浙ICP备18055051号&emsp;技术支持：计算机162{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://zjz236.github.io/"
        >
          朱锦泽
        </a>
        , 黄梦霞
      </Footer>
      <Live2d></Live2d>
    </Layout>
  );
};

export default Exam;
