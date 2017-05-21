import React from 'react'

import {
  NavLink
} from 'react-router-dom'

const Navbar = () => (
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
  </div>
  )

export default Navbar
