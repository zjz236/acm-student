import React, { useEffect, useState } from 'react';
import './tfTopic.less';
import { Card, Spin, Radio, Button, Modal, message } from 'antd';
import exam from '@/api/exam';
import { examStatus } from '@/common/common';
import topic from '@/api/topic';
import operation from '@/api/operation';
import store from '@/store';

const { Group: RadioGroup } = Radio;
const TFTopic = props => {
  const {
    match: { params },
  } = props;
  const [examId] = useState(params.examId);
  const [disabled, setDisabled] = useState(true);
  const [topicData, setTopicData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState([]);
  const [examInfo, setExamInfo] = useState({});
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
   * 获取题目信息
   * @returns {Promise<void>}
   */
  const getTopicInfo = async () => {
    await setLoading(true);
    try {
      const {
        data: { topicData, answer },
      } = await topic.getTopicInfo({ examId, topicType: 'examTFTopic' });
      setTopicData(topicData);
      setAnswer(answer);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };
  /**
   * 获取选项
   * @param topicId
   * @returns {[]|[{topicId: *, answer: Array | *[]}]|null}
   */
  const getRadioValue = topicId => {
    const index = answer.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      return answer[index].answer;
    } else {
      return null;
    }
  };
  /**
   * 修改选项
   * @param value
   * @param topicId
   */
  const radioChange = (value, topicId) => {
    const index = answer.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      answer[index].answer = value;
    } else {
      answer.push({
        topicId,
        answer: value,
      });
    }
    setAnswer(answer.slice());
  };
  /**
   * 获取题目卡片dom
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
        score = answer[i] && answer[i].result ? +'2分' : '0分';
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
                style={{ marginRight: 20, padding: 0 }}
              >{`第${parseInt(index) + 1}题 (2分)`}</span>
              <span
                style={{ color: 'red', padding: 0 }}
                className="ant-card-head-title"
              >
                {score ? score : ''}
              </span>
            </section>
          }
          extra={
            <RadioGroup
              disabled={disabled}
              value={getRadioValue(item._id)}
              onChange={e => radioChange(e.target.value, item._id)}
            >
              <Radio value={true}>正确</Radio>
              <Radio value={false}>错误</Radio>
            </RadioGroup>
          }
        >
          <div dangerouslySetInnerHTML={{ __html: item.description }} />
        </Card>,
      );
    }
    return topicEl;
  };
  /**
   * 提交确认
   * @returns {Promise<void>}
   */
  const submit = () => {
    const surplus = topicData.length - answer.length;
    if (!surplus) return topicSubmit();
    Modal.confirm({
      content: `您还差${surplus}题没填，确认是否提交？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => topicSubmit(),
    });
  };
  /**
   * 题目提交
   * @returns {Promise<void>}
   */
  const topicSubmit = async () => {
    await setLoading(true);
    try {
      await operation.topicSubmit({
        topicType: 'examTFAnswer',
        examId,
        answer,
      });
      message.success('提交成功');
    } catch (e) {
      console.error(e);
    } finally {
      await setLoading(false);
    }
  };
  return (
    <Spin spinning={loading}>
      <div className="tf-topic">
        <h1>判断题</h1>
        {getTopicCard()}
        <div className="submit">
          <Button onClick={submit} disabled={disabled} type="primary">
            提交
          </Button>
        </div>
      </div>
    </Spin>
  );
};

export default TFTopic;
