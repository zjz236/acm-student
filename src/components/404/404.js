import './404.less';
import { BackTop, Carousel, Layout, Menu, Modal, Spin } from 'antd';
import React from 'react';
import { HomeOutlined, ProfileOutlined } from '@ant-design/icons';
import { history } from '../.umi/core/history';
import { menuKeys } from '../common/common';
import Texty from 'rc-texty';
import 'rc-texty/assets/index.css';
const { Header, Footer, Content } = Layout;
const { Item: MenuItem } = Menu;
export default function() {
  const menuRoute = ({ key }) => {
    for (const item in menuKeys) {
      if (menuKeys[item] === key) {
        history.push(item);
      }
    }
  };
  return (
    <Layout className="not-found">
      <BackTop />
      <Header className="exam-header"></Header>
      <Content style={{ padding: '0 10vw' }}>
        <Menu
          onClick={menuRoute}
          mode="horizontal"
          className="exam-menu"
          selectedKeys=""
        >
          <MenuItem key="home">
            <HomeOutlined />
            首页
          </MenuItem>
          <MenuItem key="examList">
            <ProfileOutlined />
            考试列表
          </MenuItem>
        </Menu>
        <div
          className="not-found-content"
          style={{ background: '#fff', padding: 24, minHeight: 280 }}
        >
          <Texty className="not-fount-text">404</Texty>
          <p className="not-fount-text">页面不存在...</p>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        浙ICP备18055051号&emsp;技术支持：计算机162{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://zjz236.github.io/"
        >
          朱锦泽
        </a>
        , 黄梦霞
      </Footer>
    </Layout>
  );
}
