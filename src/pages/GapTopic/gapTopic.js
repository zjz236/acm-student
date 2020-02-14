import React from 'react';
import './gapTopic.scss';
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

class GapTopic extends React.Component {
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
      allCode: [],
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
      const { data: { topicData, answer } } = await topic.getTopicInfo({ examId, topicType: 'examGapTopic' });
      this.setState({ topicData, answer, loading: false });
      topicData.forEach(item => {
        this.setAllCode(item._id);
      });
    } catch (e) {
      console.error(e);
      this.setState({ loading: false });
    }
  };

  gapChange = async (value, topicId, index, gapLength) => {
    const { answer } = this.state;
    const i = answer.map(item => item.topicId).indexOf(topicId);
    if (i >= 0) {
      answer[i].answer[index] = value;
    } else {
      const inputArray = new Array(gapLength);
      inputArray[index] = value;
      answer.push({
        topicId, answer: inputArray,
      });
    }
    await this.setState({ answer });
    this.setAllCode(topicId);
  };

  getGapValue = (topicId, index) => {
    const { answer } = this.state;
    const i = answer.map(item => item.topicId).indexOf(topicId);
    if (i >= 0) {
      return answer[i].answer[index];
    } else {
      return '';
    }
  };

  getGapEl = (gaps, topicId) => {
    const { disabled } = this.state;
    const optionEl = [];
    optionEl.push();
    for (let index = 0; index < gaps; index++) {
      optionEl.push(
        <Input className="gap-input" disabled={disabled} value={this.getGapValue(topicId, index)}
               onChange={(e) => this.gapChange(e.target.value, topicId, index, gaps)} allowClear key={index}
               prefix={index + 1}/>,
      );
    }
    return optionEl;
  };

  setAllCode = (topicId) => {
    const { topicData, answer, allCode } = this.state;
    const i = topicData.map(item => item._id).indexOf(topicId);
    const j = answer.map(item => item.topicId).indexOf(topicId);
    const code = gapCodeShow(topicData[i].code, answer[j].answer);
    const index = allCode.map(item => item.topicId).indexOf(topicId);
    if (index >= 0) {
      allCode[index].code = code;
      this.setState({
        allCode,
      });
    } else {
      allCode.push({
        topicId, code,
      });
      this.setState({
        allCode,
      });
    }
  };

  getAllCode = (topicId) => {
    const { allCode, topicData } = this.state;
    const i = allCode.map(item => item.topicId).indexOf(topicId);
    const j = topicData.map(item => item._id).indexOf(topicId);
    if (i >= 0) {
      return allCode[i].code;
    } else {
      return topicData[j].code;
    }
  };

  getTopicCard = () => {
    const { topicData, disabled, examInfo, answer } = this.state;
    const topicEl = [];
    for (const index in topicData) {
      const item = topicData[index];
      let score = '';
      const i = answer.map(it => it.topicId).indexOf(item._id);
      if (item.grade) {
        score = answer[i] ? answer[i].score + '分' : '0分';
      }
      topicEl.push(
        <Card style={{ marginBottom: 15 }} size="small" key={item._id}
              title={<section><span
                className="ant-card-head-title"
                style={{
                  marginRight: 20,
                  padding: 0,
                }}>{`第${parseInt(index) + 1}题 (${parseInt(item.gaps) * 2}分)`}</span>
                <span style={{ color: 'red', padding: 0 }}
                      className="ant-card-head-title">{score ? score : ''}</span>
              </section>}
              extra={<Button onClick={() => this.topicSubmit(item._id, item.gaps)} disabled={disabled}
                             type="primary">提交</Button>}
              actions={[
                <div className="gap-inputs">{
                  this.getGapEl(item.gaps, item._id)
                }</div>,
              ]}>
          <div dangerouslySetInnerHTML={{ __html: item.description }}/>
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
                value={this.getAllCode(item._id)}
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
  topicSubmit = async (topicId, gaps) => {
    const { answer, examId } = this.state;
    const index = answer.map(item => item.topicId).indexOf(topicId);
    const value = index >= 0 ? answer[index].answer : new Array(gaps);
    await this.setState({
      loading: true,
    });
    try {
      await operation.topicSubmit({
        topicType: 'examGapAnswer',
        examId,
        answer: [{
          topicId,
          answer: value,
        }],
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
    const { loading } = this.state;
    return (
      <Spin spinning={loading}>
        <div className="gap-topic">
          <h1>程序填空题</h1>
          {this.getTopicCard()}
        </div>
      </Spin>
    );
  }
}

export default GapTopic;
