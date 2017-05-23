import React from 'react'

import {
  Nav,
  NavDropdown,
  MenuItem,
  NavItem,
  Glyphicon,
  Col
 } from 'react-bootstrap'

import * as firebase from 'firebase'

class Navbar extends React.Component {
  handleSelect(eventKey) {
    event.preventDefault()
    // alert(`selected ${eventKey}`)
    if (eventKey == '/logout') {
      firebase.auth().signOut()
      window.location = '/login'
    } else {
      window.location = eventKey
    }
  }

  render() {
    return (
      <Nav bsStyle="tabs" onSelect={this.handleSelect} className="nav-parent">

          <NavDropdown title=
            {
              <span>
                <Glyphicon glyph="align-justify" />
                {' '}Menu
              </span>
            } id="nav-dropdown" className="nav-menu">

            <MenuItem eventKey="/">Home</MenuItem>
            <MenuItem eventKey="/account">Account</MenuItem>

            <MenuItem divider />

            <MenuItem eventKey="/logout">Logout</MenuItem>

          </NavDropdown>

          <div className="brand-title">
            Photodrop
          </div>

      </Nav>
    )
  }
}

export default Navbar
