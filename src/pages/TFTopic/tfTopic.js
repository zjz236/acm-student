import React from 'react';
import './tfTopic.scss';
import { Card, Spin, Radio, Button, Modal, message } from 'antd';
import exam from '@/api/exam';
import { examStatus } from '@/common/common';
import topic from '@/api/topic';
import operation from '@/api/operation';
import store from '@/store';

const { Group: RadioGroup } = Radio;

class TFTopic extends React.Component {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      examId: params.examId,
      disabled: true,
      topicData: [],
      loading: false,
      answer: [],
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
      const { data: { topicData, answer } } = await topic.getTopicInfo({ examId, topicType: 'examTFTopic' });
      this.setState({ topicData, answer, loading: false });
    } catch (e) {
      console.error(e);
      this.setState({ loading: false });
    }
  };

  radioChange = (value, topicId) => {
    const { answer } = this.state;
    const index = answer.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      answer[index].answer = value;
    } else {
      answer.push({
        topicId, answer: value,
      });
    }
    this.setState({ answer });
  };

  getRadioValue = (topicId) => {
    const { answer } = this.state;
    const index = answer.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      return answer[index].answer;
    } else {
      return null;
    }
  };

  getTopicCard = () => {
    const { topicData, disabled, answer } = this.state;
    const topicEl = [];
    for (const index in topicData) {
      const item = topicData[index];
      let score = '';
      const i = answer.map(it => it.topicId).indexOf(item._id);
      if (item.grade) {
        score = answer[i] && answer[i].result ?  + '2分' : '0分';
      }
      topicEl.push(
        <Card style={{ marginBottom: 15 }} size="small" key={item._id}
              title={<section><span
                className="ant-card-head-title"
                style={{ marginRight: 20, padding: 0 }}>{`第${parseInt(index) + 1}题 (2分)`}</span>
                <span style={{ color: 'red', padding: 0 }}
                      className="ant-card-head-title">{score ? score : ''}</span>
              </section>}
              extra={<RadioGroup disabled={disabled} value={this.getRadioValue(item._id)}
                                 onChange={(e) => this.radioChange(e.target.value, item._id)}>
                <Radio value={true}>正确</Radio>
                <Radio value={false}>错误</Radio>
              </RadioGroup>}>
          <div dangerouslySetInnerHTML={{ __html: item.description }}/>
        </Card>,
      );
    }
    return topicEl;
  };
  submit = () => {
    const { answer, topicData } = this.state;
    const surplus = topicData.length - answer.length;
    if (!surplus) return this.topicSubmit();
    Modal.confirm({
      content: `您还差${surplus}题没填，确认是否提交？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => this.topicSubmit(),
    });
  };
  topicSubmit = async () => {
    const { answer, examId } = this.state;
    await this.setState({
      loading: true,
    });
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
      this.setState({
        loading: false,
      });
    }
  };

  render() {
    const { loading, disabled } = this.state;
    return (
      <Spin spinning={loading}>
        <div className="tf-topic">
          <h1>判断题</h1>
          {this.getTopicCard()}
          <div className="submit">
            <Button onClick={this.submit} disabled={disabled} type="primary">提交</Button>
          </div>
        </div>
      </Spin>
    );
  }
}

export default TFTopic;
