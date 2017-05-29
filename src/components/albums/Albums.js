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
import MessagesDisplay from '../messages/MessagesDisplay'

class Albums extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      albums: [],
      pictures: [],
      messages: {},
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
      this.setState({
        pictures: snapshot.val()
      })
    })

    firebase.database().ref('/messages/').on('value', snapshot => {
      this.setState({
        messages: snapshot.val()
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

  newAlbum (e) {
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
      requests: {'none': true},
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

  newMessage(e, albumId) {
    e.preventDefault()
    let userName = ''
    firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/name/').once("value", snapshot => {
      userName = snapshot.val()
    })

    let newMessageKey = firebase.database().ref('/messages/' + albumId).push().key
    let newMessage = {
      id: newMessageKey,
      uid: firebase.auth().currentUser.uid,
      userEmail: firebase.auth().currentUser.email,
      userName: userName,
      message: e.target.querySelector(`#new-message-${albumId}`).value,
      timestamp: Date.now()
    }
    let updates = {}
    updates['/messages/' + albumId + '/' + newMessageKey] = newMessage
    firebase.database().ref().update(updates).then(() => {
      console.log('New Message Sent')
    }).catch((err) => {
      alert(err)
    })
  }

  newRequest (e, album) {
    e.preventDefault()
    let updates = {}
    updates['/albums/' + album.id + '/participants/' + firebase.auth().currentUser.uid] = true
    updates['/users/' + firebase.auth().currentUser.uid + '/participating/' + album.id] = true
    firebase.database().ref().update(updates).then(() => {
      console.log('Updated Request')
    }).catch((err) => {
      alert(err)
    })
  }

  offRequest (e, album) {
    e.preventDefault()
    let updates = {}
    updates['/albums/' + album.id + '/participants/' + firebase.auth().currentUser.uid] = null
    updates['/users/' + firebase.auth().currentUser.uid + '/participating/' + album.id] = null
    firebase.database().ref().update(updates).then(() => {
      console.log('Updated Request')
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

        let albumId = Object.keys(this.state.messages).filter((albumId, index) => {
          if (albumId == album.id) {
              return true
            }
        })[0]

        let messageList = []
        for (var key in this.state.messages[albumId]) {
          messageList.push(this.state.messages[albumId][key])
        }

        let pictureList = []
        if (this.state.pictures[album.id]) {
          for (var key in this.state.pictures[album.id]) {
            pictureList.push(this.state.pictures[album.id][key])
          }
        } else {
          pictureList.push({id:'default', lastUpdate:'default', uid:'default', url:'http://i.imgur.com/UBshxxy.png'})
        }

        return (
          <div key={album.id}>

            <div className="album-content-container">
              <div className="album-image-container">

                <h2 className="album-title">
                  {album.title}
                </h2>

                <Button type="submit" bsStyle="link" onClick={(e) => this.offRequest(e, album)} className="album-request">
                  Unfollow
                </Button>

                <Link to={`/albums/${album.id}`}>
                  <Image src={pictureList[0].url} responsive className="album-image"/>
                </Link>

                <div className="album-live-comment-container">
                  <MessagesDisplay messages={messageList} albumId={album.id}/>
                </div>
              </div>

              <div className="album-live-comment-form-container">
                <Form className="album-live-comment-form" onSubmit={(e) => this.newMessage(e, album.id)}>
                  <FormGroup>
                    <Col sm={12}>
                    <FormControl componentClass="textarea" placeholder="Drop a message..." id={`new-message-${album.id}`}/>
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col sm={1}>
                    <Button type="submit" bsStyle="primary">
                      Submit
                    </Button>
                    </Col>
                  </FormGroup>
                </Form>
              </div>
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
    // MAY NOT NEED THIS !!!
    let albumsRequested = []
    if (this.state.albums.length > 0) {
      albumsRequested = this.state.albums.filter((album, index) => {
        if (firebase.auth().currentUser.uid in album.requests) {
          return true
        } else {
          return false
        }
      }).map((album, index) => {
        let pictureList = []
        if (this.state.pictures[album.id]) {
          for (var key in this.state.pictures[album.id]) {
            pictureList.push(this.state.pictures[album.id][key])
          }
        } else {
          pictureList.push({id:'default', lastUpdate:'default', uid:'default', url:'http://i.imgur.com/UBshxxy.png'})
        }
        return (
          <div key={album.id}>
            <div className="album-content-container">
              <div className="album-image-container">
                <h2 className="album-title">
                  {album.title}
                </h2>
                <Image src={pictureList[0].url} responsive className="album-image"/>
              </div>

              <div className="request-form-container">
                <Form className="request-form" onSubmit={(e) => this.offRequest(e, album)}>
                  <FormGroup>
                    <Col sm={1}>
                    <Button type="submit">
                      Requested
                    </Button>
                    </Col>
                  </FormGroup>
                </Form>
              </div>

            </div>
          </div>
        )
      })
    }

    let albumsOthers = []
    if (this.state.albums.length > 0) {
      albumsOthers = this.state.albums.filter((album, index) => {
        if (firebase.auth().currentUser.uid in album.organisers || firebase.auth().currentUser.uid in album.participants || firebase.auth().currentUser.uid in album.requests) {
          return false
        } else {
          return true
        }
      }).map((album,index) => {
        let pictureList = []
        if (this.state.pictures[album.id]) {
          for (var key in this.state.pictures[album.id]) {
            pictureList.push(this.state.pictures[album.id][key])
          }
        } else {
          pictureList.push({id:'default', lastUpdate:'default', uid:'default', url:'http://i.imgur.com/UBshxxy.png'})
        }

        return (
          <div key={album.id}>
            <div className="album-content-container">
              <div className="album-image-container">
                <h2 className="album-title">
                  {album.title}
                </h2>

                <Button type="submit" bsStyle="link" onClick={(e) => this.newRequest(e, album)} className="album-request">
                  Request
                </Button>

                <Image src={pictureList[0].url} responsive className="album-image"/>

                <div className="album-live-comment-container">
                  {album.description}
                </div>

              </div>

              {/* <div className="request-form-container">
                <Form className="request-form" onSubmit={(e) => this.newRequest(e, album)}>
                  <FormGroup>
                    <Col sm={1}>
                    <Button type="submit" bsStyle="primary">
                      Request
                    </Button>
                    </Col>
                  </FormGroup>
                </Form>
              </div> */}

            </div>
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
                <FormControl type='text' id='search-albums' name="search-albums" placeholder='Search Albums by Title' />
              </Col>
            </FormGroup>
          </Form>

          <Col sm={4} md={2}>
            <Button bsStyle="primary" onClick={(e) => this.open(e)}>
              Create Album
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
                {albumsRequested}
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
