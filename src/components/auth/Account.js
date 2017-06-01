import React from 'react'

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

class Account extends React.Component {
  constructor() {
    super()
    this.state = {
      currentUser: null,
      loggedIn: false
    }
  }

  componentDidMount () {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          currentUser: user
        })
      }
    })
  }

  handleNameChange(e) {
    let newName = e.target.value
    let currentUser = this.state.currentUser
    currentUser.displayName = newName
    this.setState({
      currentUser:currentUser
    })
  }

  handleEmailChange(e) {
    let newEmail = e.target.value
    let currentUser = this.state.currentUser
    currentUser.email = newEmail
    this.setState({
      currentUser:currentUser
    })
  }

  login (e) {
    e.preventDefault()
    const credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, e.target.querySelector('#reauth-password').value)

    firebase.auth().currentUser.reauthenticate(credential).then(() => {
      this.setState({
        loggedIn: true
      })
    }, function (error) {
      alert(error)
    })
  }

  updateAccount (e) {
    e.preventDefault()
    let newName = e.target.querySelector('#new-name').value
    let newEmail = e.target.querySelector('#new-email').value
    let newPassword = e.target.querySelector('#new-password').value
    let newPasswordConfirmation = e.target.querySelector('#new-password-confirmation').value

    if (newPassword != newPasswordConfirmation) {
      alert('New Passwords do not match.')
    } else if (newPassword.length <= 6) {
      alert('Password must be more than 6 characters long.')
    } else {
      firebase.auth().currentUser.updateProfile({
        displayName: newName
      }).then(function() {
        let updates = {}
        updates['/users/' + firebase.auth().currentUser.uid + '/name/'] = newName
        firebase.database().ref().update(updates)

        firebase.auth().currentUser.updateEmail(newEmail).then(function() {
          let updates = {}
          updates['/users/' + firebase.auth().currentUser.uid + '/email/'] = newEmail
          firebase.database().ref().update(updates)

          firebase.auth().currentUser.updatePassword(newPassword).then(function() {
            window.location = '/'
          }, function(error) {
            alert('Password Update Error: ', error)
          })
        }, function(error) {
          alert('Email Update Error: ', error)
        })
      }, function(error) {
        alert('Name Update Error: ', error)
      })
    }

  }


  render() {
    return (
      <div>
        <Navbar />
        <Col sm={8} className="albums-display">
          <PageHeader >
            <strong>Account</strong>
          </PageHeader>

          {!this.state.loggedIn && <Form horizontal onSubmit={(e) => this.login(e)}>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Password
              </Col>
              <Col sm={10}>
                <FormControl type='password' id='reauth-password' name="password" placeholder='Password' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col smOffset={2} sm={10}>
                <Button type="submit" bsStyle="primary">
                  Login
                </Button>
              </Col>
            </FormGroup>

          </Form>}

          {this.state.loggedIn && <Form horizontal onSubmit={(e) => this.updateAccount(e)}>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                New Name
              </Col>
              <Col sm={10}>
                <FormControl type='text' className="form-control" id='new-name' name="name" placeholder='Name' required value={this.state.currentUser.displayName} onChange={(e) => this.handleNameChange(e)}/>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                New Email
              </Col>
              <Col sm={10}>
                <FormControl type='email' id='new-email' name="email" placeholder='Email' required value={this.state.currentUser.email} onChange={(e) => this.handleEmailChange(e)}/>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                New Password
              </Col>
              <Col sm={10}>
                <FormControl type='password' id='new-password' name="update-password" placeholder='New Password' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Password Confirmation
              </Col>
              <Col sm={10}>
                <FormControl type='password' id='new-password-confirmation' name="password-confirmation" placeholder='Password Confirmation' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col smOffset={2} sm={10}>
                <Button type="submit" bsStyle="primary">
                  Update
                </Button>
              </Col>
            </FormGroup>

          </Form>}

        </Col>
      </div>
    )
  }
}

export default Account
