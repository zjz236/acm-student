import React from 'react'
import './gap.scss'
import ajaxService from "../../utils/ajaxService";
import {Button, Modal, Input, message} from "antd";

class select extends React.Component {
    constructor(props) {
        super(props)
        const {id} = props.match.params || {};
        this.state = {
            examId: id,
            answer: [],
            gapDom: [],
            gapId: '',
            code: '',
        }
    }

    componentDidMount() {
        this.getExamGap()
    }

    getExamGap = () => {
        const {examId} = this.state
        let answer = []
        ajaxService.getExamGap({examId}).then(res => {
            if (res.code === 1) {
                for (let i = 0; i < res.data.length; i++) {
                    let data = res.data[i]
                    answer.push({
                        gapId: data.Id,
                        answer: data.as === null ? new Array(data.num) : data.as.split('<{>}')
                    })
                }
                this.setState({
                    answer,
                    gapDom: res.data,
                    modalShoe: false
                })
            }
        })
    }
    gapChange = (value, index, i) => {
        let {answer} = this.state
        answer[index].answer[i] = value.target.value
        this.setState({
            answer
        })
    }
    gapDom = (num, index) => {
        let dom = []
        let {answer} = this.state
        for (let i = 0; i < num; i++) {
            dom.push(<div className="gap" key={i}><label>填空{i + 1}</label><Input
                onChange={(value) => this.gapChange(value, index, i)} key={i} value={answer[index].answer[i]}/></div>)
        }
        return dom
    }
    submitGap = (index, gapId) => {
        let {answer, examId} = this.state
        let as = answer[index].answer
        let an = as.join('<{>}')
        ajaxService.submitGap({examId, answer: an, gapId}).then(res => {
            if (res.code === 1) {
                message.success('提交成功')
                this.getExamGap()
            }
        })

    }
    dataShow = (index) => {
        let {answer, gapDom} = this.state
        let code = gapDom[index].code
        console.log(answer)
        for (let i = 0; i < answer[index].answer.length; i++) {
            let as = answer[index].answer[i]
            code = code.replace(`_(${i + 1})_`, as)
        }
        this.setState({
            code,
            modalShow: true
        })
    }
    getGapDom = () => {
        const {gapDom} = this.state
        let dom = []
        for (let i = 0; i < gapDom.length; i++) {
            let data = gapDom[i]
            dom.push(<div className="gap-list" key={data.Id}>
                <span className="id">{i + 1}.({data.num * 2}分)</span>
                <div className="description" dangerouslySetInnerHTML={{__html: data.description}}>
                </div>
                <pre className="description">
                    {data.code}
                </pre>
                <div className="gaps">
                    {this.gapDom(data.num, i)}
                </div>
                <div className="button"><Button className="read" onClick={() => this.dataShow(i)}>查看代码</Button><Button
                    onClick={() => this.submitGap(i, data.Id)} className="submit">提交</Button></div>
            </div>)
        }
        return dom
    }

    render() {
        let {modalShow, code} = this.state
        return (<div className='gap'>
            <h1>填空题</h1>
            <div className="gap-dom">
                {this.getGapDom()}
            </div>
            <Modal onCancel={() => this.setState({modalShow: false})} width={700} visible={modalShow} footer={null}
                   title={null}>
                <pre>{code}</pre>
            </Modal>
        </div>)
    }
}

export default select
