import React from 'react'
import {Icon} from "antd";
import './exam.scss'
import {delCookie} from "../../utils/cookieUtil";

export default (props) => {
    let id = window.location.href.substr(window.location.href.lastIndexOf('/') + 1, window.location.href.length)
    const logout=()=>{
        delCookie('token')
        window.location.href=`/exam/login/${id}`
    }
    return (
        <div className="exam">
            <div className="menu">
                <div className='menu-item' onClick={() => {
                    window.location.href = '/'
                }}><Icon type="home"/>Home
                </div>
                <div className='menu-item' onClick={() => {
                    window.location.href = '/examList'
                }}><Icon type="profile"/>Exam</div>
                <div className='menu-item' onClick={() => {
                    window.location.href = `/exam/examInfo/${id}`
                }}><Icon type="profile"/>Problem</div>
                <div className='menu-item' onClick={() => {
                    window.location.href = `/exam/rankList/${id}`
                }}><Icon type="apartment"/>Rank List
                </div>
                <div className='menu-item' onClick={() => {
                    window.location.href = `/exam/editInfo/${id}`
                }}><Icon type="solution"/>Edit UserInfo</div>
                <div className='menu-item' onClick={logout}><Icon type="export"/>Logout</div>
            </div>
            {props.children}
        </div>
    )
}
