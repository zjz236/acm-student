import React from 'react';
import loadable from "@loadable/component";
import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";
import Exam from './exam/exam'
import './App.scss'

export default () => {
    return (<BrowserRouter>
        <div className="header">
            <div className="center"></div>
        </div>
        <div className="content">
            <div className="center">
                <Switch>
                    <Route exact path={'/'}
                           component={loadable(() => import(/* webpackChunkName: "home" */ './home/home'))}/>
                    <Route exact path={'/examList'}
                           component={loadable(() => import(/* webpackChunkName: "examList" */ './examList/examList'))}/>
                    <Route path={'/exam'} render={()=><Exam>
                        <Route extra path={'/exam/login/:id'} component={loadable(() => import(/* webpackChunkName: "login" */ './login/login'))}/>
                        <Route extra path={'/exam/examInfo/:id'} component={loadable(() => import(/* webpackChunkName: "examInfo" */ './examInfo/examInfo'))}/>
                        <Route extra path={'/exam/program/:id'} component={loadable(() => import(/* webpackChunkName: "program" */ './program/program'))}/>
                        <Route extra path={'/exam/trueOrFalse/:id'} component={loadable(() => import(/* webpackChunkName: "trueOrFalse" */ './trueOrFalse/trueOrFalse'))}/>
                        <Route extra path={'/exam/select/:id'} component={loadable(() => import(/* webpackChunkName: "select" */ './select/select'))}/>
                        <Route extra path={'/exam/gap/:id'} component={loadable(() => import(/* webpackChunkName: "gap" */ './gap/gap'))}/>
                    </Exam>}/>
                    <Route component={() => <Redirect to={'/'} push={false}/>}/>
                </Switch>
            </div>
        </div>
        <div className="footer">
            <div className="center">
                <p>Address:Jiyang College Of Zhejiang A&F University | <span>Administrator</span></p>
                <p>Technical Support:Jinze.Zhu</p>
            </div>
        </div>
    </BrowserRouter>)
};
