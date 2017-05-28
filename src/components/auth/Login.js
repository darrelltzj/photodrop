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
        <Col sm={6}>
          <PageHeader>
            <strong>Photodrop</strong>
            {' '}
            <small>Photo Sharing Presentations</small>
          </PageHeader>

          <Form horizontal onSubmit={(e) => this.login(e)}>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Email
              </Col>
              <Col sm={10}>
                <FormControl type='email' id='login-email' name="email" placeholder='Email' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Password
              </Col>
              <Col sm={10}>
                <FormControl type='password' id='login-password' name="password" placeholder='Password' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col smOffset={2} sm={10}>
                <Button type="submit">
                  Login
                </Button>
              </Col>
            </FormGroup>

          </Form>

          <Col smOffset={2} sm={10}>
            Don't have an Account yet?{' '}
            <Link to='/signup'>
              Sign up here.
            </Link>
          </Col>
        </Col>

      </div>
    )
  }
}

export default Login
