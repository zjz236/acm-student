import React from 'react';
import store from '@/store';
import exam from '@/api/exam';
import './userModify.scss';
import { Form, Input, Icon, Button, message } from 'antd';
import { JSEncrypt } from 'jsencrypt';
import account from '@/api/account';

class UserModify extends React.Component {
  constructor(props) {
    super(props);
    const { match: { params } } = props;
    this.state = {
      confirmDirty: false,
      examId: params.examId,
      publicKey: '',
    };
  }

  componentDidMount() {
    this.getExamInfo();
    this.getPublicKey();
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
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.userPasswordModify(values)
      }
    });
  };
  userPasswordModify = async (val) => {
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
      });
      message.success('修改成功')
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (<div className="user-modify">
      <Form style={{ width: 300 }} onSubmit={this.handleSubmit} className="login-form">
        <Form.Item label="原密码">
          {getFieldDecorator('oldPassword', {
            rules: [{ required: true, message: '原密码不能为空' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
              placeholder="请输入原密码"
            />,
          )}
        </Form.Item>
        <Form.Item label="新密码">
          {getFieldDecorator('newPassword', {
            rules: [{ required: true, message: '新密码不能为空' },
              {
                validator: this.validateToNextPassword,
              }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
              type="password"
              placeholder="请输入新密码"
            />,
          )}
        </Form.Item>
        <Form.Item label="再次输入">
          {getFieldDecorator('confirmPassword', {
            rules: [{ required: true, message: '再次输入不能为空' },
              {
                validator: this.compareToFirstPassword,
              }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }}/>}
              type="password"
              placeholder="再次输入新密码"
              onBlur={this.handleConfirmBlur}
            />,
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button">
            修改
          </Button>
        </Form.Item>
      </Form>
    </div>);
  }
}

const WrappedNormalUserForm = Form.create({ name: 'normal_user' })(UserModify);

export default WrappedNormalUserForm;
