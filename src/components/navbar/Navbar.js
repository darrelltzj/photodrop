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
        <li>
          <NavLink to='/'>Home</NavLink>
        </li>
        <li>
          <NavLink to='/settings'>Settings</NavLink>
        </li>
        <li>
          <NavLink to='/login'>Login</NavLink>
        </li>
        <li>
          <NavLink to='/signup'>Signup</NavLink>
        </li>
        <li>
          <span id='logout-link' onClick={(e) => this.logout(e)}>Logout</span>
        </li>

        <ul className="nav nav-tabs">
          <li role="presentation" className="dropdown">
            <a className="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">
              Menu <span className="caret"></span>
            </a>
            <ul className="dropdown-menu">
              <li>Test</li>
            </ul>
          </li>
        </ul>
      </div>
    )
  }
}

export default Navbar
