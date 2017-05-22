import React from 'react'
import './App.css'

import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'

import * as firebase from 'firebase'

import Signup from '../auth/Signup'
import Login from '../auth/Login'
import Albums from '../albums/Albums'
import AlbumsNew from '../albumsNew/AlbumsNew'
import AlbumEdit from '../albumEdit/AlbumEdit'
import AlbumSettings from '../albumSettings/AlbumSettings'
import Pictures from '../pictures/Pictures'
import PicturesNew from '../picturesNew/PicturesNew'

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
      // const test = snap.child('pictures').val()
      // console.log(test['1'])
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

    // const PrivateRoute = ({ component, redirectTo, ...rest }) => {
    //   return (
    //     <Route {...rest} render={routeProps => {
    //       return auth.loggedIn() ? (
    //         renderMergedProps(component, routeProps, rest)
    //       ) : (
    //         <Redirect to={{
    //           pathname: redirectTo,
    //           state: { from: routeProps.location }
    //         }} />
    //       )
    //     }} />
    //   )
    // }

    return (
      <Router>
        <Switch>

          <Route exact path={'/'} component={() => <Albums albums={this.state.albums} pictures={this.state.pictures} />} />

          <Route exact path={'/signup'} component={Signup}/>

          <Route exact path={'/login'} component={Login}/>

          <Route exact path={'/albums_new'} component={AlbumsNew}/>

          <Route exact path={'/albums/:id/edit'} component={AlbumEdit}/>

          <Route exact path={'/albums/:id/settings'} component={AlbumSettings}/>

          <PropsRoute exact path={'/albums/:id'} component={Pictures} albums={this.state.albums} pictures={this.state.pictures} />

          <PropsRoute exact path={'/albums/:id/pictures_new'} component={PicturesNew} pictures={this.state.pictures}/>

        </Switch>
      </Router>
    )
  }
}

export default App
