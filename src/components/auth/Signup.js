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

class Signup extends React.Component {
  constructor() {
    super()
    this.state = {
      pending: {}
    }
  }

  componentDidMount () {
    firebase.database().ref('/pending/').on('value', snapshot => {
      this.setState({
        pending: snapshot.val() || {}
      })
    })
  }

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

        let albumsPending = {}
        let participating = {}
        let updates = {}

        if (Object.keys(this.state.pending).length !== 0) {
          if (emailSignup.replace('.', ' ') in this.state.pending) {
            albumsPending = this.state.pending[emailSignup.replace('.', ' ')]
          }
          for (var key in albumsPending) {
            participating[key] = true
            updates['/albums/' + key + '/participants/' + user.uid] = true
            updates['/albums/' + key + '/pending/' + user.email.replace('.', ' ')] = null
          }
        }

        let newUser = {
          id: user.uid,
          name: nameSignup,
          email: user.email,
          organising: {},
          participating: participating
        }

        updates['/users/' + user.uid] = newUser
        updates['/pending/' + user.email.replace('.', ' ')] = null

        console.log('UPDATES', updates)

        firebase.database().ref().update(updates)

        // firebase.database().ref('/users/' + user.uid).set(newUser)

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

        <Col smOffset={1} sm={5}>
          <a href="https://github.com/darrelltzj/photodrop">
            <Image src="http://i.imgur.com/PnyCMDs.gif" rounded className='intro-image'/>
          </a>
        </Col>

        <Col sm={5}>
          <div className='auth-signup'>
          <PageHeader>
            <strong>Photodrop</strong>
            {' '}
            <small>Collect the Good Times</small>
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
                <Button type="submit" bsStyle="primary">
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
        </div>
        </Col>
      </div>
    )
  }
}

export default Signup
