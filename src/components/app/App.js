import React, { Component } from 'react'
import './App.css'

import Albums from '../albums/Albums'

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

class App extends Component {
  // constructor(props) {
  //   super(props)
  // }

  render() {
    return (
      <div>
        <Router>
          <div>
            <Link to='/'>Home</Link> |{' '}
            <Link to='/settings'>Settings</Link> |{' '}
            <Link to='/login'>Login</Link> |{' '}
            <Link to='/signup'>Signup</Link>

            <Route exact path="/" component={() => <Albums />} />
          </div>
        </Router>
      </div>
    )
  }
}

export default App;
