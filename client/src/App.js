import React from 'react'
import { Switch, useLocation } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import './style/styles.css'

import { CSSTransition, TransitionGroup } from 'react-transition-group'

import Login from './components/user_management/Login'
import ExamWrapper from './components/exams/ExamWrapper'
import ExamModify from './components/exams/modify/ExamModify'
import CustomNavbar from './components/nav/CustomNavbar'
import Home from './components/home/Home'
import ExamDocument from './components/exams/learn/ExamDocument'
import Profile from './components/user_management/Profile'
import Examination from './components/exams/examination/Examination'
import ExamResults from './components/exams/examination/ExamResults'
import Routing from './components/user_management/handlers/Routing'
import { useSelector } from 'react-redux'

export default function App() {

  const loggedIn = useSelector(state => state.userReducer.loggedIn)
  const location = useLocation()

  return (
    <React.Fragment>
      {loggedIn ? <CustomNavbar /> : null}
        <TransitionGroup>
          <CSSTransition
            key={location.key}
            timeout={500}
            classNames="fade"
            >
            <Switch location={location}>
              <Routing exact path='/' allowed={['*']} component={Login} />

              <Routing exact path='/home' allowed={['*']} component={Home} />

              <Routing exact path='/exams' allowed={['*']} component={ExamWrapper} />

              <Routing exact path='/exams/modify/:examName' allowed={['admin', 'superuser']} component={ExamModify} />

              <Routing exact path='/exams/learn/:examCode' allowed={['*']} component={ExamDocument} />

              <Routing exact path='/exams/:examCode' allowed={['*']} component={Examination} />

              <Routing exact path='/exams/result/:examCode/' allowed={['*']} component={ExamResults} />

              <Routing exact path='/profile' allowed={['*']} component={Profile} />

              <Routing exact path='/logout' allowed={['*']} component={Logout}/>
            </Switch>
          </CSSTransition>
        </TransitionGroup>
    </React.Fragment>
  )

}

const Logout =() => (
  <div>
    Pillanat türelmet...
  </div>
)
