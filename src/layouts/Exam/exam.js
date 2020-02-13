import React from 'react';
import { Layout, Menu, Icon, BackTop, Modal, Button, Spin, Divider, Select } from 'antd';
import './exam.scss';
import router from 'umi/router';
import { menuKeys, examMenuPath, languageMode } from '@/common/common';
import store from '@/store';
import AceEditor from 'react-ace';
import ide from '@/api/ide';
import { delCookie } from '@/common/cookieUtil';

const { Header, Footer, Content } = Layout;
const { Item: MenuItem } = Menu;
const { Option } = Select;

let timer = null;

class Exam extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      defaultSelectedKeys: '',
      codeVisible: false,
      codeLoading: false,
      inputData: '',
      outputData: '',
      code: '',
      language: 'c',
    };
  }

  componentDidMount() {
    const { location } = this.props;
    this.setDefaultKey(location);
    this.props.history.listen(val => {
      this.setDefaultKey(val);
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
      router.push('/exam/login/' + examId);
      return;
    }
    for (const item in menuKeys) {
      if (menuKeys[item] === key) {
        if (key === 'home' || key === 'examList') {
          router.push(item);
        } else {
          router.push(item + '/' + examId);
        }
      }
    }
  };

  getIDEData = async (id) => {
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

  setDefaultKey = (val) => {
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

  haveMenu = (path) => {
    for (const item of examMenuPath) {
      if (path.indexOf(item) >= 0) {
        return true;
      }
    }
    return false;
  };

  render() {
    const { defaultSelectedKeys, codeVisible, inputData, codeLoading, code, outputData, language } = this.state;
    const { children, location } = this.props;
    return (
      <Layout className="exam">
        <BackTop/>
        <Header className="exam-header">
        </Header>
        <Content style={{ padding: '0 10vw' }}>
          <Menu onClick={this.menuRoute} mode="horizontal" className="exam-menu"
                selectedKeys={defaultSelectedKeys}>
            <MenuItem key="home"><Icon type="home"/>首页</MenuItem>
            <MenuItem key="examList"><Icon type="profile"/>考试列表</MenuItem>
            {this.haveMenu(location.pathname) && (
              <MenuItem key="topicList"><Icon type="unordered-list"/>题目列表</MenuItem>
            )}
            {this.haveMenu(location.pathname) && (
              <MenuItem key="userModify"><Icon type="user"/>密码修改</MenuItem>
            )}
            {this.haveMenu(location.pathname) && (
              <MenuItem key="rankList"><Icon type="star"/>成绩排名</MenuItem>
            )}
            {this.haveMenu(location.pathname) && (
              <MenuItem key="IDE"><Icon type="code"/>在线IDE</MenuItem>
            )}
            {this.haveMenu(location.pathname) && (
              <MenuItem key="logout" style={{ float: 'right' }}><Icon type="logout"/>退出登录</MenuItem>
            )}
          </Menu>
          <Modal maskClosable={false} width={800} onCancel={() => {
            this.setState({
              codeVisible: false,
              codeLoading: false,
              code: '',
              inputData: '',
              outputData: '',
              language: 'c',
            });
            clearTimeout(timer);
          }} visible={codeVisible} title={(<section>
            <span className="ant-modal-title" style={{ marginRight: 20 }}> 在线IDE </span>
            <Select style={{ width: 100 }} onChange={e => this.setState({ language: e })} value={language}>
              <Option value="c">C语言</Option>
              <Option value="cpp">C++</Option>
              <Option value="java">Java</Option>
              <Option value="python">Python</Option>
            </Select></section>)} bodyStyle={{ display: 'flex' }}
                 footer={<section>
                   <Button disabled={codeLoading} onClick={() => this.testDataCompile()}>运行</Button>
                 </section>}>
            <Spin spinning={codeLoading} wrapperClassName="spin">
              <div className="code-input">
                <Divider orientation="left">程序代码</Divider>
                <AceEditor
                  mode={languageMode[language]}
                  height="350px"
                  width="100%"
                  theme="tomorrow_night_bright"
                  value={code}
                  onChange={(e) => this.setState({ code: e })}
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
                  /></div>
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
                  /></div>
              </div>
            </Spin>
          </Modal>
          <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>技术支持：计算机162 <a target="_blank" rel="noopener noreferrer"
                                                               href="https://zjz236.github.io/">朱锦泽</a>, 黄梦霞</Footer>
      </Layout>
    );
  }

}

export default Exam;
