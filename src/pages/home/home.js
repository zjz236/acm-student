import React from 'react'
import './home.scss'
class Home extends React.Component{
    render() {
        return (
            <div className='home'>
                <p>Welcome to Jiyang College Online Judge</p>
                <p>Did you AC today?</p>
                <a>Let's Go</a>
            </div>
        )
    }
}
export default Home
