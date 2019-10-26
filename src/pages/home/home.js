import React from 'react'
import {Divider} from 'antd'
import './home.scss'
export default (props) => {
    const {history}=props
    return (
        <div className='home'>
            <div className="home-divider">
                <Divider>
                    Welcome to Jiyang College Online Judge
                </Divider>
            </div>
            <p>Did you AC today?</p>
            <span className='go' onClick={() => {
                history.push('/examList')
            }}>Let's Go</span>
        </div>
    )
}

