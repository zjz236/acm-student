import React, { useEffect, useState } from 'react';
import './topicList.less';
import exam from '@/api/exam';
import topic from '@/api/topic';
import { Badge, Table } from 'antd';
import { badgeColor, examStatus } from '@/common/common';
import { Link } from 'umi';
import moment from 'moment';
import store from '@/store';

const { Column } = Table;
const topicType = {
  tfTopic: '判断题',
  selectTopic: '选择题',
  gapTopic: '程序填空题',
  programTopic: '程序设计题',
};

const TopicList = props => {
  const {
    match: { params },
  } = props;
  const [examId] = useState(params.examId);
  const [topicList, setTopicList] = useState([]);
  const [examInfo, setExamInfo] = useState({});
  const status = examInfo
    ? examStatus(examInfo.startTime, examInfo.finishTime)
    : '';
  useEffect(() => {
    getExamInfo();
    getTopicList();
  }, []);
  /**
   * 获取题目列表
   * @returns {Promise<void>}
   */
  const getTopicList = async () => {
    try {
      const { data } = await topic.getTopicList({ examId });
      setTopicList([...data]);
    } catch (e) {
      console.error(e);
    }
  };
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
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="topic-list">
      <Badge
        count={status}
        style={{ backgroundColor: badgeColor[status] || 'red' }}
      >
        <h1 className="examName">{examInfo ? examInfo.examName : ''}</h1>
      </Badge>
      <div className="status">
        <span>
          开始时间：
          {examInfo
            ? moment(examInfo.startTime).format('YYYY年MM月DD日 HH:mm:ss')
            : ''}
        </span>
        <span>
          结束时间：
          {examInfo
            ? moment(examInfo.finishTime).format('YYYY年MM月DD日 HH:mm:ss')
            : ''}
        </span>
      </div>
      <Table dataSource={topicList} rowKey="type" pagination={false}>
        <Column
          align="center"
          title="题目类型"
          key="type"
          dataIndex="type"
          render={(text, record) => (
            <Link to={`/exam/${text}/${examId}`}>{topicType[text]}</Link>
          )}
        />
        <Column
          align="center"
          title="题目数量"
          data="topicCount"
          dataIndex="topicCount"
        />
        <Column
          align="center"
          title="完成数量"
          data="answerCount"
          dataIndex="answerCount"
        />
      </Table>
    </div>
  );
};

export default TopicList;
