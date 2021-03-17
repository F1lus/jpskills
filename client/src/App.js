import React, { useEffect } from 'react'
import { Switch, useLocation } from 'react-router-dom'
import { useSelector, useStore } from 'react-redux'

import 'bootstrap/dist/css/bootstrap.min.css'
import './style/styles.css'

import { CSSTransition, TransitionGroup } from 'react-transition-group'

import OverlayScrollbars from 'overlayscrollbars'
import 'overlayscrollbars/css/OverlayScrollbars.css'

import {setLoad} from './components/store/ActionHandler'

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
import Management from './components/user_management/superuser/Management'
import UserManager from './components/user_management/superuser/UserManager'
import Load from './components/loading/Load'

export default function App() {

  const [loggedIn, permission] = useSelector(state => [state.userReducer.loggedIn, state.userReducer.permission])
  const loading = useSelector(state => state.loadReducer.loading)
  
  const location = useLocation()
  const store = useStore()

  document.addEventListener("DOMContentLoaded", function() {
    if(!loading){
      OverlayScrollbars(document.querySelectorAll('body'), { className: "os-theme-dark" });
    }
  })

  useEffect(() => {
    
    setLoad(store, false)
  }, [store])

  return (
    <React.Fragment>
      {loading ? <Load />: null}
      {loggedIn && permission !== 'superuser' ? <CustomNavbar /> : null}
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

            <Routing exact path='/exams/modify/:examName' allowed={['admin']} component={ExamModify} />

            <Routing exact path='/exams/learn/:examCode' allowed={['*']} component={ExamDocument} />

            <Routing exact path='/exams/:examCode' allowed={['*']} component={Examination} />

            <Routing exact path='/exams/result/:examCode/' allowed={['*']} component={ExamResults} />

            <Routing exact path='/profile' allowed={['*']} component={Profile} />

            <Routing exact path='/management' allowed={['superuser']} component={Management} />

            <Routing exact path='/management/:user' allowed={['superuser']} component={UserManager} />

            <Routing exact path='/logout' allowed={['*']} component={LogoutPlaceholder} />
          </Switch>
        </CSSTransition>
      </TransitionGroup>
    </React.Fragment>
  )

}

const LogoutPlaceholder = () => (
  <h5 className='text-light'>
    Pillanat türelmet...
  </h5>
)
