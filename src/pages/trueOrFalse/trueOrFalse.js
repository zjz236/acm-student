import React from 'react'
import './trueOrFalse.scss'
import ajaxService from "../../utils/ajaxService";
import {Radio,Button,Modal,message} from "antd";

const RadioGroup = Radio.Group

class trueOrFalse extends React.Component {
    constructor(props) {
        super(props)
        const {id} = props.match.params || {};
        this.state = {
            examId: id,
            tfDom: [],
            answer: [],
        }
    }

    componentDidMount() {
        this.getExamTF()
    }

    getExamTF = () => {
        ajaxService.getExamTF({examId: this.state.examId}).then(res => {
            if (res.code === 1) {
                let answer = []
                for (let i = 0; i < res.data.length; i++) {
                    let data = res.data[i]
                    answer.push({tfId:data.Id,answer:data.as})
                }
                this.setState({
                    tfDom: res.data,
                    answer
                })
            }
        })
    }
    answerChange = (value, index) => {
        let {answer} = this.state
        answer[index].answer = value.target.value
        this.setState({
            answer,
        })
    }
    handleSubmit=()=>{
        let {answer}=this.state
        for(let i=0;i<answer.length;i++){
            if (answer[i].answer!==1&&answer[i].answer!==0){
                Modal.confirm({
                    title:'确认是否提交',
                    content:`您的第${i+1}题未做，是否确认提交。`,
                    okText:'确认',
                    cancelText:'取消',
                    onOk:()=>this.submitTF()
                })
                return
            }
        }
        this.submitTF()
    }
    submitTF=()=>{
        let {answer,examId}=this.state
        ajaxService.submitTF({examId,answer}).then(res=>{
            if (res.code===1){
                message.success('提交成功')
                this.getExamTF()
            }
        })

    }
    getTFDom = () => {
        let dom = []
        let {tfDom} = this.state
        for (let i = 0; i < tfDom.length; i++) {
            let data = tfDom[i]
            dom.push(<div className="tf-list" key={data.Id}>
                <span className="id">{i + 1}.<br/>2分</span>
                <div className="tf-content" dangerouslySetInnerHTML={{__html: data.description}}>
                </div>
                <RadioGroup onChange={(value) => this.answerChange(value, i)} value={this.state.answer[i].answer}><Radio
                    value={1}>正确</Radio><Radio value={0}>错误</Radio></RadioGroup>
            </div>)
        }
        return dom
    }

    render() {
        //const {}=this.state
        return (<div className="true-false">
            <h1>判断题</h1>
            <div className="tf-dom">
                {this.getTFDom()}
            </div>
            <div className="button">
                <Button type='primary' onClick={this.handleSubmit}>提交</Button>
            </div>
        </div>)
    }
}

export default trueOrFalse
