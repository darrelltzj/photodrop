import React from 'react'

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'

import * as firebase from 'firebase'

import Signup from '../auth/Signup'
import Login from '../auth/Login'
import Account from '../auth/Account'
import Albums from '../albums/Albums'
import Pictures from '../pictures/Pictures'
import Presentation from '../presentation/Presentation'

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      albums: [],
      pictures: []
    }
  }

  componentDidMount() {
    const dbRef = firebase.database().ref()
    dbRef.on('value', snap => {
      let albums = []
      snap.child('albums').forEach(album => {
        albums.push({
          id: album.child('id').val(),
          title: album.child('title').val(),
          description: album.child('description').val()
        })
      })

      let pictures = []
      snap.child('pictures').forEach(picture => {
        pictures.push({
          id: picture.child('id').val(),
          album_id: picture.child('album_id').val(),
          img: picture.child('img').val(),
          caption: picture.child('caption').val(),
          votes: picture.child('votes').val()
        })
      })

      this.setState({
        albums: albums,
        pictures: pictures
      })
    })
  }

  render () {

    // console.log('isloggedin', this.state.currentUserUid, !!firebase.auth().currentUser)

    return (
      <Router>
        <Switch>

          <PrivateRoute exact path={'/'} component={() => <Albums albums={this.state.albums} pictures={this.state.pictures} />} />

          <PublicRoute exact path={'/signup'} component={Signup}/>

          <PublicRoute exact path={'/login'} component={Login}/>

          <PrivateRoute exact path={'/account'} component={Account} />

          <PrivateRoute exact path={'/albums/:id'} component={Pictures} />

          <PrivateRoute exact path={'/albums/:id/presentation'} component={Presentation} />

        </Switch>
      </Router>
    )
  }
}

const isAuthenticated = () => {
  // console.log(localStorage)

  if (!firebase.auth().currentUser) {
    let hasLocalStorageUser = false
    for (let key in localStorage) {
      if (key.startsWith("firebase:authUser:")) {
        hasLocalStorageUser = true
        return true
      }
    }
    if (!hasLocalStorageUser) {
      return false
    }
  } else {
    return true
  }
}

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest)
  return (
    React.createElement(component, finalProps)
  )
}

const PropsRoute = ({ component, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest)
    }} />
  )
}

const PrivateRoute = ({ component, redirectTo, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return isAuthenticated() ? (
        renderMergedProps(component, routeProps, rest)
      ) : (
        <Redirect to={{
          pathname: '/login',
          state: { from: routeProps.location }
        }} />
      )
    }} />
  )
}

const PublicRoute = ({ component, redirectTo, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return !isAuthenticated() ? (
        renderMergedProps(component, routeProps, rest)
      ) : (
        <Redirect to={{
          pathname: '/',
          state: { from: routeProps.location }
        }} />
      )
    }} />
  )
}

export default App
