import React, { useEffect, useState } from 'react';
import './programTopic.less';
import { Card, Spin, Modal, message, Divider, Button, Table, Tag } from 'antd';
import exam from '@/api/exam';
import ide from '@/api/ide';
import {
  compileColor,
  examStatus,
  languageMode,
  languageModel,
} from '@/common/common';
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

const ProgramTopic = props => {
  const {
    match: { params },
  } = props;
  const [examInfo, setExamInfo] = useState({});
  const [examId] = useState(params.examId);
  const [topicId, setTopicId] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [topicData, setTopicData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState([]);
  const [codeVisible, setCodeVisible] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [status, setStatus] = useState([]);
  const [inputData, setInputData] = useState('');
  const [statusVisible, setStatusVisible] = useState(false);
  const [outputData, setOutputData] = useState('');
  useEffect(() => {
    getTopicInfo();
    getExamInfo();
  }, []);
  /**
   * 获取考试信息
   * @returns {Promise<void>}
   */
  const getExamInfo = async () => {
    try {
      const action = {
        type: 'user',
        examId: examId,
      };
      store.dispatch(action);
      const { data } = await exam.getExamInfo({ examId });
      setExamInfo(data);
      setDisabled(examStatus(data.startTime, data.finishTime) !== 'starting');
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * 获取卡片dom
   * @returns {[]}
   */
  const getTopicCard = () => {
    const topicEl = [];
    for (const index in topicData) {
      const item = topicData[index];
      let score = '';
      const i = answer.map(it => it.topicId).indexOf(item._id);
      if (
        item.grade &&
        examStatus(examInfo.startTime, examInfo.finishTime) === 'ending'
      ) {
        score = answer[i] ? answer[i].score + '分' : '0分';
      } else {
        score = answer[i] ? answer[i].score + '分' : '';
      }
      topicEl.push(
        <Card
          style={{ marginBottom: 15 }}
          size="small"
          title={
            <section>
              <span
                className="ant-card-head-title"
                style={{ marginRight: 20 }}
              >{`第${parseInt(index) + 1}题 (${item.testCount * 10}分)：${
                item.title
              }`}</span>
              <span style={{ color: 'red' }} className="ant-card-head-title">
                {score}
              </span>
            </section>
          }
          key={item._id}
          extra={
            <section>
              <Button
                style={{ margin: '0 10px' }}
                type="primary"
                disabled={i < 0}
                onClick={async () => {
                  setStatusVisible(true);
                  setTopicId(item._id);
                  useEffect(() => {
                    getProgramStatus();
                  }, [statusVisible, topicId]);
                }}
              >
                题目状态
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setCodeVisible(true);
                  setTopicId(item._id);
                  setInputData(item.simpleInput);
                  setOutputData('');
                }}
              >
                输入代码
              </Button>
            </section>
          }
        >
          <div dangerouslySetInnerHTML={{ __html: item.description }} />
          <Divider orientation="left">输入描述</Divider>
          <div dangerouslySetInnerHTML={{ __html: item.inputDesc }} />
          <Divider orientation="left">输出描述</Divider>
          <div dangerouslySetInnerHTML={{ __html: item.outputDesc }} />
          <Divider orientation="left">样例输入</Divider>
          <div>{item.simpleInput}</div>
          <Divider orientation="left">样例输出</Divider>
          <div>{item.simpleOutput}</div>
        </Card>,
      );
    }
    return topicEl;
  };
  /**
   * 获取编译数据
   * @param id
   * @returns {Promise<void>}
   */
  const getIDEData = async id => {
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
   * 代码编译
   * @param code
   * @returns {Promise<void>}
   */
  const testDataCompile = async code => {
    await setCodeLoading(true);
    try {
      const { data } = await ide.addIDEData({
        code,
        examId,
        language: examInfo.language,
        inputData,
      });
      getIDEData(data.insertedId);
    } catch (e) {
      console.error(e);
      await setCodeLoading(false);
    }
  };
  /**
   * 获取题目状态
   * @returns {Promise<void>}
   */
  const getProgramStatus = async () => {
    try {
      const { data } = await operation.getProgramStatus({
        topicId,
        examId,
      });
      const index = answer.map(item => item.topicId).indexOf(topicId);
      answer[index].status = data.status;
      setStatus(data.status);
      setAnswer(answer.slice());
      const status = data.status.map(item => item.status);
      if (status.includes('Queuing') || status.includes('Running')) {
        statusTimer = setTimeout(() => getProgramStatus(), 500);
      } else {
        clearTimeout(statusTimer);
        getTopicInfo();
      }
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * 获取题目信息
   * @returns {Promise<void>}
   */
  const getTopicInfo = async () => {
    await setLoading(true);
    try {
      const {
        data: { topicData, answer },
      } = await topic.getTopicInfo({ examId, topicType: 'examProgramTopic' });
      setAnswer(answer);
      setTopicData(topicData);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };
  /**
   * 获取编辑器值
   * @returns {*}
   */
  const getAceValue = () => {
    const index = answer.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      return answer[index].code;
    } else {
      return languageModel[examInfo.language];
    }
  };
  /**
   * 题目提交
   * @returns {Promise<void>}
   */
  const topicSubmit = async () => {
    setLoading(true);
    const index = answer.map(item => item.topicId).indexOf(topicId);
    const value =
      index >= 0
        ? [
            {
              topicId,
              code: answer[index].code,
            },
          ]
        : [
            {
              topicId,
              code: getAceValue(),
            },
          ];
    try {
      await operation.topicSubmit({
        topicType: 'examProgramAnswer',
        examId,
        answer: value,
      });
      message.success('提交成功');
      setStatusVisible(true);
      setCodeVisible(false);
      getProgramStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  /**
   * 编辑器数据改变
   * @param value
   */
  const aceValueChange = value => {
    const index = answer.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      answer[index].code = value;
    } else {
      answer.push({
        topicId,
        code: value,
      });
    }
    setAnswer(answer.slice());
  };
  return (
    <Spin spinning={loading}>
      <div className="program-topic">
        <h1>程序设计题</h1>
        {getTopicCard()}
        <Modal
          maskClosable={false}
          width={800}
          onCancel={() => {
            setCodeVisible(false);
            setCodeLoading(false);
            clearTimeout(timer);
          }}
          visible={codeVisible}
          title="代码输入"
          bodyStyle={{ display: 'flex' }}
          footer={
            <section>
              <Button
                disabled={codeLoading || disabled}
                onClick={() => testDataCompile(getAceValue())}
              >
                样例检测
              </Button>
              <Button
                disabled={codeLoading || disabled}
                onClick={() => topicSubmit()}
              >
                提交
              </Button>
            </section>
          }
        >
          <Spin spinning={codeLoading} wrapperClassName="spin">
            <div className="code-input">
              <Divider orientation="left">程序代码</Divider>
              <AceEditor
                mode={languageMode[examInfo.language]}
                height="350px"
                width="100%"
                readOnly={disabled}
                theme="tomorrow_night_bright"
                value={getAceValue()}
                onChange={e => aceValueChange(e)}
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
        <Modal
          maskClosable={false}
          width={500}
          visible={statusVisible}
          onCancel={() => {
            setStatusVisible(false);
            clearTimeout(statusVisible);
          }}
          footer={null}
          title="题目状态"
        >
          <Table dataSource={status} pagination={false}>
            <Column
              title="ID"
              key="id"
              dataIndex="id"
              render={(text, record, index) => (
                <span>{parseInt(index) + 1}</span>
              )}
            />
            <Column
              title="编译状态"
              key="status"
              dataIndex="status"
              render={text => <Tag color={compileColor[text]}>{text}</Tag>}
            />
            <Column title="编译错误问题" key="errMsg" dataIndex="errMsg" />
          </Table>
        </Modal>
      </div>
    </Spin>
  );
};

export default ProgramTopic;
