import React from 'react';
import './programTopic.scss';
import { Card, Spin, Modal, message, Divider, Button, Table, Tag } from 'antd';
import exam from '@/api/exam';
import ide from '@/api/ide';
import { compileColor, examStatus, languageMode, languageModel } from '@/common/common';
import topic from '@/api/topic';
import operation from '@/api/operation';
import AceEditor from 'react-ace';
import store from '@/store';

import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-powershell';
import 'ace-builds/src-noconflict/theme-tomorrow_night_bright';

let timer = null;
let statusTimer = null;

const { Column } = Table;

class ProgramTopic extends React.Component {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      examInfo: {},
      examId: params.examId,
      disabled: true,
      topicData: [],
      loading: false,
      answer: [],
      codeVisible: false,
      inputData: '',
      outputData: '',
      codeLoading: false,
      status: [],
    };
  }

  componentDidMount() {
    this.getExamInfo();
    this.getTopicInfo();
  }

  getExamInfo = async () => {
    try {
      const { examId } = this.state;
      const action = {
        type: 'user',
        examId: examId,
      };
      store.dispatch(action);
      const { data } = await exam.getExamInfo({ examId });
      this.setState({
        examInfo: data,
        disabled: examStatus(data.startTime, data.finishTime) !== 'starting',
      });
    } catch (e) {
      console.error(e);
    }
  };

  getTopicInfo = async () => {
    await this.setState({
      loading: true,
    });
    try {
      const { examId } = this.state;
      const { data: { topicData, answer } } = await topic.getTopicInfo({ examId, topicType: 'examProgramTopic' });
      this.setState({ topicData, answer, loading: false });
    } catch (e) {
      console.error(e);
      this.setState({ loading: false });
    }
  };

  getTopicCard = () => {
    const { topicData, answer } = this.state;
    const topicEl = [];
    for (const index in topicData) {
      const item = topicData[index];
      let score = '';
      const i = answer.map(it => it.topicId).indexOf(item._id);
      if (item.grade) {
        score = answer[i] ? answer[i].score + '分' : '0分';
      } else {
        score = answer[i] ? answer[i].score + '分' : '';
      }
      topicEl.push(
        <Card style={{ marginBottom: 15 }} size="small"
              title={<section><span
                className="ant-card-head-title"
                style={{ marginRight: 20 }}>{`第${parseInt(index) + 1}题 (${item.testCount * 10}分)：${item.title}`}</span>
                <span style={{ color: 'red' }}
                      className="ant-card-head-title">{score}</span>
              </section>}
              key={item._id}
              extra={<section><Button style={{ margin: '0 10px' }} type="primary"
                                      disabled={i < 0}
                                      onClick={async () => {
                                        await this.setState({
                                          statusVisible: true,
                                          topicId: item._id,
                                        });
                                        this.getProgramStatus();
                                      }}>题目状态</Button>
                <Button type="primary"
                        onClick={() => this.setState({
                          codeVisible: true,
                          topicId: item._id,
                          inputData: item.simpleInput,
                          outputData: '',
                        })}>输入代码</Button></section>}>
          <div dangerouslySetInnerHTML={{ __html: item.description }}/>
          <Divider orientation="left">输入描述</Divider>
          <div dangerouslySetInnerHTML={{ __html: item.inputDesc }}/>
          <Divider orientation="left">输出描述</Divider>
          <div dangerouslySetInnerHTML={{ __html: item.outputDesc }}/>
          <Divider orientation="left">样例输入</Divider>
          <div>{item.simpleInput}</div>
          <Divider orientation="left">样例输出</Divider>
          <div>{item.simpleOutput}</div>
        </Card>,
      );
    }
    return topicEl;
  };

  getProgramStatus = async () => {
    const { topicId, examId, answer } = this.state;
    try {
      const { data } = await operation.getProgramStatus({
        topicId,
        examId,
      });
      const index = answer.map(item => item.topicId).indexOf(topicId);
      answer[index].status = data.status;
      this.setState({
        status: data.status,
        answer,
      });
      const status = data.status.map(item => item.status);
      if (status.includes('Queuing')|| status.includes('Running')) {
        statusTimer = setTimeout(() => this.getProgramStatus(), 500);
      } else {
        clearTimeout(statusTimer);
        this.getTopicInfo();
      }
    } catch (e) {
      console.error(e);
    }
  };
  topicSubmit = async () => {
    const { answer, examId, topicId } = this.state;
    await this.setState({
      loading: true,
    });
    const index = answer.map(item => item.topicId).indexOf(topicId);
    const value = index >= 0 ? [{
      topicId,
      code: answer[index].code,
    }] : [{
      topicId,
      code: this.getAceValue(),
    }];
    try {
      await operation.topicSubmit({
        topicType: 'examProgramAnswer',
        examId,
        answer: value,
      });
      message.success('提交成功');
      await this.setState({
        statusVisible: true,
        codeVisible: false,
      });
      this.getProgramStatus();
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  aceValueChange = (value) => {
    const { answer, topicId } = this.state;
    const index = answer.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      answer[index].code = value;
    } else {
      answer.push({
        topicId,
        code: value,
      });
    }
  };

  getIDEData = async (id) => {
    const { examId } = this.state;
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

  testDataCompile = async (code) => {
    const { examInfo, inputData, examId } = this.state;
    await this.setState({
      codeLoading: true,
    });
    try {
      const { data } = await ide.addIDEData({
        code,
        examId,
        language: examInfo.language,
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

  getAceValue = () => {
    const { answer, topicId, examInfo } = this.state;
    const index = answer.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      return answer[index].code;
    } else {
      return languageModel[examInfo.language];
    }
  };

  render() {
    const { loading, codeVisible, inputData, outputData, examInfo, codeLoading, statusVisible, status, disabled } = this.state;
    return (
      <Spin spinning={loading}>
        <div className="program-topic">
          <h1>程序设计题</h1>
          {this.getTopicCard()}
          <Modal maskClosable={false} width={800} onCancel={() => {
            this.setState({ codeVisible: false, codeLoading: false });
            clearTimeout(timer);
          }}
                 visible={codeVisible} title="代码输入" bodyStyle={{ display: 'flex' }}
                 footer={<section>
                   <Button disabled={codeLoading || disabled}
                           onClick={() => this.testDataCompile(this.getAceValue())}>样例检测</Button>
                   <Button disabled={codeLoading || disabled} onClick={() => this.topicSubmit()}>提交</Button>
                 </section>}>
            <Spin spinning={codeLoading} wrapperClassName="spin">
              <div className="code-input">
                <Divider orientation="left">程序代码</Divider>
                <AceEditor
                  mode={languageMode[examInfo.language]}
                  height="350px"
                  width="100%"
                  readOnly={disabled}
                  theme="tomorrow_night_bright"
                  value={this.getAceValue()}
                  onChange={(e) => this.aceValueChange(e)}
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
                    readOnly={disabled}
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
          <Modal maskClosable={false} width={500} visible={statusVisible} onCancel={() => {
            this.setState({
              statusVisible: false,
            });
            clearTimeout(statusVisible);
          }} footer={null} title="题目状态">
            <Table dataSource={status} pagination={false}>
              <Column title="ID" key="id" dataIndex="id" render={(text, record, index) => (
                <span>{parseInt(index) + 1}</span>
              )}/>
              <Column title="编译状态" key="status" dataIndex="status" render={(text) => (
                <Tag color={compileColor[text]}>{text}</Tag>
              )}/>
              <Column title="编译错误问题" key="errMsg" dataIndex="errMsg"/>
            </Table>
          </Modal>
        </div>
      </Spin>
    );
  }
}

export default ProgramTopic;
