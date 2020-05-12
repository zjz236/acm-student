import React, { useEffect, useState } from 'react';
import { Table, Breadcrumb, Input, Select, Tag } from 'antd';
import exam from '@/api/exam';
import moment from 'moment';
import { Link } from 'umi';
import { examStatus, badgeColor } from '@/common/common';
import './examList.less';

const { Column } = Table;
const { Item: BreadcrumbItem } = Breadcrumb;
const { Group: InputGroup, Search } = Input;
const { Option } = Select;

const ExamList = () => {
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchType, setSearchType] = useState('teacher');
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState('');
  const getExamList = async () => {
    await setLoading(true);
    try {
      const {
        data: { list, total },
      } = await exam.getExamList({
        pageNo,
        pageSize,
        searchType,
        searchText,
        status,
      });
      setExamData(list);
      setTotal(total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(loading);
    }
  };
  useEffect(() => {
    getExamList();
  }, []);
  const currentPageChange = async page => {
    await setPageNo(page);
    getExamList();
  };

  const changeStatus = async status => {
    await setStatus(status);
    getExamList();
  };
  return (
    <div className="exam-list">
      <div className="title">全部 C/C++/Java/Python 考试</div>
      <div className="status">
        <Breadcrumb>
          <BreadcrumbItem onClick={() => changeStatus('')}>
            <span style={{ cursor: 'pointer', color: '#000' }}>All</span>
          </BreadcrumbItem>
          <BreadcrumbItem onClick={() => changeStatus('pending')}>
            <span style={{ cursor: 'pointer' }} className="pending">
              Pending
            </span>
          </BreadcrumbItem>
          <BreadcrumbItem onClick={() => changeStatus('starting')}>
            <span style={{ cursor: 'pointer' }} className="starting">
              Starting
            </span>
          </BreadcrumbItem>
          <BreadcrumbItem onClick={() => changeStatus('ending')}>
            <span style={{ cursor: 'pointer' }} className="ending">
              Ending
            </span>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      <div className="search">
        <InputGroup compact>
          <Select
            style={{ width: 100 }}
            value={searchType}
            onChange={e => setSearchType(e)}
          >
            <Option value="teacher">教师</Option>
            <Option value="examName">考试名称</Option>
          </Select>
          <Search
            style={{ width: '20%' }}
            value={searchText}
            placeholder="请输入搜索内容"
            onSearch={getExamList}
            onChange={e => setSearchText(e.target.value)}
          />
        </InputGroup>
      </div>
      <Table
        loading={loading}
        dataSource={examData}
        pagination={{
          position: 'bottom',
          total,
          pageSize,
          current: pageNo,
          onChange: currentPageChange,
        }}
        rowKey="_id"
      >
        <Column
          title="考试名称"
          dataIndex="examName"
          key="examName"
          render={(text, record) => (
            <Link to={`/exam/topicList/${record._id}`}>{text}</Link>
          )}
        />
        <Column
          title="开始时间"
          width={228}
          dataIndex="startTime"
          key="startTime"
          render={(text, record) => (
            <span>
              {moment(new Date(text)).format('YYYY年MM月DD日 HH:mm:ss')}
            </span>
          )}
        />
        <Column
          title="结束时间"
          width={228}
          dataIndex="finishTime"
          key="finishTime"
          render={(text, record) => (
            <span>
              {moment(new Date(text)).format('YYYY年MM月DD日 HH:mm:ss')}
            </span>
          )}
        />
        <Column
          title="考试状态"
          width={109}
          dataIndex="status"
          key="status"
          render={(text, record) => {
            const status = examStatus(record.startTime, record.finishTime);
            return <Tag color={badgeColor[status] || ''}>{status}</Tag>;
          }}
        />
        <Column
          title="教师"
          width={82}
          dataIndex="teacher"
          key="teacher"
          render={(text, record) => <span>{record.user[0].trueName}</span>}
        />
        <Column
          title="学校"
          width={192}
          dataIndex="school"
          key="school"
          render={(text, record) => <span>{record.user[0].school}</span>}
        />
      </Table>
    </div>
  );
};

export default ExamList;
