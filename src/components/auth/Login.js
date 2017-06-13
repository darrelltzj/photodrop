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
  PageHeader,
  Image
 } from 'react-bootstrap'

import './auth.css'

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

        <Col smOffset={1} sm={5}>
          <a href="https://github.com/darrelltzj/photodrop">
            <Image src="http://i.imgur.com/PnyCMDs.gif" rounded className='intro-image'/>
          </a>
        </Col>

        <Col sm={5}>
          <div className='auth'>
          <PageHeader>
            <strong>Photodrop</strong>
            {' '}
            <small>Collect the Good Times</small>
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
                <Button type="submit" bsStyle="primary">
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
        </div>
        </Col>

      </div>
    )
  }
}

export default Login
