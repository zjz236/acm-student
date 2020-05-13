import React, { useEffect, useState } from 'react';
import './rankList.less';
import store from '@/store';
import { Table } from 'antd';
import exam from '@/api/exam';
import rank from '@/api/rank';

const { Column } = Table;

const RankList = props => {
  const {
    match: { params },
  } = props;
  const [examId] = useState(params.examId);
  const [rankList, setRankList] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [, setExamInfo] = useState(0);
  useEffect(() => {
    getExamInfo();
    getRankList();
  }, []);
  /**
   * 获取排名列表
   * @returns {Promise<void>}
   */
  const getRankList = async () => {
    try {
      const {
        data: { list, total },
      } = await rank.getRankList({ examId, pageSize, pageNo });
      setRankList(list);
      setTotal(total);
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * 获取考试信息
   * @returns {Promise<void>}
   */
  const getExamInfo = async () => {
    try {
      const action = {
        type: 'user',
        examId: examId,
      };
      store.dispatch(action);
      const { data } = await exam.getExamInfo({ examId });
      setExamInfo(data);
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * 切换页面
   * @param page
   * @returns {Promise<void>}
   */
  const currentPageChange = async page => {
    setPageNo(page);
    useEffect(() => {
      getRankList();
    }, [page]);
  };
  return (
    <div className="rank-list">
      <h1>成绩排名</h1>
      <Table
        dataSource={rankList}
        rowKey="_id"
        pagination={{
          total: total,
          pageSize: pageSize,
          current: pageNo,
          onChange: currentPageChange,
        }}
      >
        <Column
          title="名次"
          key="id"
          dataIndex="id"
          render={(text, record, index) => (
            <span>{parseInt(index) + pageSize * (pageNo - 1) + 1}</span>
          )}
        />
        <Column title="用户名" key="username" dataIndex="username" />
        <Column title="学号" key="studentId" dataIndex="studentId" />
        <Column title="姓名" key="name" dataIndex="name" />
        <Column title="成绩" key="score" dataIndex="score" />
      </Table>
    </div>
  );
};

export default RankList;
