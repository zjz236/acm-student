import { Layout } from 'antd';
import React from 'react';

export default () => {
  return (
    <Layout className="exam">
      <Header className="exam-header">
      </Header>
      {children}
      <Footer style={{ textAlign: 'center' }}>技术支持：计算机162 朱锦泽</Footer>
    </Layout>
  )
}
