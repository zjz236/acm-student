import React from 'react'
import './login.scss'
import {Form,Input,Icon,Button,Modal} from "antd";
import ajaxService from "../../utils/ajaxService";
import {getAllTime, getExamStatus} from "../../utils/commonUtil";

const FormItem = Form.Item

class login extends React.Component {
    constructor(props) {
        super(props)
        const {id} = props.match.params || {};
        this.state = {
            examId:id,
            examStatus: {}
        }
    }

    componentDidMount() {
        this.getExamStatus()
    }
    handleSubmit=(e)=>{
        e.preventDefault()
        this.props.form.validateFields((err,values)=>{
            if (!err){
                if (this.state.examStatus.isTest===1&&getExamStatus(this.state.examStatus.start,this.state.examStatus.finish)==='starting'){
                    Modal.confirm({
                        title:'Please confirm',
                        content:'You will now take an exam and will not be able to change your computer after logging in.',
                        onOk:()=>{
                            this.loginExam(values)
                        }
                    })
                }else{
                    this.loginExam(values)
                }
            }
        })
    }
    loginExam=(values)=>{
        let {examId}=this.state
        let {username,password}=values
        ajaxService.examLogin({examId,username,password}).then(res=>{
            if (res.code===1){
                this.props.history.push('/exam/examInfo/'+this.state.examId)
            }
        })
    }
    getExamStatus = () => {
        ajaxService.getExamStatus({examId: this.state.examId}).then(res => {
            if (res.code === 1) {
                this.setState({
                    examStatus: res.data
                })
            }
        }).catch(res => {
            this.props.history.replace('/examList')
        })
    }

    render() {
        const {examStatus} = this.state
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="login">
                <h1>{examStatus.name}</h1>
                <div
                    className="exam-status">{`holder:${examStatus.holder} | start time:${getAllTime(examStatus.start)} | finish time:${getAllTime(examStatus.finish)} | type:${examStatus.isTest ? 'exam' : 'exercise'} | status:`}
                    <span
                        className={getExamStatus(examStatus.start, examStatus.finish)}>{getExamStatus(examStatus.start, examStatus.finish)}</span>
                </div>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem>
                        {getFieldDecorator('username', {
                            rules: [{ required: true, message: 'Please input your username!' }],
                        })(
                            <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Username"
                            />,
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: 'Please input your Password!' }],
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="Password"
                            />,
                        )}
                    </FormItem>
                    <FormItem>
                        <Button  type="primary" htmlType="submit" className="login-form-button">login</Button>
                    </FormItem>
                </Form>
            </div>
        )
    }
}
const WrappedHorizontalLoginForm = Form.create({ name: 'horizontal_login' })(login)
export default WrappedHorizontalLoginForm
