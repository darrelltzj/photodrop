import React from 'react'
import './App.css'

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'

import * as firebase from 'firebase'

import Signup from '../auth/Signup'
import Login from '../auth/Login'
import Albums from '../albums/Albums'
import Pictures from '../pictures/Pictures'
import Presentation from '../presentation/Presentation'

// NOT NEEEDED
// import AlbumsNew from '../albumsNew/AlbumsNew'
// import AlbumEdit from '../albumEdit/AlbumEdit'
// import AlbumSettings from '../albumSettings/AlbumSettings'
// import PicturesNew from '../picturesNew/PicturesNew'

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      albums: [],
      pictures: [],
      // currentUser: null
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

  //   firebase.auth().onAuthStateChanged((user) => {
  //     if (user) {
  //       console.log('firebaseAuth', user)
  //       console.log('this', this)
  //
  //       this.setState({
  //         currentUser: true
  //       })
  //
  //       console.log('setting state', this.state.currentUser)
  //
  //     } else {
  //       console.log('firebaseAuth', user)
  //
  //       this.setState({
  //         currentUser: false
  //       })
  //
  //       console.log('setting state', this.state.currentUser)
  //     }
  //   })
  }

  render () {

    // console.log('isloggedin', this.state.currentUser, !!firebase.auth().currentUser)

    return (
      <Router>
        <Switch>

          <PrivateRoute exact path={'/'} component={() => <Albums albums={this.state.albums} pictures={this.state.pictures} />} />

          <Route exact path={'/signup'} component={Signup}/>

          <Route exact path={'/login'} component={Login}/>

          {/* ===NOT USED=== */}
          {/* <Route exact path={'/albums_new'} component={AlbumsNew}/>
          <Route exact path={'/albums/:id/edit'} component={AlbumEdit}/>
          <Route exact path={'/albums/:id/settings'} component={AlbumSettings}/> */}
          {/* ===NOT USED=== */}

          <PrivateRoute exact path={'/albums/:id'} component={Pictures} />

          <PrivateRoute exact path={'/albums/:id/presentation'} component={Presentation} />

          {/* ===NOT USED=== */}
          {/* <PropsRoute exact path={'/albums/:id/pictures_new'} component={PicturesNew} pictures={this.state.pictures}/> */}
          {/* ===NOT USED=== */}

        </Switch>
      </Router>
    )
  }
}

const isAuthenticated = () => {
  console.log(localStorage)
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

export default App
