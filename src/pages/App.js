import React from 'react';
import loadable from "@loadable/component";
import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";
import './App.scss'
export default () => {
    return (<BrowserRouter>
        <div className="header">
            <div className="center"></div>
        </div>
        <Switch>
            <Route exact path={'/'}
                   component={loadable(() => import(/* webpackChunkName: "Default" */ './home/home'))}/>
            <Route component={() => <Redirect to={'/'} push={false} />} />
        </Switch>
        <div className="footer">
            <div className="center">
                <p>Address:Jiyang College Of Zhejiang A&F University<a>Administrator</a></p>
                <p>Technical Support:Jinze.Zhu</p>
            </div>
        </div>
    </BrowserRouter>)
};
