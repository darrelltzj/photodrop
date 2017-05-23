import React from 'react'

import {
  Link
} from 'react-router-dom'

import * as firebase from 'firebase'

import Navbar from '../navbar/Navbar'
import NavDropdownExample from '../navbar/NavDropdownExample'

class Signup extends React.Component {

  signup(e) {
    e.preventDefault()

    let nameSignup = e.target.querySelector('#signup-name').value
    let emailSignup = e.target.querySelector('#signup-email').value
    let passwordSignup = e.target.querySelector('#signup-password').value
    let passwordConfirmationSignup = e.target.querySelector('#signup-password-confirmation').value

    if (passwordSignup !== passwordConfirmationSignup) {
      alert('Passwords must match')
    } else if (passwordSignup.length < 6) {
      alert('Password must be 6 characters or more')
    } else {

      firebase.auth().createUserWithEmailAndPassword(emailSignup, passwordSignup)

      .then((user) => {
        let newUser = {
          id: user.uid,
          name: nameSignup,
          email: user.email,
          organising: [],
          participating: [],
          requested: []
        }

        firebase.database().ref('/users/' + user.uid).set(newUser)

        firebase.auth().signInWithEmailAndPassword(user.email, passwordSignup)
        .then((user) => {
          console.log('Logged in')
          // REDIRECT
          window.location = '/'
        })
        .catch((err) => {
          alert(err.message)
        })

      })
      .catch((err) => {
        alert(err.message)
      })
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        <NavDropdownExample />

        <form onSubmit={(e) => this.signup(e)}>

          <div className="input-group">
            <label>
              Name
              <input type='text' className="form-control" id='signup-name' name="name" placeholder='Name' required />
            </label>
          </div>

          <label>
            Email
            <input type='email' id='signup-email' name="email" placeholder='Email' required />
          </label>

          <label>
            Password
            <input type='password' id='signup-password' name="password" placeholder='Password' required />
          </label>

          <label>
            Password Confirmation
            <input type='password' id='signup-password-confirmation' name="password-confirmation" placeholder='Password Confirmation' required />
          </label>

          <button>Sign Up</button>
        </form>

        <Link to='/login'>
          Already have an Account? Login here.
        </Link>

      </div>
    )
  }
}

export default Signup
