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
  Tabs,
  Tab,
  PageHeader,
  Modal
 } from 'react-bootstrap'

import Navbar from '../navbar/Navbar'

class Albums extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      albums: [],
      pictures: [],
      user: '',
      key: 'participating',
      showModal: false
    }
  }

  componentDidMount () {
    firebase.database().ref('/albums').on('value', snapshot => {
      let albums = []
      snapshot.forEach(album => {
        albums.push(album.val())
      })
      this.setState({
        albums: albums
      })
    })

    firebase.database().ref('/pictures').on('value', snapshot => {
      let pictures = []
      snapshot.forEach(picture => {
        pictures.push(picture.val())
      })
      this.setState({
        pictures: pictures
      })
    })

    if (firebase.auth().currentUser) {
      firebase.database().ref('/users/' + firebase.auth().currentUser.uid).on('value', snapshot => {
        console.log('reading', snapshot.val())
        // let user = ''
        // snapshot.forEach(user => {
        //   user.push(user.val())
        // })
        this.setState({
          user: snapshot.val()
        })
      })
    }
  }

  handleAlbumSelect (key) {
    // alert('selected ' + key)
    this.setState({
      key: key
    })
  }

  close () {
    this.setState({ showModal: false })
  }

  open () {
    this.setState({ showModal: true })
  }

  newAlbum(e) {
    e.preventDefault()

    let newAlbumKey = firebase.database().ref().child('albums').push().key
    let newAlbum = {
      id: newAlbumKey,
      title: e.target.querySelector('#new-album-title').value,
      description: e.target.querySelector('#new-album-description').value,
      lastUpdate: Date.now(),
      owner: firebase.auth().currentUser.uid,
      organisers: [{'uid': firebase.auth().currentUser.uid}],
      participants: [{'uid': firebase.auth().currentUser.uid}],
      requests: [],
      live: false,
      pictures: [],
      current: 0,
      default: 0
    }

    let userOrganising = []
    let userParticipating = []

    if (firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/organising')) {
      userOrganising = firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/organising').val()
    }
    if (firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/participating')) {
      userParticipating = firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/participating').val()
    }

    console.log('TEST', userOrganising, userParticipating)

    let updates = {}
    updates['/albums/' + newAlbumKey] = newAlbum
    updates['/users/' + firebase.auth().currentUser.uid + '/organising/'] = userOrganising.concat([{album_id: firebase.auth().currentUser.uid}])
    updates['/users/' + firebase.auth().currentUser.uid + '/participating/'] = userParticipating.concat([{album_id: firebase.auth().currentUser.uid}])

    firebase.database().ref().update(updates).then(() => {
      window.location = '/albums/' + newAlbumKey
    }).catch((err) => {
      alert(err)
    })
  }

  render () {
    if(firebase.auth().currentUser) {
      console.log(firebase.auth().currentUser.uid)
    }
    console.log('TEST', this.state.user)

    // FILTER THIS TO 3...
    let albumItems = []
    if (this.state.albums.length > 0) {
      albumItems = this.state.albums.map((album, index) => {
        return (
          <div key={album.id}>
            <Link to={`/albums/${album.id}`}>
              <PageHeader>
                <small>{album.title}</small>
              </PageHeader>
            </Link>
          </div>
        )
      })
    }

    return (
      <div>
        <Navbar />

        <Col sm={8} className="albums-display">

        <PageHeader>
          <strong>Albums</strong>
        </PageHeader>

        {/* <p>{this.state.key}</p> */}

        <Form horizontal onChange={(e) => this.search(e)}>
          <FormGroup bsSize="large">
            <Col sm={12}>
              <FormControl type='text' id='search-albums' name="search-albums" placeholder='Search Albums' />
            </Col>
          </FormGroup>
        </Form>

        <Col sm={4} md={2}>
          <Button bsStyle="primary" onClick={(e) => this.open(e)}>
            Create New Album
          </Button>
        </Col>

        <Tabs defaultActiveKey={this.state.key} onSelect={(e) => this.handleAlbumSelect(e)}>

          <Tab eventKey={'participating'} title="Participating">
            <div>
              {albumItems}
            </div>
          </Tab>

          <Tab eventKey={'organising'} title="Organising">

          </Tab>

          <Tab eventKey={'others'} title="Others">

          </Tab>

        </Tabs>

        {/* <AlbumItem albums={this.state.albums} pictures={this.state.pictures}/> */}
        </Col>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Album</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <Form horizontal onSubmit={(e) => this.newAlbum(e)}>
                <FormGroup>
                  <Col componentClass={ControlLabel} sm={2}>
                    Title
                  </Col>
                  <Col sm={10}>
                    <FormControl type='text' id="new-album-title" name="title" placeholder='Title' required/>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col componentClass={ControlLabel} sm={2}>
                    Description
                  </Col>
                  <Col sm={10}>
                    <FormControl componentClass='textarea' id="new-album-description" name="description" placeholder='Description' required/>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col smOffset={10} sm={1}>
                    <Button type="submit" bsStyle="primary">
                      Submit
                    </Button>
                  </Col>
                </FormGroup>

              </Form>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e)}>Cancel</Button>
          </Modal.Footer>
        </Modal>

      </div>
    )
  }
}

export default Albums
