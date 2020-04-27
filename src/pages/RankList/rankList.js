import React from 'react';
import './rankList.less';
import store from '@/store';
import { Table } from 'antd';
import exam from '@/api/exam';
import rank from '@/api/rank';

const { Column } = Table;

class RankList extends React.Component {
  constructor(props) {
    super(props);
    const {
      match: { params },
    } = props;
    this.state = {
      examId: params.examId,
      rankList: [],
      pageSize: 20,
      pageNo: 1,
      total: 0,
    };
  }

  componentDidMount() {
    this.getExamInfo();
    this.getRankList();
  }

  getRankList = async () => {
    const { examId, pageSize, pageNo } = this.state;
    try {
      const {
        data: { list, total },
      } = await rank.getRankList({ examId, pageSize, pageNo });
      this.setState({
        rankList: list,
        total,
      });
    } catch (e) {
      console.error(e);
    }
  };

  currentPageChange = async page => {
    await this.setState({ pageNo: page });
    this.getRankList();
  };

  getExamInfo = async () => {
    try {
      const { examId } = this.state;
      const action = {
        type: 'user',
        examId: examId,
      };
      store.dispatch(action);
      const { data } = await exam.getExamInfo({ examId });
      this.setState({
        examInfo: data,
      });
    } catch (e) {
      console.error(e);
    }
  };

  render() {
    const { rankList, total, pageSize, pageNo } = this.state;
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
            onChange: this.currentPageChange,
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
  }
}

export default RankList;
