import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Switch, Route, useLocation } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import './style/styles.css'

import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { SocketContext } from './components/GlobalSocket'

import API from './components/BackendAPI'

import Login from './components/user_management/Login'
import ExamWrapper from './components/exams/ExamWrapper'
import ExamModify from './components/exams/modify/ExamModify'
import CustomNavbar from './components/nav/CustomNavbar'
import Home from './components/home/Home'
import ExamDocument from './components/exams/learn/ExamDocument'
import Profile from './components/user_management/Profile'
import Examination from './components/exams/examination/Examination'
import ExamResults from './components/exams/examination/ExamResults'
import LoginHandler from './components/user_management/handlers/LoginHandler'
import Routing from './components/user_management/handlers/Routing'

export default function App() {

  const socket = useContext(SocketContext)

  const [loggedIn, setLoggedIn] = useState(false)
  const [permission, setPermission] = useState(null)
  const location = useLocation()

  const handleLoginInfo = useCallback((username, perm) => {
    setLoggedIn(username && perm)
    if (loggedIn) {
      setPermission(perm)
    }
  }, [loggedIn])

  useEffect(() => {
    socket.emit('request-login-info')

    socket.on('login-info', handleLoginInfo)

    return () => socket.off('login-info', handleLoginInfo)
  }, [loggedIn, socket, handleLoginInfo])

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
              <Routing exact path='/' login={true} component={Login} />

              <Routing exact path='/home' component={Home} />

              <Routing exact path='/exams' component={ExamWrapper} />

              <Routing exact path='/exams/modify/:examName' component={ExamModify} />

              <Routing exact path='/exams/learn/:examCode' component={ExamDocument} />

              <Routing exact path='/exams/:examCode' component={Examination} />

              <Routing exact path='/exams/result/:examCode/' component={ExamResults} />

              <Routing exact path='/profile' component={Profile} />

              <Route exact path='/logout' render={() => (
                <LoginHandler loggedIn={loggedIn} allowed={['*']} permission={permission}>
                  {
                    API.post('/logout', { cmd: 'jp-logout' })
                      .then(response => {
                        if (response.data.success) {
                          window.location.reload()
                        }
                      }).catch(err => console.log(err))
                  }
                </LoginHandler>
              )} />
            </Switch>
          </CSSTransition>
        </TransitionGroup>
    </React.Fragment>
  )

}
