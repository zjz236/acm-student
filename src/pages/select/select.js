import React from 'react'
import './select.scss'
import ajaxService from "../../utils/ajaxService";
import {Button, Modal, Radio, message} from "antd";
import {getExamStatus} from "../../utils/commonUtil";
const RadioGroup=Radio.Group
class select extends React.Component{
    constructor(props){
        super(props)
        const {id} = props.match.params || {};
        this.state = {
            examId: id,
            answer:[],
            selectDom:[],
            examStatus:''
        }
    }
    componentDidMount() {
        this.getExamSelect()
        this.getExamStatus()
    }

    getExamStatus = () => {
        ajaxService.getExamStatus({examId: this.state.examId}).then(res => {
            if (res.code === 1) {
                this.setState({
                    examStatus: getExamStatus(res.data.start,res.data.finish)
                })
            }
        }).catch(res => {
            this.props.history.replace('/')
        })
    }
    getExamSelect=()=>{
        const {examId}=this.state
        let answer=[]
        ajaxService.getExamSelect({examId}).then(res=>{
              if (res.code===1){
                  for (let i=0;i<res.data.length;i++){
                      let data=res.data[i]
                      answer.push({selectId:data.Id,answer:data.as})
                  }
                  this.setState({
                      answer,
                      selectDom:res.data
                  })
              }
        })
    }
    optionDom=(option)=>{
        option=option.split('<{>}')
        let dom=[]
        for (let i=0;i<option.length;i++){
            dom.push(<Radio key={i} value={i}>{String.fromCharCode(i+65)+'.'+option[i]}</Radio>)
        }
        return dom
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
        ajaxService.submitSelect({examId,answer}).then(res=>{
            if (res.code===1){
                message.success('提交成功')
                this.getExamSelect()
            }
        })

    }
    getSelectDom=()=>{
        const {selectDom,answer}=this.state
        let dom=[]
        for (let i=0;i<selectDom.length;i++){
            let data=selectDom[i]
            dom.push(<div className="select-list" key={data.Id}>
                <span className="id">{i+1}.</span>
                <div className="select-content">
                    <div className="description" dangerouslySetInnerHTML={{__html:data.description}}>
                    </div>
                    <div className="option"><RadioGroup  disabled={this.state.examStatus!=='starting'} onChange={(value)=>this.answerChange(value,i)} value={answer[i].answer}>{this.optionDom(data.options)}</RadioGroup></div>
                    <br/>
                    {data.isTrue===0?(<p className="correct">正确答案:{String.fromCharCode(65+data.answer)},您的答案:{String.fromCharCode(65+data.as)}</p>):''}
                </div>
            </div>)
        }
        return dom
    }
    render() {
        return (<div className='select'>
            <h1>选择题</h1>
            <div className="select-dom">
                {this.getSelectDom()}
            </div>
            <div className="button">
                {this.state.examStatus==='starting'&&<Button type='primary' onClick={this.handleSubmit}>提交</Button>}
            </div>
        </div>)
    }
}
export default select
