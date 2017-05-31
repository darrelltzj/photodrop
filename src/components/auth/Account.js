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

class Account extends React.Component {
  constructor() {
    super()
    this.state = {
    }
  }

  componentDidMount () {

  }

  updateAccount (e) {

  }

  render() {
    return (
      <div>
        <Navbar />
        <Col sm={8} className="albums-display">
          <PageHeader >
            <strong>Account</strong>
          </PageHeader>

          <Form horizontal onSubmit={(e) => this.updateAccount(e)}>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Name
              </Col>
              <Col sm={10}>
                <FormControl type='text' className="form-control" id='signup-name' name="name" placeholder='Name' required />
              </Col>
            </FormGroup>

            {/* <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Email
              </Col>
              <Col sm={10}>
                <FormControl type='email' id='signup-email' name="email" placeholder='Email' required />
              </Col>
            </FormGroup> */}

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
                New Password
              </Col>
              <Col sm={10}>
                <FormControl type='password' id='update-password' name="update-password" placeholder='New Password' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col componentClass={ControlLabel} sm={2}>
                Password Confirmation
              </Col>
              <Col sm={10}>
                <FormControl type='password' id='update-password-confirmation' name="password-confirmation" placeholder='Password Confirmation' required />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col smOffset={2} sm={10}>
                <Button type="submit" bsStyle="primary">
                  Update
                </Button>
              </Col>
            </FormGroup>

          </Form>

        </Col>
      </div>
    )
  }
}

export default Account
