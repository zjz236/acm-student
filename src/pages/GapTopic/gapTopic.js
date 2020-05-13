import React, { useEffect, useState } from 'react';
import './gapTopic.less';
import { Card, Spin, Button, message, Divider, Input } from 'antd';
import exam from '@/api/exam';
import { examStatus, gapCodeShow, languageMode } from '@/common/common';
import topic from '@/api/topic';
import operation from '@/api/operation';
import AceEditor from 'react-ace';
import store from '@/store';

import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-tomorrow_night_bright';

const GapTopic = props => {
  const {
    match: { params },
  } = props;
  const [examInfo, setExamInfo] = useState({});
  const [examId] = useState(params.examId);
  const [disabled, setDisabled] = useState(true);
  const [topicData, setTopicData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState([]);
  const [allCode, setAllCode] = useState([]);
  useEffect(() => {
    getExamInfo();
    getTopicInfo();
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
   * 填充代码
   * @param topicId
   */
  const setAllCodeFunc = topicId => {
    const i = topicData.map(item => item._id).indexOf(topicId);
    const j = answer.map(item => item.topicId).indexOf(topicId);
    const code = gapCodeShow(topicData[i].code, answer[j].answer);
    const index = allCode.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      allCode[index].code = code;
      setAllCode(allCode);
    } else {
      allCode.push({
        topicId,
        code,
      });
      setAllCode(allCode);
    }
  };
  /**
   * 获取题目信息
   * @returns {Promise<void>}
   */
  const getTopicInfo = async () => {
    setLoading(true);
    try {
      const {
        data: { topicData, answer },
      } = await topic.getTopicInfo({ examId, topicType: 'examGapTopic' });
      setTopicData(topicData);
      setAnswer(answer);
      setLoading(false);
      topicData.forEach(item => {
        setAllCodeFunc(item._id);
      });
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };
  /**
   * 修改填空内容
   * @param value
   * @param topicId
   * @param index
   * @param gapLength
   * @returns {Promise<void>}
   */
  const gapChange = async (value, topicId, index, gapLength) => {
    const i = answer.map(item => item.topicId).indexOf(topicId);
    if (i >= 0) {
      answer[i].answer[index] = value;
    } else {
      const inputArray = new Array(gapLength);
      inputArray[index] = value;
      answer.push({
        topicId,
        answer: inputArray,
      });
    }
    setAnswer(answer.slice());
    setAllCodeFunc(topicId);
  };
  /**
   * 获取填空值
   * @param topicId
   * @param index
   * @returns {string|{topicId: *, answer: *[]}|*|{topicId: *, code: *}|{topicId: *, code: *}}
   */
  const getGapValue = (topicId, index) => {
    const i = answer.map(item => item.topicId).indexOf(topicId);
    if (i >= 0) {
      return answer[i].answer[index];
    } else {
      return '';
    }
  };
  /**
   * 填空输入框
   * @param gaps
   * @param topicId
   * @returns {[]}
   */
  const getGapEl = (gaps, topicId) => {
    const optionEl = [];
    optionEl.push();
    for (let index = 0; index < gaps; index++) {
      optionEl.push(
        <Input
          className="gap-input"
          disabled={disabled}
          value={getGapValue(topicId, index)}
          onChange={e => gapChange(e.target.value, topicId, index, gaps)}
          allowClear
          key={index}
          prefix={index + 1}
        />,
      );
    }
    return optionEl;
  };
  /**
   * 题目提交
   * @param topicId
   * @param gaps
   * @returns {Promise<void>}
   */
  const topicSubmit = async (topicId, gaps) => {
    const index = answer.map(item => item.topicId).indexOf(topicId);
    const value = index >= 0 ? answer[index].answer : new Array(gaps);
    setLoading(true);
    try {
      await operation.topicSubmit({
        topicType: 'examGapAnswer',
        examId,
        answer: [
          {
            topicId,
            answer: value,
          },
        ],
      });
      message.success('提交成功');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  /**
   * 获取完整代码
   * @param topicId
   * @returns {*}
   */
  const getAllCode = topicId => {
    const i = allCode.map(item => item.topicId).indexOf(topicId);
    const j = topicData.map(item => item._id).indexOf(topicId);
    if (i >= 0) {
      return allCode[i].code;
    } else {
      return topicData[j].code;
    }
  };
  /**
   * 获取卡片列表
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
      }
      topicEl.push(
        <Card
          style={{ marginBottom: 15 }}
          size="small"
          key={item._id}
          title={
            <section>
              <span
                className="ant-card-head-title"
                style={{
                  marginRight: 20,
                  padding: 0,
                }}
              >{`第${parseInt(index) + 1}题 (${parseInt(item.gaps) *
                2}分)`}</span>
              <span
                style={{ color: 'red', padding: 0 }}
                className="ant-card-head-title"
              >
                {score ? score : ''}
              </span>
            </section>
          }
          extra={
            <Button
              onClick={() => topicSubmit(item._id, item.gaps)}
              disabled={disabled}
              type="primary"
            >
              提交
            </Button>
          }
          actions={[
            <div className="gap-inputs">{getGapEl(item.gaps, item._id)}</div>,
          ]}
        >
          <div dangerouslySetInnerHTML={{ __html: item.description }} />
          <Divider orientation="left">代码</Divider>
          <div className="code">
            <div className="code-value">
              <h3>填空代码</h3>
              <AceEditor
                mode={languageMode[examInfo.language]}
                height="200px"
                value={item.code}
                theme="tomorrow_night_bright"
                name="ace"
                readOnly={true}
                editorProps={{ $blockScrolling: true }}
              />
            </div>
            <div className="code-value">
              <h3>完整代码</h3>
              <AceEditor
                mode={languageMode[examInfo.language]}
                height="200px"
                readOnly={true}
                value={getAllCode(item._id)}
                theme="tomorrow_night_bright"
                name="UNIQUE_ID_OF_DIV"
                editorProps={{ $blockScrolling: true }}
              />
            </div>
          </div>
        </Card>,
      );
    }
    return topicEl;
  };
  return (
    <Spin spinning={loading}>
      <div className="gap-topic">
        <h1>程序填空题</h1>
        {getTopicCard()}
      </div>
    </Spin>
  );
};

export default GapTopic;
