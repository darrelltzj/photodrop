import React from 'react'

import {
  NavLink
} from 'react-router-dom'

import * as firebase from 'firebase'
import {
  NavBrand,
  NavMenu
} from 'react-bootstrap'

class Navbar extends React.Component {
  logout (e) {
    firebase.auth().signOut()
    window.location = '/login'
  }

  render() {
    return (
      <div>
        <div>
          <NavLink to='/'>Home</NavLink>
        </div>
        <div>
          <NavLink to='/settings'>Settings</NavLink>
        </div>
        <div>
          <NavLink to='/login'>Login</NavLink>
        </div>
        <div>
          <NavLink to='/signup'>Signup</NavLink>
        </div>
        <div>
          <span id='logout-link' onClick={(e) => this.logout(e)}>Logout</span>
        </div>
      </div>
    )
  }
}

export default Navbar
