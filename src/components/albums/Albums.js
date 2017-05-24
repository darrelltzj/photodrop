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
  Modal,
  Image
 } from 'react-bootstrap'

import Navbar from '../navbar/Navbar'

class Albums extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      albums: [],
      pictures: [],
      // currentUserUid: firebase.auth().currentUser.uid || '',
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
  }

  handleAlbumSelect (key) {
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
    let currentUserUid = firebase.auth().currentUser.uid

    let newAlbumKey = firebase.database().ref().child('albums').push().key
    let newAlbumOrganisers = {}
    newAlbumOrganisers[currentUserUid] = true
    let newAlbumParticipants = {}
    newAlbumParticipants[currentUserUid] = true
    let newAlbum = {
      id: newAlbumKey,
      title: e.target.querySelector('#new-album-title').value,
      description: e.target.querySelector('#new-album-description').value,
      lastUpdate: Date.now(),
      owner: currentUserUid,
      organisers: newAlbumOrganisers,
      participants: newAlbumParticipants,
      requests: {},
      live: false,
      pictures: {},
      current: {},
      default: {}
    }

    let updates = {}
    updates['/albums/' + newAlbumKey] = newAlbum
    updates['/users/' + currentUserUid + '/organising/' + newAlbumKey] = true
    updates['/users/' + currentUserUid + '/participating/' + newAlbumKey] = true

    firebase.database().ref().update(updates).then(() => {
      window.location = '/albums/' + newAlbumKey
    }).catch((err) => {
      alert(err)
    })
  }

  render () {
    let albumsParticipating = []
    if (this.state.albums.length > 0) {
      albumsParticipating = this.state.albums.filter((album, index) => {
        if (firebase.auth().currentUser.uid in album.participants) {
          return true
        }
      }).map((album,index) => {
        return (
          <div key={album.id}>
            <Link to={`/albums/${album.id}`}>
              <PageHeader>
                <small>{album.title}</small>
              </PageHeader>
            </Link>
            <div className="album-content-container">
              <div className="album-image-container">
                <Image src="http://i.imgur.com/UBshxxy.png" responsive className="album-image"/>
              </div>
              <Form inline className="album-live-comment">
                <FormGroup controlId="formInlineName">
                  <FormControl type="text" placeholder="Add a live comment..." />
                </FormGroup>
                <FormGroup controlId="formInlineName">
                  <Button type="submit" bsStyle="primary">
                    Submit
                  </Button>
                </FormGroup>
              </Form>
            </div>

          </div>
        )
      })
    }

    let albumsOrganising = []
    if (this.state.albums.length > 0) {
      albumsOrganising = this.state.albums.filter((album, index) => {
        if (firebase.auth().currentUser.uid in album.organisers) {
          return true
        }
      }).map((album,index) => {
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

    // NEED TO FILTER REQUESTS
    // let albumsRequestd = []
    let albumsOthers = []
    if (this.state.albums.length > 0) {
      albumsOthers = this.state.albums.filter((album, index) => {
        if (firebase.auth().currentUser.uid in album.organisers || firebase.auth().currentUser.uid in album.participants) {
          return false
        } else {
          return true
        }
      }).map((album,index) => {
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
              <div className="albums-container">
                {albumsParticipating}
              </div>
            </Tab>

            <Tab eventKey={'organising'} title="Organising">
              <div>
                {albumsOrganising}
              </div>
            </Tab>

            <Tab eventKey={'others'} title="Others">
              <div>
                {albumsOthers}
              </div>
            </Tab>

          </Tabs>
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
