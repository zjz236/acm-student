import React from 'react';
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
class UserModify extends React.Component {
  constructor(props) {
    super(props);
    const {
      match: { params },
    } = props;
    this.state = {
      confirmDirty: false,
      examId: params.examId,
      publicKey: '',
    };
  }

  componentDidMount() {
    this.getExamInfo();
  }

  getPublicKey = async value => {
    try {
      const { data } = await account.getPublicKey();
      await this.setState({
        publicKey: data,
      });
      this.userPasswordModify(value);
    } catch (e) {
      console.error(e);
    }
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('newPassword')) {
      callback('两次密码不同');
    } else {
      callback();
    }
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirmPassword'], { force: true });
    }
    callback();
  };

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
  };
  handleSubmit = values => {
    this.getPublicKey(values);
  };
  userPasswordModify = async val => {
    try {
      const { publicKey, examId } = this.state;
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

  render() {
    return (
      <div className="user-modify">
        <Form
          {...layout}
          style={{ width: 300 }}
          onFinish={this.handleSubmit}
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
              onBlur={this.handleConfirmBlur}
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
  }
}

export default UserModify;
