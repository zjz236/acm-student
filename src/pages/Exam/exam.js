import React from 'react';
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

const { Header, Footer, Content } = Layout;
const { Item: MenuItem } = Menu;
const { Option } = Select;

let timer = null;

class Exam extends React.Component {
  constructor(props, context) {
    super(props, context);
    let examId = '';
    if (this.haveMenu(props.location.pathname)) {
      const index = props.location.pathname.lastIndexOf('/');
      examId = props.location.pathname.substr(
        index + 1,
        props.location.pathname.length,
      );
    }
    this.state = {
      defaultSelectedKeys: '',
      codeVisible: false,
      codeLoading: false,
      inputData: '',
      outputData: '',
      code: '',
      examId,
      notice: [],
      language: 'c',
    };
  }

  componentDidMount() {
    const { location } = this.props;
    this.setDefaultKey(location);
    this.haveMenu(this.props.location.pathname) && this.getExamNotice();
    this.props.history.listen(val => {
      this.setDefaultKey(val);
      this.haveMenu(this.props.location.pathname) && this.getExamNotice();
    });
  }

  menuRoute = ({ key }) => {
    if (key === 'IDE') {
      this.setState({
        codeVisible: true,
      });
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
  getExamNotice = async () => {
    let examId = '';
    if (this.haveMenu(this.props.location.pathname)) {
      const index = this.props.location.pathname.lastIndexOf('/');
      examId = this.props.location.pathname.substr(
        index + 1,
        this.props.location.pathname.length,
      );
    }
    try {
      const { data } = await exam.getExamNotice({ examId });
      this.setState({
        notice: data,
      });
    } catch (e) {
      console.error(e);
    }
  };

  getIDEData = async id => {
    const examId = store.getState();
    try {
      const { data } = await ide.getIDEData({
        id,
        examId,
      });
      if (['Queuing', 'Running'].indexOf(data.status) >= 0) {
        timer = setTimeout(() => this.getIDEData(id), 500);
      } else {
        clearTimeout(timer);
        this.setState({
          outputData: data.outputData || data.errMsg,
          codeLoading: false,
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({
        codeLoading: false,
      });
    }
  };

  testDataCompile = async () => {
    const { language, inputData, code } = this.state;
    const examId = store.getState();
    await this.setState({
      codeLoading: true,
    });
    try {
      const { data } = await ide.addIDEData({
        code,
        examId,
        language,
        inputData,
      });
      this.getIDEData(data.insertedId);
    } catch (e) {
      console.error(e);
      this.setState({
        codeLoading: false,
      });
    }
  };

  setDefaultKey = val => {
    const { pathname } = val;
    let defaultSelectedKeys = '';
    for (const item in menuKeys) {
      if (pathname.indexOf(item) >= 0 && item !== '/') {
        defaultSelectedKeys = menuKeys[item];
      }
    }
    this.setState({
      defaultSelectedKeys,
    });
  };

  haveMenu = path => {
    for (const item of examMenuPath) {
      if (path.indexOf(item) >= 0) {
        return true;
      }
    }
    return false;
  };

  // componentDidUpdate() {
  //   this.haveMenu(this.props.location.pathname) && this.getExamNotice();
  // }

  getNotice = () => {
    const el = [];
    const { notice } = this.state;
    for (const item of notice) {
      el.push(<Alert key={item._id} message={item.content} type="info" />);
    }
    return el;
  };

  render() {
    const {
      defaultSelectedKeys,
      codeVisible,
      inputData,
      codeLoading,
      code,
      outputData,
      language,
    } = this.state;
    const { children, location } = this.props;
    return (
      <Layout className="exam">
        <BackTop />
        <Header className="exam-header"></Header>
        <Content style={{ padding: '0 10vw' }}>
          <Menu
            onClick={this.menuRoute}
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
            {this.haveMenu(location.pathname) && (
              <MenuItem key="topicList">
                <UnorderedListOutlined />
                题目列表
              </MenuItem>
            )}
            {this.haveMenu(location.pathname) && (
              <MenuItem key="userModify">
                <UserOutlined />
                密码修改
              </MenuItem>
            )}
            {this.haveMenu(location.pathname) && (
              <MenuItem key="rankList">
                <StarOutlined />
                成绩排名
              </MenuItem>
            )}
            {this.haveMenu(location.pathname) && (
              <MenuItem key="IDE">
                <CodeOutlined />
                在线IDE
              </MenuItem>
            )}
            {this.haveMenu(location.pathname) && (
              <MenuItem key="logout" style={{ float: 'right' }}>
                <LogoutOutlined />
                退出登录
              </MenuItem>
            )}
          </Menu>
          <Modal
            maskClosable={false}
            width={800}
            onCancel={() => {
              this.setState({
                codeVisible: false,
                codeLoading: false,
                code: '',
                inputData: '',
                outputData: '',
                language: 'c',
              });
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
                  onChange={e => this.setState({ language: e })}
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
                <Button
                  disabled={codeLoading}
                  onClick={() => this.testDataCompile()}
                >
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
                  onChange={e => this.setState({ code: e })}
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
                    onChange={e => this.setState({ inputData: e })}
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
            {this.haveMenu(location.pathname) && (
              <Carousel style={{ marginBottom: 15 }} autoplay dots={false}>
                {this.getNotice()}
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
        ;
      </Layout>
    );
  }
}

export default Exam;
