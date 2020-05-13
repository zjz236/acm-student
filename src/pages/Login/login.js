import React, { useEffect, useState } from 'react';
import exam from '@/api/exam';
import { Badge, Form, Input, Button } from 'antd';
import { badgeColor, examStatus } from '@/common/common';
import account from '@/api/account';
import { JSEncrypt } from 'jsencrypt';
import { history } from 'umi';
import './login.less';
import moment from 'moment';
import store from '@/store';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const Login = props => {
  const {
    match: { params },
  } = props;
  const [examId] = useState(params.examId);
  const [examInfo, setExamInfo] = useState({});
  const status = examInfo
    ? examStatus(examInfo.startTime, examInfo.finishTime)
    : '';
  useEffect(() => {
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
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * 获取公钥
   * @param value
   * @returns {Promise<void>}
   */
  const getPublicKey = async value => {
    try {
      const { data } = await account.getPublicKey();
      login(value, data);
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * 提交
   * @param values
   */
  const handleSubmit = values => {
    getPublicKey(values);
  };
  /**
   * 登录
   * @param val
   * @returns {Promise<void>}
   */
  const login = async (val, publicKey) => {
    try {
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      val.password = encrypt.encrypt(val.password);
      await account.login({
        ...val,
        examId,
        publicKey,
      });
      history.push('/exam/topicList/' + examId);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div className="login">
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
      <Form onFinish={handleSubmit} className="login-form">
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="用户名"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input
            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="密码"
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
