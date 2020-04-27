import './loading.less';
import { Spin } from 'antd';

export default function() {
  return (
    <div className="loading">
      <Spin tip="加载中，请稍后..."></Spin>
    </div>
  );
}
