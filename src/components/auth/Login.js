import React from 'react'

import {
  Link
} from 'react-router-dom'

import * as firebase from 'firebase'

import Navbar from '../navbar/Navbar'

class Login extends React.Component {
  login (e) {
    e.preventDefault()

    let emailLogin = e.target.querySelector('#login-email').value
    let passwordLogin = e.target.querySelector('#login-password').value

    firebase.auth().signInWithEmailAndPassword(emailLogin, passwordLogin)
    .then((user) => {
      console.log('Logged in')
      // REDIRECT
      window.location = '/'
    })
    .catch((err) => {
      alert(err.message)
    })


  }

  render() {
    return (
      <div>
        <Navbar />

        <form onSubmit={(e) => this.login(e)}>

          <label>
            Email
            <input type='email' id='login-email' name="email" placeholder='Email' required />
          </label>

          <label>
            Password
            <input type='password' id='login-password' name="password" placeholder='Password' required />
          </label>

          <button>Login</button>
        </form>

        <Link to='/signup'>
          Don't have an Account? Sign up here.
        </Link>

      </div>
    )
  }
}

export default Login
