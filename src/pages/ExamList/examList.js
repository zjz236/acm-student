import React from 'react';
import { Table, Breadcrumb, Input, Select, Tag } from 'antd';
import exam from '@/api/exam';
import moment from 'moment';
import Link from 'umi/link';
import { examStatus, badgeColor } from '@/common/common';
import './examList.scss';

const { Column } = Table;
const { Item: BreadcrumbItem } = Breadcrumb;
const { Group: InputGroup, Search } = Input;
const { Option } = Select;

class ExamList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      examData: [],
      loading: false,
      total: 0,
      pageNo: 1,
      pageSize: 20,
      searchType: 'teacher',
      searchText: '',
      status: '',
    };
  }

  componentDidMount() {
    this.getExamList();
  }

  getExamList = async () => {
    await this.setState({
      loading: true,
    });
    const { pageNo, pageSize, searchType, searchText, status } = this.state;
    try {
      const { data: { list, total } } = await exam.getExamList({ pageNo, pageSize, searchType, searchText, status });
      this.setState({
        examData: list,
        total,
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  currentPageChange = async (page) => {
    await this.setState({ pageNo: page });
    this.getExamList();
  };

  changeStatus = async (status) => {
    await this.setState({
      status,
    });
    this.getExamList();
  };

  render() {
    const { examData, loading, total, pageSize, searchType, searchText, pageNo } = this.state;
    return (
      <div className="exam-list">
        <div className="title">全部 C/C++/Java/Python 考试</div>
        <div className="status">
          <Breadcrumb>
            <BreadcrumbItem onClick={() => this.changeStatus('')}><span
              style={{ cursor: 'pointer', color: '#000' }}>All</span></BreadcrumbItem>
            <BreadcrumbItem onClick={() => this.changeStatus('pending')}><span
              style={{ cursor: 'pointer' }}
              className="pending">Pending</span></BreadcrumbItem>
            <BreadcrumbItem onClick={() => this.changeStatus('starting')}><span
              style={{ cursor: 'pointer' }}
              className="starting">Starting</span></BreadcrumbItem>
            <BreadcrumbItem onClick={() => this.changeStatus('ending')}><span
              style={{ cursor: 'pointer' }}
              className="ending">Ending</span></BreadcrumbItem>
          </Breadcrumb>
        </div>
        <div className="search">
          <InputGroup compact>
            <Select style={{ width: 100 }} value={searchType} onChange={e => this.setState({ searchType: e })}>
              <Option value="teacher">教师</Option>
              <Option value="examName">考试名称</Option>
            </Select>
            <Search style={{ width: '20%' }} value={searchText}
                    placeholder="请输入搜索内容"
                    onSearch={this.getExamList}
                    onChange={(e) => this.setState({ searchText: e.target.value })}/>
          </InputGroup>
        </div>
        <Table loading={loading} dataSource={examData} pagination={{
          position: 'bottom',
          total,
          pageSize,
          current: pageNo,
          onChange: this.currentPageChange,
        }}
               rowKey="_id">
          <Column title="考试名称" dataIndex="examName" key="examName" render={(text, record) => (
            <Link to={`/exam/topicList/${record._id}`}>{text}</Link>
          )}/>
          <Column title="开始时间" width={228} dataIndex="startTime" key="startTime" render={(text, record) => (
            <span>
              {moment(new Date(text)).format('YYYY年MM月DD日 HH:mm:ss')}
            </span>
          )}/>
          <Column title="结束时间" width={228} dataIndex="finishTime" key="finishTime" render={(text, record) => (
            <span>
              {moment(new Date(text)).format('YYYY年MM月DD日 HH:mm:ss')}
            </span>
          )}/>
          <Column title="考试状态" width={109} dataIndex="status" key="status" render={(text, record) => {
            const status = examStatus(record.startTime, record.finishTime);
            return (
              <Tag color={badgeColor[status] || ''}>{status}</Tag>
            );
          }}/>
          <Column title="教师" width={82} dataIndex="teacher" key="teacher" render={(text, record) => (
            <span>
              {record.user[0].trueName}
            </span>
          )}/>
          <Column title="学校" width={192} dataIndex="school" key="school" render={(text, record) => (
            <span>
              {record.user[0].school}
            </span>
          )}/>
        </Table>
      </div>
    );
  }
}

export default ExamList;
