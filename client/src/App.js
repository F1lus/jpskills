import React from 'react'
import { Switch, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import 'bootstrap/dist/css/bootstrap.min.css'
import './style/styles.css'
import 'wowjs/css/libs/animate.css'

import Login from './components/user_management/Login'
import ResetRequest from './components/user_management/ResetRequest'
import PasswordReset from './components/user_management/PasswordReset'
import ExamWrapper from './components/exams/ExamWrapper'
import ExamModify from './components/exams/modify/ExamModify'
import CustomNavbar from './components/nav/CustomNavbar'
import Home from './components/home/Home'
import ExamDocument from './components/exams/learn/ExamDocument'
import Profile from './components/user_management/Profile'
import Examination from './components/exams/examination/Examination'
import ExamResults from './components/exams/examination/ExamResults'
import Routing from './components/user_management/handlers/Routing'
import Management from './components/user_management/superuser/Management'
import UserManager from './components/user_management/superuser/UserManager'
import Load from './components/loading/Load'
import AdminManager from './components/user_management/superuser/AdminManager'

export default function App() {

  const [loggedIn, permission] = useSelector(state => [state.userReducer.loggedIn, state.userReducer.permission])
  const loading = useSelector(state => state.loadReducer.loading)

  const location = useLocation()

  const shouldLoad = () => loading ? <Load /> : null

  const canDisplayNav = () => {
    if(loggedIn && permission !== 'superuser'){
      return (
        <CustomNavbar />
      )
    }else{
      return null
    }
  }

  return (
    <div>
      {shouldLoad()}
      {canDisplayNav()}
      <Switch location={location}>
        <Routing exact path='/' allowed={['*']} component={Login} />

        <Routing exact path='/resetRequest' allowed={['*']} component={ResetRequest} />

        <Routing exact path='/resetPassword' allowed={['*']} component={PasswordReset} />

        <Routing exact path='/home' allowed={['*']} component={Home} />

        <Routing exact path='/exams' allowed={['*']} component={ExamWrapper} />

        <Routing exact path='/exams/modify/:examName' allowed={['admin']} component={ExamModify} />

        <Routing exact path='/exams/learn/:examCode' allowed={['*']} component={ExamDocument} />

        <Routing exact path='/exams/:examCode' allowed={['*']} component={Examination} />

        <Routing exact path='/exams/result/:examCode/' allowed={['*']} component={ExamResults} />

        <Routing exact path='/profile/:profile' allowed={['*']} component={Profile} />

        <Routing exact path='/management' allowed={['superuser']} component={Management} />

        <Routing exact path='/management/learn/:examCode' allowed={['superuser']} component={ExamDocument} />

        <Routing exact path='/management/:user' allowed={['superuser']} component={UserManager} />

        <Routing exact path='/management/admin/:user' allowed={['superuser']} component={AdminManager} />

        <Routing exact path='/logout' allowed={['*']} component={Load} />
      </Switch>
    </div>
  )

}
