import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Switch, Route } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import './style/styles.css'

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

export default function App() {

  const socket = useContext(SocketContext)

  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [permission, setPermission] = useState(null)

  const handleLoginInfo = useCallback((username, perm) => {
    setLoggedIn(username && perm)
    if (loggedIn) {
      setUser(username)
      setPermission(perm)
    }
  }, [loggedIn])

  useEffect(() => {
    socket.emit('request-login-info')

    socket.on('login-info', handleLoginInfo)

    return () => socket.off('login-info', handleLoginInfo)
  }, [loggedIn, socket, handleLoginInfo])

  return (
    <Switch>
      <Route exact path='/' component={() => (
        <LoginHandler login={true} loggedIn={loggedIn} allowed={['*']} permission={permission}>
          <Login />
        </LoginHandler>
      )} />

      <Route exact path='/home' component={() => (
        <LoginHandler loggedIn={loggedIn} allowed={['*']} permission={permission}>
          <CustomNavbar />
          <Home user={user} permission={permission} />
        </LoginHandler>
      )} />

      <Route exact path='/exams' component={() => (
        <LoginHandler loggedIn={loggedIn} allowed={['*']} permission={permission}>
          <CustomNavbar />
          <ExamWrapper permission={permission} />
        </LoginHandler>
      )} />

      <Route exact path='/exams/modify/:examName' component={() => (
        <LoginHandler loggedIn={loggedIn} allowed={['admin', 'superuser']} permission={permission}>
          <CustomNavbar />
          <ExamModify />
        </LoginHandler>
      )} />

      <Route exact path='/exams/learn/:examCode' component={() => (
        <LoginHandler loggedIn={loggedIn} allowed={['*']} permission={permission}>
          <CustomNavbar />
          <ExamDocument permission={permission} />
        </LoginHandler>
      )} />

      <Route exact path='/exams/:examCode' component={() => (
        <LoginHandler loggedIn={loggedIn} allowed={['*']} permission={permission}>
          <CustomNavbar />
          <Examination />
        </LoginHandler>
      )} />

      <Route exact path='/exams/result/:examCode/' component={() => (
        <LoginHandler loggedIn={loggedIn} allowed={['*']} permission={permission}>
          <CustomNavbar />
          <ExamResults />
        </LoginHandler>
      )} />

      <Route exact path='/profile' component={() => (
        <LoginHandler loggedIn={loggedIn} allowed={['*']} permission={permission}>
          <CustomNavbar />
          <Profile user={user} permission={permission} />
        </LoginHandler>
      )} />

      <Route exact path='/logout' component={() => (
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
  )

}
