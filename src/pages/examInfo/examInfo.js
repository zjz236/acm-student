import React from 'react'
import './examInfo.scss'
import {Table} from "antd";
import ajaxService from "../../utils/ajaxService";
import {getAllTime, getExamStatus} from "../../utils/commonUtil";
class examInfo extends React.Component {
    constructor(props){
        super(props)
        const {id} = props.match.params || {};
        this.state = {
            examId:id,
            examStatus: {},
            dataSource:[],
            columns:[
                {
                    title: 'Question Type',
                    dataIndex: 'type',
                    key: 'type',
                    width: 200,
                    render:(text,record,index)=>{
                        return (<a href={`/exam/${text}/${id}`}>{text}</a>)
                    },
                    align: 'center'
                },
                {
                    title: 'Question Number',
                    dataIndex: 'num',
                    key: 'num',
                    width: 200,
                    align: 'center'
                },
                {
                    title: 'Quantity Completion',
                    dataIndex: 'complete',
                    key: 'complete',
                    width: 200,
                    align: 'center'
                }
            ]
        }
    }
    componentDidMount() {
        this.getExamStatus()
        this.getExamTopic()
    }
    getExamTopic=()=>{
        ajaxService.getExamTopic({examId:this.state.examId}).then(res=>{
            if (res.code===1){
                this.setState({
                    dataSource:res.data
                })
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
            this.props.history.replace('/')
        })
    }
    render() {
        const {examStatus} = this.state
        return (
            <div className="exam-info">
                <h1>{examStatus.name}</h1>
                <div
                    className="exam-status">{`holder:${examStatus.holder} | start time:${getAllTime(examStatus.start)} | finish time:${getAllTime(examStatus.finish)} | type:${examStatus.isTest ? 'exam' : 'exercise'} | status:`}
                    <span
                        className={getExamStatus(examStatus.start, examStatus.finish)}>{getExamStatus(examStatus.start, examStatus.finish)}</span>
                </div>
                <Table columns={this.state.columns} pagination={false} rowKey="type"
                       dataSource={this.state.dataSource}>

                </Table>
            </div>
        )
    }
}

export default examInfo
