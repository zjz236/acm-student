import React from 'react'
import './editInfo.scss'
import {Button, Form, Input,message} from "antd";
import ajaxService from "../../utils/ajaxService";
const FormItem=Form.Item
class editInfo extends React.Component{
    constructor(props){
        super(props)
        const {id} = props.match.params || {};
        this.state={
            confirmDirty: false,
            examId:id,
        }
    }
    handleSubmit=(e)=>{
        e.preventDefault()
        this.props.form.validateFields((err,values)=>{
            if (!err){
                ajaxService.editStudentPwd({...values,examId:this.state.examId}).then(res=>{
                    if (res.code===1){
                        message.success(res.msg)
                        this.props.form.resetFields()
                    }
                })
            }
        })
    }
    handleConfirmBlur = e => {
        const { value } = e.target;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    };
    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback('两次密码不对');
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && this.state.confirmDirty) {
            form.validateFields(['checkPassword'], { force: true });
        }
        callback();
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout={
            labelCol: { span: 8 },
            wrapperCol: { span: 16 },
        }
        return (<div className='edit-info'>
            <Form layout={'horizontal'} {...formItemLayout}  onSubmit={this.handleSubmit}>
                <FormItem label='旧密码'>{getFieldDecorator('oldPassword', {
                    rules: [{ required: true, message: '请输入旧密码' }],
                })(
                    <Input.Password
                        type="password"
                        placeholder="请输入旧密码"
                    />,
                )}
                </FormItem>
                <FormItem label='新密码'>{getFieldDecorator('password', {
                    rules: [{ required: true, message: '请输入新密码' },
                        {validator:this.validateToNextPassword}],
                })(
                    <Input.Password
                        type="password"
                        placeholder="请输入新密码"
                    />,
                )}
                </FormItem>
                <FormItem label='确认密码'>{getFieldDecorator('checkPassword', {
                    rules: [{ required: true, message: '请确认密码' },
                        {validator:this.compareToFirstPassword}],
                })(
                    <Input.Password
                        type="password"
                        placeholder="请确认密码"
                        onBlur={this.handleConfirmBlur}
                    />,
                )}
                </FormItem>
                <FormItem {...formItemLayout}>
                    <Button  type="primary" htmlType="submit" className="login-form-button">修改</Button>
                </FormItem>
            </Form>
        </div>)
    }
}
const WrappedHorizontalLoginForm = Form.create({ name: 'editInfo' })(editInfo)
export default WrappedHorizontalLoginForm
