import React from 'react'

import {
  Link
} from 'react-router-dom'

import * as firebase from 'firebase'

import {
  Form,
  FormGroup,
  Col,
  FormControl,
  ControlLabel,
  Button,
  PageHeader
 } from 'react-bootstrap'

import Navbar from '../navbar/Navbar'

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
        user.updateProfile({displayName: nameSignup})
        
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
        <Col sm={6}>
          <PageHeader>
            <strong>Photodrop</strong>
            {' '}
            <small>Photo Sharing Presentations</small>
          </PageHeader>

          <Form horizontal onSubmit={(e) => this.signup(e)}>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Name
              </Col>
              <Col sm={10}>
                <FormControl type='text' className="form-control" id='signup-name' name="name" placeholder='Name' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Email
              </Col>
              <Col sm={10}>
                <FormControl type='email' id='signup-email' name="email" placeholder='Email' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Password
              </Col>
              <Col sm={10}>
                <FormControl type='password' id='signup-password' name="password" placeholder='Password' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Password Confirmation
              </Col>
              <Col sm={10}>
                <FormControl type='password' id='signup-password-confirmation' name="password-confirmation" placeholder='Password Confirmation' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col smOffset={2} sm={10}>
                <Button type="submit">
                  Sign Up
                </Button>
              </Col>
            </FormGroup>

          </Form>

          <Col smOffset={2} sm={10}>
            Already have an Account?{' '}
            <Link to='/login'>
              Login here.
            </Link>
          </Col>
        </Col>
      </div>
    )
  }
}

export default Signup