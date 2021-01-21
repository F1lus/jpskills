import React, {useEffect, useState} from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css';
import './style/styles.css';

import manager from './components/GlobalSocket'
import API from './components/BackendAPI'

import Login from './components/user_management/Login'
import ExamWrapper from './components/exams/ExamWrapper'
import ExamModify from './components/exams/modify/ExamModify'
import CustomNavbar from './components/nav/CustomNavbar';
import Home from './components/home/Home';
import ExamDocument from './components/exams/learn/ExamDocument'
import Profile from './components/user_management/Profile';

export default function App(){

  const socket = new manager().socket

  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [permission, setPermission] = useState(null)

  useEffect(() => {
    socket.emit('request-login-info')

    socket.on('login-info', (username, perm) => {
      setLoggedIn(username && perm)
      if(loggedIn){
        setUser(username)
        setPermission(perm)
      }
    })

    return () => socket.disconnect()
  })

  return (
        <Switch>
          <Route exact path='/' component={() =>{
            if(loggedIn){
              return <Redirect to='/home' from='/'/>
            }else{
              return <Login />
            }
          }}/>

          <Route exact path='/home' component={() =>{
            if(loggedIn){
              return (
                <div>
                  <CustomNavbar/>
                  <Home user={user} />
                </div>
              )
            }else{
              return <Redirect to='/' from='/home' />
            }
          }} />

          <Route exact path='/exams' component={() =>{
            if(loggedIn){
              return (
                <div>
                  <CustomNavbar/>
                  <ExamWrapper permission={permission}/>
                </div>
              )
            }else{
              return <Redirect to='/' from='/exams'/>
            }
          }}/>

          <Route exact path='/exams/modify/:examName' component={() =>{
            if(loggedIn){
              if(permission === 'admin'){
                return (
                <div>
                  <CustomNavbar/>
                  <ExamModify/>
                </div>
                )
              }else{
                return <Redirect to='/exams' from='/exams/modify/:examName' />
              }
            }else{
              return <Redirect to='/' from='/exams/modify/:examName' />
            }
          }}/>

        <Route exact path='/exams/learn/:examCode' component={() =>{
          if(loggedIn){
            return (
              <div>
                <CustomNavbar/>
                <ExamDocument />
              </div>
            )
            
          }else{
            return <Redirect to='/' from='/exams/learn/:examCode' />
          }
        }} />

          <Route exact path='/profile' component={() =>{
            if(loggedIn){
              return (
                <div>
                  <CustomNavbar/>
                  <Profile user={user} permission={permission} />
                </div>
              )
            }else{
              return <Redirect to='/' from='/profile' />
            }
          }} />

        <Route exact path='/logout' component={() =>{
          if(loggedIn){
           API.post('/logout', {cmd: 'jp-logout'})
           .then(response => {
             if(response.data.success){
              window.location.reload()
             }
           }).catch(err => console.log(err))
          }else{
            return <Redirect to='/' from='/logout' />
          }
        }} />
      </Switch>
  )

}
