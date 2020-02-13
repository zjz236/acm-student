import React from 'react';
import exam from '@/api/exam';
import { Badge, Form, Icon, Input, Button } from 'antd';
import { badgeColor, examStatus } from '@/common/common';
import account from '@/api/account';
import { JSEncrypt } from 'jsencrypt';
import router from 'umi/router';
import './login.scss';
import moment from 'moment';
import store from '@/store';

class Login extends React.Component {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      examId: params.examId,
      examInfo: {},
      publicKey: '',
    };
  }

  componentDidMount() {
    this.getExamInfo();
    this.getPublicKey();
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
      });
    } catch (e) {
      console.error(e);
    }
  }

  getPublicKey = async () => {
    try {
      const { data } = await account.getPublicKey();
      this.setState({
        publicKey: data,
      });
    } catch (e) {
      console.error(e);
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.login(values);
      }
    });
  };

  login = async (val) => {
    try {
      const { publicKey, examId } = this.state;
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      val.password = encrypt.encrypt(val.password);
      await account.login({
        ...val,
        examId,
      });
      router.push('/exam/topicList/' + examId);
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const { examInfo } = this.state;
    const { getFieldDecorator } = this.props.form;
    const status = examInfo ? examStatus(examInfo.startTime, examInfo.finishTime) : '';
    return (
      <div className="login">
        <Badge count={status} style={{ backgroundColor: badgeColor[status] || 'red' }}>
          <h1 className="examName">{examInfo ? examInfo.examName : ''}</h1>
        </Badge>
        <div className="status">
          <span>开始时间：{examInfo ? moment(examInfo.startTime).format('YYYY年MM月DD日 HH:mm:ss') : ''}</span>
          <span>结束时间：{examInfo ? moment(examInfo.finishTime).format('YYYY年MM月DD日 HH:mm:ss') : ''}</span>
        </div>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{ required: true, message: '请输入用户名' }],
            })(
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
                placeholder="用户名"
              />,
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{ required: true, message: '请输入密码' }],
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
                type="password"
                placeholder="密码"
              />,
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(Login);

export default WrappedNormalLoginForm;
