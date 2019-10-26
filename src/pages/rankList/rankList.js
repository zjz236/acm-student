import React from 'react'
import './rankList.scss'
import {Table} from "antd";
import ajaxService from "../../utils/ajaxService";
const columns=[
    {
        key:'sort',
        dataIndex:'sort',
        title:'排名',
        align:'center',
        render:(text,record,index)=>(
            <div>{index+1}</div>
        )
    },
    {
        key:'username',
        dataIndex:'username',
        title:'账号',
        align:'center'
    },
    {
        key:'studentId',
        dataIndex:'studentId',
        title:'学号',
        align:'center'
    },
    {
        key:'name',
        dataIndex:'name',
        title:'姓名',
        align:'center'
    },
    {
        key:'school',
        dataIndex:'school',
        title:'学校',
        align:'center'
    },
    {
        key:'college',
        dataIndex:'college',
        title:'学院',
        align:'center'
    },
    {
        key:'major',
        dataIndex:'major',
        title:'专业',
        align:'center'
    },
    {
        key:'score',
        dataIndex:'score',
        title:'成绩',
        align:'center'
    }
]
class rankList extends React.Component{
    constructor(props){
        super(props)
        this.state={
            data:[]
        }
    }
    componentDidMount() {
        this.studentRank()
    }

    studentRank=()=>{
        ajaxService.studentRank({examId:5}).then(res=>{
            if (res.code===1){
                this.setState({
                    data:res.data
                })
            }
        })
    }
    render() {
        return (<div className='rank-list'>
            <Table columns={columns} rowKey="username" dataSource={this.state.data} pagination={false}></Table>
        </div>)
    }
}
export default rankList
