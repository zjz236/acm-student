import React from 'react'
import {Icon} from "antd";
import './exam.scss'

export default (props)=>{
        return (
            <div className="exam">
                <div className="menu">
                    <div className='menu-item' onClick={()=>{window.location.href='/'}}><Icon type="home"/>Home</div>
                    <div className='menu-item'><Icon type="profile"/>Exam</div>
                    <div className='menu-item'><Icon type="apartment"/>Rank List</div>
                    <div className='menu-item'><Icon type="solution"/>Edit UserInfo</div>
                    <div className='menu-item'><Icon type="export"/>Logout</div>
                </div>
                {props.children}
            </div>
        )
}
