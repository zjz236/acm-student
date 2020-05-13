import React, { useEffect, useState } from 'react';
import store from '@/store';
import exam from '@/api/exam';
import './userModify.less';
import { Form, Input, Icon, Button, message } from 'antd';
import { JSEncrypt } from 'jsencrypt';
import account from '@/api/account';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const UserModify = props => {
  const {
    match: { params },
  } = props;
  const [confirmDirty, setConfirmDirty] = useState(false);
  const [examId] = useState(params.examId);
  const [, setExamInfo] = useState({});
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
      userPasswordModify(value, data);
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * 修改密码
   * @param val
   * @returns {Promise<void>}
   */
  const userPasswordModify = async (val, publicKey) => {
    try {
      const encrypt = new JSEncrypt();
      encrypt.setPublicKey(publicKey);
      for (const index in val) {
        val[index] = encrypt.encrypt(val[index]);
      }
      await account.userPasswordModify({
        ...val,
        examId,
        publicKey,
      });
      message.success('修改成功');
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * 输入框验证
   * @param e
   */
  const handleConfirmBlur = e => {
    const { value } = e.target;
    setConfirmDirty(confirmDirty || !!value);
  };
  /**
   * 提交
   * @param values
   */
  const handleSubmit = values => {
    getPublicKey(values);
  };
  return (
    <div className="user-modify">
      <Form
        {...layout}
        style={{ width: 300 }}
        onFinish={handleSubmit}
        className="login-form"
      >
        <Form.Item
          label="原密码"
          name="oldPassword"
          rules={[{ required: true, message: '原密码不能为空' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="请输入原密码"
          />
        </Form.Item>
        <Form.Item
          label="新密码"
          name="newPassword"
          rules={[{ required: true, message: '新密码不能为空' }]}
        >
          <Input
            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="请输入新密码"
          />
        </Form.Item>
        <Form.Item
          label="再次输入"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '再次输入不能为空' },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('两次密码不同');
              },
            }),
          ]}
        >
          <Input
            prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="再次输入新密码"
            onBlur={handleConfirmBlur}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            修改
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserModify;
