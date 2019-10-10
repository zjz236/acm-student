import React from 'react'
import './examList.scss'
import {Input, Select, Breadcrumb, Pagination, Table} from 'antd';
import ajaxService from "../../utils/ajaxService";
import {getAllTime, getExamStatus} from "../../utils/commonUtil";

const BreadcrumbItem = Breadcrumb.Item
const InputGroup = Input.Group;
const {Search} = Input;
const {Option} = Select;
const columns = [
    {
        title: 'Id',
        dataIndex: 'Id',
        key: 'Id',
        width: 60,
        align: 'center'
    },
    {
        title: 'Exam Name',
        dataIndex: 'name',
        width: 400,
        key: 'name',
        render:(text,record,index)=>{
            return (<a href={`/exam/examInfo/${record.Id}`}>{text}</a>)
        },
        className:'name',
        align: 'center'
    },
    {
        title: 'Start Time',
        dataIndex: 'start',
        key: 'start',
        render: (text, record, index) => {
            return (<div>{getAllTime(text)}</div>)
        },
        width: 200,
        align: 'center'
    },
    {
        title: 'Finish Time',
        dataIndex: 'finish',
        key: 'finish',
        render: (text, record, index) => {
            return (<div>{getAllTime(text)}</div>)
        },
        width: 200,
        align: 'center'
    },
    {
        title: 'Exam Status',
        dataIndex: 'status',
        key: 'status',
        render: (text, record, index) => {
            return (<div className={getExamStatus(record.start, record.finish)}>{getExamStatus(record.start, record.finish)}</div>)
        },
        width:100,
        align: 'center'
    },
    {
        title: 'Exam Type',
        dataIndex: 'type',
        key: 'type',
        render: (text, record, index) => {
            return (<div>{record.isTest ? 'exam' : 'exercise'}</div>)
        },
        width:80,
        align: 'center'
    },
    {
        title: 'Holder',
        dataIndex: 'holder',
        key: 'holder',
        align: 'center',
        width:80,
    }
]

class examList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            searchContent: '',
            searchType: 0,
            examStatus: '',
            total: 0,
            load: true,
            currentPage: 1,
            pageSize: 20,
            dataSource: []
        }
    }

    componentDidMount() {
        this.getExamList()
    }

    getExamList = () => {
        this.setState({
            load: true
        })
        let {searchContent, searchType, examStatus, currentPage, pageSize} = this.state
        let data = {searchContent, searchType, examStatus, page: currentPage - 1, limit: pageSize}
        ajaxService.getExamList(data).then(res => {
            if (res.code === 1) {
                this.setState({
                    dataSource: res.data,
                    total: res.total,
                    load: false
                })
            }
        })
    }
    pageChange = async (page) => {
        await this.setState({currentPage: page})
        this.getExamList()
    }
    getSearch=async (value,event)=>{
        await this.setState({searchContent:value})
        this.getExamList()
    }
    timeSelect=async (time)=>{
        await this.setState({examStatus:time})
        this.getExamList()
    }

    render() {
        return (
            <div className="exam-list">
                <div className="title">
                    C/C++/Java Exam List
                </div>
                <Breadcrumb><BreadcrumbItem><span
                    className="pending" onClick={()=>this.timeSelect(0)}>pending</span></BreadcrumbItem><BreadcrumbItem><span
                    className="starting" onClick={()=>this.timeSelect(1)}>starting</span></BreadcrumbItem><BreadcrumbItem><span
                    className="ending" onClick={()=>this.timeSelect(2)}>ending</span></BreadcrumbItem></Breadcrumb>
                <div className="search-page">
                    <div className="search-bar">
                        <InputGroup compact={true}>
                            <Select onSelect={(value)=>{this.setState({searchType:value})}} value={this.state.searchType}><Option value={0}>holder</Option><Option
                                value={1}>title</Option></Select>
                            <Search onSearch={(value,event)=>this.getSearch(value,event)} placeholder="input search text" />
                        </InputGroup>
                    </div>
                    <div className="page-bar">
                        <Pagination onChange={page => this.pageChange(page)} current={this.state.currentPage}
                                    pageSize={this.state.pageSize} total={this.state.total} />
                    </div>
                </div>
                <Table loading={this.state.load} columns={columns} pagination={false} rowKey="Id"
                       dataSource={this.state.dataSource}/>
            </div>
        )
    }
}

export default examList
