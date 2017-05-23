import React from 'react'

import {
  Nav,
  NavDropdown,
  MenuItem,
  NavItem,
  Glyphicon
 } from 'react-bootstrap'

const NavDropdownExample = React.createClass({
  handleSelect(eventKey) {
    event.preventDefault();
    alert(`selected ${eventKey}`);
  },

  render() {
    return (
      <Nav bsStyle="tabs" activeKey="1" onSelect={this.handleSelect} className="nav-parent">

        <NavDropdown eventKey="4" title=
          {
            <span>
              <Glyphicon glyph="align-justify" />
              {' '}Menu
            </span>
          } id="nav-dropdown">

          <MenuItem eventKey="4.1">Home</MenuItem>
          <MenuItem eventKey="4.2">Account</MenuItem>
          <MenuItem eventKey="4.3">Login</MenuItem>
          <MenuItem eventKey="4.3">Signup</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey="4.4">Logout</MenuItem>
        </NavDropdown>

        <div className="test">
          Photodrop
        </div>

      </Nav>
    );
  }
});

export default NavDropdownExample
