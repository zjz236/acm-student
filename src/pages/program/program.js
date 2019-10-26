import React from 'react'
import './program.scss'
import {Button, Modal, Input, Table} from "antd";
import ajaxService from "../../utils/ajaxService";
import {getExamStatus, getProgramScore, getProgramStatus} from "../../utils/commonUtil";

const {TextArea} = Input
let timmer = null

class program extends React.Component {
    constructor(props) {
        super(props)
        const {id} = props.match.params || {};
        this.state = {
            examId: id,
            programDom: [],
            program: [],
            programId: '',
            programScore:'',
            programError:[],
            modalShow: false,
            examStatus:'',
            statusShow: false,
            columns: [
                {
                    title: 'Case Id',
                    dataIndex: 'case',
                    width:100,
                    render: (text, record, index) => {
                        return (<div>{record.case}</div>)
                    }
                },
                {
                    title: 'Result',
                    dataIndex: 'result',
                    width:160,
                    render: (text, record, index) => {
                        return (<div
                            className={getProgramStatus(record.status).className}>{getProgramStatus(record.status).content}</div>)
                    }
                },
                {
                    title: 'Score',
                    dataIndex: 'score',
                    width:130,
                    render: (text, record, index) => {
                        return (<div>{record.status === 1||record.status === 6 ? 10 : 0}</div>)
                    }
                },
            ],
            dataSource: []
        }
    }

    componentDidMount() {
        this.getExamProgram()
        this.getExamStatus()
    }

    getExamProgram = () => {
        ajaxService.getExamProgram({examId: this.state.examId}).then(res => {
            if (res.code === 1) {
                this.programDomInsert(res.data)
            }
        })
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
    getProgramStatus = (id) => {
        const {examId} = this.state
        let self = this
        timmer = setInterval(function () {
            ajaxService.getProgramStatus({examId, programId: id}).then(res => {
                if (res.code === 1) {
                    let score=0
                    let error=[]
                    for(let i=0;i<res.data.length;i++){
                        if (res.data[i].status===1||res.data[i].status===6) score+=10
                        if(res.data[i].status===5) error.push('Error:'+res.data[i].result)
                    }
                    self.setState({
                        dataSource: res.data,
                        statusShow: true,
                        programScore:score,
                        programError:error
                    })

                    if (res.msg === 'success') clearInterval(timmer)
                }
            })
        }, 1000)
    }
    codeInput = ({target: {value}}, index) => {
        let code = this.state.program
        code[index].answer = value
        this.setState({
            program: code
        })
    }
    programDomInsert = async (datas) => {
        let dom = []
        let program = datas
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i]
            console.log(data)
            dom.push(<div className='program-list' key={data.Id}>
                <div className="title">{data.title}</div>
                <span className="small-title">题目描述</span>
                <div className="description" dangerouslySetInnerHTML={{__html: data.description}}>
                </div>
                <span className="small-title">输入描述</span>
                <div className="description" dangerouslySetInnerHTML={{__html: data.inputDes}}>
                </div>
                <span className="small-title">输出描述</span>
                <div className="description" dangerouslySetInnerHTML={{__html: data.outputDes}}>
                </div>
                <span className="small-title">样例输入</span>
                <div className="description"
                     dangerouslySetInnerHTML={{__html: data.sampleInput.replace(/[\n\r]/g, '<br>')}}>
                </div>
                <span className="small-title">样例输出</span>
                <div className="description">
                    {data.sampleOutput}
                </div>
                {data.score.length>0&&(<div className="score">Accuracy:{getProgramScore(data.score).trueNum} Total Score:{getProgramScore(data.score).score}</div>)}
                <div className="button">{data.answer && (<Button className='read'
                                                                 onClick={async () => {
                                                                     await this.setState({programId: data.Id});
                                                                     this.getProgramStatus(data.Id);
                                                                 }}>查看状态</Button>)}
                    <Button className='input'
                            onClick={() => this.setState({modalShow: true, programId: data.Id})}>输入代码</Button>
                </div>
            </div>)
        }
        await this.setState({programDom: dom, program})
    }
    codeSubmit =(index) => {
        const {program, examId} = this.state
        ajaxService.submitProgram({programId: program[index].Id, examId, answer: program[index].answer}).then(res => {
            if (res.code === 1) {
                this.setState({
                    modalShow: false
                })
                this.getProgramStatus(program[index].Id)
            }
        })
    }
    cancelStatus=()=>{
        this.setState({statusShow: false})
        clearInterval(timmer)
    }
    render() {
        const {programDom, statusShow, modalShow, program, programId, columns, dataSource,programScore,programError} = this.state
        let index = 0
        for (let i = 0; i < program.length; i++) {
            if (program[i].Id === programId) {
                index = i
            }
        }
        return (<div className="program">
            <h1>程序设计题</h1>
            <div className="program-dom">
                {programDom}
            </div>
            <Modal width={900} visible={modalShow} onCancel={() => this.setState({modalShow: false})}
                   footer={[
                       this.state.examStatus==='starting'?<Button key="submit" type="primary" onClick={() => this.codeSubmit(index)}>
                           提交
                       </Button>:<div></div>,
                   ]}
                   title={program[index] ? program[index].title : ''}>
                <TextArea disabled={this.state.examStatus!=='starting'} placeholder="请输入代码" autosize={{minRows: 10, maxRows: 10}}
                          onChange={(e) => this.codeInput(e, index)}
                          value={program[index] ? (program[index].answer ? program[index].answer : '') : ''}/>
            </Modal>
            <Modal className="exam-status" footer={null} title={program[index] ? program[index].title : ''}
                   visible={statusShow} onCancel={this.cancelStatus}>
                <div className="status-title">RUN RESULT OF YOUR CODE</div>
                <Table rowKey="case" pagination={false} columns={columns} dataSource={dataSource}></Table>
                <div className="score">{'Total Score:'+programScore}</div>
                <div className="err-content" dangerouslySetInnerHTML={{__html:programError.join('<br>')}}></div>
            </Modal>
        </div>)
    }
}

export default program
