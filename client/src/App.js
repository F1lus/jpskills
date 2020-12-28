import React, {useEffect, useState} from 'react'
import {Switch, Route, Redirect} from 'react-router-dom'
//import socketIOClient from 'socket.io-client'

import 'bootstrap/dist/css/bootstrap.min.css';
import './style/styles.css';

import API from './components/BackendAPI'
import Login from './components/user_management/Login'
import ExamWrapper from './components/exams/ExamWrapper'
import ExamModify from './components/exams/modify/ExamModify'
import CustomNavbar from './components/nav/CustomNavbar';
import Home from './components/home/Home';
import Learn from './components/exams/learn/Learn';
import Profile from './components/user_management/Profile';

export default function App(){

  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [permission, setPermission] = useState(null)

  useEffect(() =>{
    API.get('/login')
      .then(result =>{
        setLoggedIn(result.data.user && result.data.permission)
        if(loggedIn){
          setUser(result.data.user)
          setPermission(result.data.permission)
        }
      }).catch(err => console.log(err))
  })

  return (
    <div>
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

        <Route exact path='/exams/learn' component={() =>{
          if(loggedIn){
            return (
              <div>
                <CustomNavbar/>
                <Learn user={user}/>
              </div>
            )
          }else{
            return <Redirect to='/' from='/exams/modify/:examName' />
          }
        }} />

        <Route exact path='/exams/learn/:examCode' component={() =>{
          if(loggedIn){
            return (
              <div>
                <CustomNavbar/>
              </div>
            )
          }else{
            return <Redirect to='/' from='/exams/modify/:examName' />
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
            return <Redirect to='/' from='/exams/modify/:examName' />
          }
        }} />
      </Switch>
    </div>
  )

}
