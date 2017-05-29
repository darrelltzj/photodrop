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
  ButtonToolbar,
  PageHeader,
  Modal,
  Image,
  Tabs,
  Tab,
  Thumbnail,
  Table
 } from 'react-bootstrap'

import Masonry from 'react-masonry-component'

import Navbar from '../navbar/Navbar'

var fixOrientation = require('fix-orientation')

class Pictures extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      album: {},
      pictures: [],
      messages: [],
      showAddNewPicture: false,
      showMessages: false,
      showEditDetails: false,
      showPictureSettings: false,
      showParticipants: false,
      currentUserUid: null,
      organiser: false,
      participant: false,
      isOwner: false,
      image: null,
      imagePath: null
    }
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // console.log('firebaseAuth', user.uid)
        this.setState({
          currentUserUid: user.uid
        })
        // console.log('setting state', this.state.currentUserUid)

        firebase.database().ref('/users/' + user.uid + '/organising').on('value', snapshot => {
          if (snapshot.val()) {
            if (this.props.match.params.id in snapshot.val()) {
              this.setState({
                organiser: true
              })
            }
          }
        })

        firebase.database().ref('/users/' + user.uid + '/participating').on('value', snapshot => {
          if (snapshot.val()) {
            if (this.props.match.params.id in snapshot.val()) {
              this.setState({
                participant: true
              })
            } else {
              window.location = '/'
            }
          } else {
            window.location = '/'
          }
        })

      } else {
        // console.log('firebaseAuth', user)
        this.setState({
          currentUserUid: null,
          organiser: false,
          participant: false
        })
        // console.log('setting state', this.state.currentUserUid)
      }
    })
  }

  componentDidMount () {
    firebase.database().ref('/albums/' + this.props.match.params.id).on('value', snapshot => {
      let album = snapshot.val()
      this.setState({
        album: album,
      })
      // console.log('owner!!!',snapshot.val().owner)
      if (firebase.auth().currentUser.uid == snapshot.val().owner) {
        this.setState({
          isOwner: true
        })
      }
    })

    firebase.database().ref('/pictures/' + this.props.match.params.id).on('value', snapshot => {
      let pictures = []
      snapshot.forEach(picture => {
        pictures.push(picture.val())
      })
      this.setState({
        pictures: pictures
      })
    })

    firebase.database().ref('/messages/' + this.props.match.params.id).on('value', snapshot => {
      let messages = []
      snapshot.forEach(message => {
        messages.push(message.val())
      })
      this.setState({
        messages: messages
      })
    })
  }

  open (e, selection) {
    if (selection == 'addNewPicture') {
      this.setState({
        showAddNewPicture: true
      })
    } else if (selection == 'showMessages') {
      this.setState({
        showMessages: true
      })
    } else if (selection == 'editDetails') {
      this.setState({
        showEditDetails: true
      })
    } else if (selection == 'pictureSettings') {
      this.setState({
        showPictureSettings: true
      })
    } else if (selection == 'participants') {
      this.setState({
        showParticipants: true
      })
    }
  }

  close (e, selection) {
    // HANDLE RESET STATE
    this.setState({
      showAddNewPicture: false,
      showMessages: false,
      showEditDetails: false,
      showPictureSettings: false,
      showParticipants: false
    })
    if (selection == 'showEditDetails') {
      firebase.database().ref('/albums/' + this.props.match.params.id).on('value', snapshot => {
        let album = snapshot.val()
        this.setState({
          album: album
        })
      })
    }
  }

  uploadImage (e) {
    e.preventDefault()

    // get file
    let image = e.target.querySelector('#imageUpload-' + this.props.match.params.id).files[0]

    var reader = new window.FileReader()
    reader.addEventListener('load', () => {
      let self = this
      fixOrientation(reader.result, { image: true }, function (fixed, newImage) {

        console.log('fixed', fixed)
        console.log('newImage', newImage)
        self.setState({
          image: fixed,
          imagePath: newImage.src
        })

        // Set new Picture ID
        let newPictureKey = firebase.database().ref().child('pictures').push().key

        // create storage ref
        let imageRef = firebase.storage().ref('images/' + newPictureKey)

        //upload file
        let task = imageRef.putString(newImage.src, 'data_url').then(function(snapshot) {

          console.log('Uploaded a data_url string!',snapshot)

          imageRef.getDownloadURL().then((url) => {
            // GET Current Object of Album inside Pictures
            let albumInPictures = {}
            firebase.database().ref('/pictures/' + self.props.match.params.id).once('value', snapshot => {
              albumInPictures = snapshot.val() || {}
            })

            // Update Current Object of Album inside Pictures
            albumInPictures[newPictureKey] = {
              id: newPictureKey,
              url: url,
              uid: firebase.auth().currentUser.uid,
              lastUpdate: Date.now()
            }

            // GET Current Object of Pictures inside Album
            // let picturesInAlbum = self.state.album.pictures || {}
            // Update Current Object of Pictures inside Album
            // picturesInAlbum[newPictureKey] = true

            let updates = {}
            updates['/pictures/' + self.props.match.params.id] = albumInPictures
            updates['/albums/' + self.props.match.params.id + '/pictures/' + newPictureKey] = true

            firebase.database().ref().update(updates)
          })

        })

      })
    })
    reader.readAsDataURL(image)

    // // Set new Picture ID
    // let newPictureKey = firebase.database().ref().child('pictures').push().key
    // // create storage ref
    // // Change Picture Name to ID
    // let imageNameArray = image.name.split('.')
    // let type = imageNameArray[imageNameArray.length - 1]
    // let imageRef = firebase.storage().ref('images/' + newPictureKey + '.' + type)
    //
    // // CHECK FOR PICTURE FILES ONLY
    //
    // //upload file
    // let task = imageRef.put(image)
    // // update progress
    // task.on('state_changed',
    //   function progress(snapshot) {
    //     console.log('Progress: ', snapshot)
    //   },
    //   function error(err) {
    //     console.log('Error: ', err)
    //   },
    //   function complete() {
    //     console.log('Completed: ', task)
    //     imageRef.getDownloadURL().then((url) => {
    //       // GET Current Object of Album inside Pictures
    //       let albumInPictures = {}
    //       firebase.database().ref('/pictures/' + this.props.match.params.id).once('value', snapshot => {
    //         albumInPictures = snapshot.val() || {}
    //       })
    //       // Update Current Object of Album inside Pictures
    //       albumInPictures[newPictureKey] = {
    //         id: newPictureKey,
    //         url: url,
    //         uid: firebase.auth().currentUser.uid,
    //         lastUpdate: Date.now()
    //       }
    //
    //       // GET Current Object of Pictures inside Album
    //       let picturesInAlbum = this.state.album.pictures || {}
    //       // Update Current Object of Pictures inside Album
    //       picturesInAlbum[newPictureKey] = true
    //
    //       let updates = {}
    //       updates['/pictures/' + this.props.match.params.id] = albumInPictures
    //       updates['/albums/' + this.props.match.params.id + '/pictures/'] = picturesInAlbum
    //
    //       firebase.database().ref().update(updates)
    //       // REDIRECT
    //     })
    //   }.bind(this)
    // )

  }

  editAlbumDetail (e) {
    e.preventDefault()

    let updatedAlbum = this.state.album

    updatedAlbum.title = e.target.querySelector(`#edit-album-title-${this.props.match.params.id}`).value

    updatedAlbum.description = e.target.querySelector(`#edit-album-description-${this.props.match.params.id}`).value

    updatedAlbum.lastUpdate = Date.now()

    firebase.database().ref('/albums/' + this.props.match.params.id).set(updatedAlbum).then((data) => {
      console.log('Update Successful')
    }).catch((err) => {
      alert(err)
    })
  }

  handleChangeDetail (e, type) {
    e.preventDefault()
    let editingAlbum = this.state.album
    if (type === 'title') {
      editingAlbum.title = e.target.value
    } else if (type === 'description') {
      editingAlbum.description = e.target.value
    }
    this.setState({
      album: editingAlbum
    })
  }

  deleteAlbumDetail (e) {
    if (confirm('Deleting this album is irriversible. OK to proceed?')) {
      e.preventDefault()
      let updates = {}
      updates['/albums/' + this.props.match.params.id] = null
      updates['/pictures/' + this.props.match.params.id] = null

      // NEED A FOR LOOP TO REMOVE album from each user's organising / participating / requests OR Remove album id in user
      updates['/users/' + firebase.auth().currentUser.uid + '/organising/' + this.props.match.params.id] = null
      updates['/users/' + firebase.auth().currentUser.uid + '/participating/' + this.props.match.params.id] = null

      firebase.database().ref().update(updates).then(() => {
        window.location = '/'
      }).catch((err) => {
        alert(err)
      })
    } else {
      return false
    }
  }

  deletePicture (e, pictureId) {
    if (confirm('Deleting this picture is irriversible. OK to proceed?')) {
      e.preventDefault()
      let updates = {}
      updates['/albums/' + this.props.match.params.id + '/pictures/' + pictureId] = null
      updates['/pictures/' + this.props.match.params.id + '/' + pictureId] = null
      // NEED TO CHECK HOW TO PREVENT CLOSING THE MODAL
      firebase.database().ref().update(updates).then(() => {
        console.log('Delete Message Successful')
      }).catch((err) => {
        alert(err)
      })
    } else {
      return false
    }
  }

  deleteMessage (e, messageId) {
    if (confirm('Deleting this picture is irriversible. OK to proceed?')) {
      e.preventDefault()

      console.log(this.state.messages, messageId)

      let updates = {}
      updates['/messages/' + this.props.match.params.id + '/' + messageId] = null
      firebase.database().ref().update(updates).then(() => {
        console.log('Delete Message Successful')
      }).catch((err) => {
        alert(err)
      })
    } else {
      return false
    }
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
      message: e.target.querySelector(`#new-internal-message-${albumId}`).value,
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

  presentationRedirect (e) {
    e.preventDefault()
    window.open(('/albums/' + this.props.match.params.id + '/presentation/'), '_blank').requestFullScreen
  }

  playPictures (e) {
    e.preventDefault()
    let album = this.state.album
    let updates = {}
    if (this.state.album.live) {
      updates['/albums/' + this.props.match.params.id + '/live'] = false
      album['live'] = false
      this.setState({
        album: album
      })
      // console.log(this.state.album.live)
    } else {
      updates['/albums/' + this.props.match.params.id + '/live'] = true
      album['live'] = true
      this.setState({
        album: album
      })
      // console.log(this.state.album.live)
    }
    firebase.database().ref().update(updates).then(() => {
      console.log('Updated Pictures Status')
    }).catch((err) => {
      alert(err)
    })
  }

  isOwner(user) {
    if (user.id == this.state.album.owner) {
      return true
    } else {
      return false
    }
  }

  isOrganiser(user) {
    if (user.id in this.state.album.organisers) {
      return true
    } else {
      return false
    }
  }

  removeAdmin (e, user) {
    if (confirm('Removing this user as an organiser. OK to proceed?')) {
      e.preventDefault()
      console.log('removing',user)
      let updates = {}
      updates['/albums/' + this.props.match.params.id + '/organisers/' + user.user.id] = null
      updates['/users/' + user.user.id + '/organising/' + this.props.match.params.id] = null
      firebase.database().ref().update(updates).then(() => {
        console.log('Successfully removed admin')
        window.location = '/albums/' + this.props.match.params.id
      }).catch((err) => {
        alert(err)
      })
    }
  }

  makeAdmin (e, user) {
    e.preventDefault()
    let updates = {}
    updates['/albums/' + this.props.match.params.id + '/organisers/' + user.user.id] = true
    updates['/users/' + user.user.id + '/organising/' + this.props.match.params.id] = true
    firebase.database().ref().update(updates).then(() => {
      console.log('Successfully made user admin')
    }).catch((err) => {
      alert(err)
    })
  }

  removeParticipant (e, user) {
    if (confirm('Removing this user is irriversible. OK to proceed?')) {
      e.preventDefault()
      let updates = {}
      updates['/albums/' + this.props.match.params.id + '/participants/' + user.user.id] = null
      updates['/users/' + user.user.id + '/participating/' + this.props.match.params.id] = null
      firebase.database().ref().update(updates).then(() => {
        console.log('Successfully removed user')
        window.location = '/albums/' + this.props.match.params.id
      }).catch((err) => {
        alert(err)
      })
    }
  }

  render() {
    const masonryOptions = {
        transitionDuration: 0.8
    }

    let pictureList = this.state.pictures.map((picture, index) => {

      return (
        <div key={picture.id} className="picture-container">

          {/* {img} */}

          <Image src={picture.url} className="album-image" rounded/>

          <div className="picture-image-cover-container">
            <div className="picture-image-delete-container">
              <Button onClick={(e) => this.deletePicture(e, picture.id)} bsStyle="link">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )
    })

    let messageList = this.state.messages.map((message, index) => {
      let timestamp = Date(message.timestamp)
      return (
        <div key={message.id}>
          <strong>{message.userName}</strong>
          <br></br>
          {message.message}
          <br></br>
          <small>{timestamp}</small>
          <Button onClick={(e) => this.deleteMessage(e, message.id)} bsStyle="link">
            Delete
          </Button>
          <br></br><br></br>
        </div>
      )
    })

    let pictureSettings = this.state.album.live ? 'Pause Pictures' : 'Play Pictures'

    // let user = {}

    let organisers = []
    for (var key in this.state.album['organisers']) {
      firebase.database().ref('/users/' + key).on('value', snapshot => {
        organisers.push(snapshot.val())
      })
    }

    let participants = []
    for (var key in this.state.album['participants']) {
      firebase.database().ref('/users/' + key).on('value', snapshot => {
        participants.push(snapshot.val())
      })
    }

    // FIND PENDING top
    let requests = []
    for (var key in this.state.album['requests']) {
      firebase.database().ref('/users/' + key).on('value', snapshot => {
        if (snapshot.val()) {
          requests.push(snapshot.val())
        }
      })
    }

    // MAP INTO TABLE OR ALL USER TO STATE???
    console.log(organisers, participants, requests)

    let organisersList = organisers.map((user, index) => {
      return (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          {!this.isOwner(user) &&
            <td>
              <Button bsStyle="danger" onClick={(e) => this.removeAdmin(e, {user})}>
                Remove Organiser
              </Button>
            </td>}
        </tr>
      )
    })

    let participantsList = participants.map((user, index) => {
      return (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          {(!this.isOwner(user) && !this.isOrganiser(user)) &&
          <td>
            <Button bsStyle="primary" onClick={(e) => this.makeAdmin(e, {user})}>
              Set as Organiser
            </Button>
          </td>}
          {(!this.isOwner(user) && !this.isOrganiser(user)) &&
          <td>
            <Button bsStyle="danger" onClick={(e) => this.removeParticipant(e, {user})}>
              Remove User
            </Button>
          </td>}
        </tr>
      )
    })

    return (
      <div>
        <Navbar />
        <Col sm={8} className="albums-display">
          <div>
            <PageHeader>
              <strong>{this.state.album.title}</strong>{' '}
            </PageHeader>
            <p>{this.state.album.description}</p>
          </div>

          <div>
            <Form horizontal onChange={(e) => this.search(e)}>
              <FormGroup bsSize="large">
                <Col sm={12}>
                  <FormControl type='text' placeholder='Search Pictures of Author' />
                </Col>
              </FormGroup>
            </Form>
          </div>

          <ButtonToolbar>
            <Button bsStyle="primary" onClick={(e) => this.open(e, 'addNewPicture')}>
              Add Picture
            </Button>
            <Button bsStyle="primary" onClick={(e) => this.open(e, 'showMessages')}>
              Messages
            </Button>
            {this.state.organiser &&
              <Button onClick={(e) => this.open(e, 'editDetails')}>
                Edit Details
              </Button>}
            {this.state.organiser &&
              <Button onClick={(e) => this.open(e, 'pictureSettings')}>
                Picture Settings
              </Button>}
            {this.state.organiser &&
              <Button onClick={(e) => this.open(e, 'participants')}>
                Users
              </Button>}
          </ButtonToolbar>

          <div className='picture-content-container'>
            <Masonry
              className={'masonry'}
              elementType={'div'}
              options={masonryOptions}
              disableImagesLoaded={false}
              updateOnEachImageLoad={false}
                >
              {pictureList}
            </Masonry>
          </div>
        </Col>

        <Modal show={this.state.showAddNewPicture} onHide={(e) => this.close(e, 'showAddNewPicture')}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Picture</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img src={this.state.imagePath} />
            <Form horizontal onSubmit={(e) => this.uploadImage(e)}>

              <FormGroup bsSize="large">
                <Col sm={12}>
                  <FormControl type='file' id={`imageUpload-${this.props.match.params.id}`} accept='image/*' capture='camera' />
                </Col>
              </FormGroup>

              <Button bsStyle="primary" type="submit">
                Submit
              </Button>

            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e, 'showAddNewPicture')}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        <Modal bsSize="large" container={this} aria-labelledby="contained-modal-title" show={this.state.showMessages} onHide={(e) => this.close(e, 'showMessages')}>
          <Modal.Header closeButton>
            <Modal.Title>Messages</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="overall-message-container">
              <div className="message-container">
                {messageList}
              </div>
              <div className="message-form-container">
                <Form className="album-live-comment-form" onSubmit={(e) => this.newMessage(e, this.props.match.params.id)}>
                  <FormGroup>
                    <Col sm={12}>
                    <FormControl componentClass="textarea" placeholder="Add a live message..." id={`new-internal-message-${this.props.match.params.id}`}/>
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
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e, 'showMessages')}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        {this.state.organiser &&
        <Modal show={this.state.showEditDetails} onHide={(e) => this.close(e, 'showEditDetails')}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <Form horizontal onSubmit={(e) => this.editAlbumDetail(e)}>
                <FormGroup>
                  <Col componentClass={ControlLabel} sm={2}>
                    Title
                  </Col>
                  <Col sm={10}>
                    <FormControl type='text' id={`edit-album-title-${this.props.match.params.id}`} name="title" placeholder='Title' value={this.state.album.title} onChange={(e) => this.handleChangeDetail(e, 'title')}/>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col componentClass={ControlLabel} sm={2}>
                    Description
                  </Col>
                  <Col sm={10}>
                    <FormControl componentClass='textarea' id={`edit-album-description-${this.props.match.params.id}`} name="description" placeholder='Description' value={this.state.album.description} onChange={(e) => this.handleChangeDetail(e, 'description')}/>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col smOffset={10} sm={1}>
                    <Button type="submit" bsStyle="primary">
                      Update
                    </Button>
                  </Col>
                </FormGroup>
              </Form>

              <Form horizontal onSubmit={(e) => this.deleteAlbumDetail(e)}>
                <FormGroup>
                  <Col smOffset={10} sm={1}>
                    <Button type="submit" bsStyle="danger">
                      Delete
                    </Button>
                  </Col>
                </FormGroup>
              </Form>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e, 'showEditDetails')}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>}

        {this.state.organiser &&
        <Modal bsSize="large" show={this.state.showPictureSettings} onHide={(e) => this.close(e, 'showPictureSettings')}>
          <Modal.Header closeButton>
            <Modal.Title>Picture Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button bsStyle="primary" onClick={(e) => this.playPictures(e)}>
              {pictureSettings}
            </Button>
            <Button bsStyle="primary">
              Play Audio
            </Button>
            <Button bsStyle="link" onClick={(e) => this.presentationRedirect(e)}>
              Open Presentation Screen
            </Button>
            <div>
              <Tabs defaultActiveKey={'pictures'}>
                <Tab eventKey={'pictures'} title="Pictures">
                  <div className="settings-images">
                    <Col sm={4}>
                    <div>
                      <Thumbnail src="https://firebasestorage.googleapis.com/v0/b/yoursincerely-3ee90.appspot.com/o/images%2F-KkzDdceW3h1zQ4AJOxv.png?alt=media&token=56ae9a38-5bce-4bbf-a70e-d434e6485804" className="thumbnail"/>
                      <Button bsStyle="primary">
                      {'<'}
                      </Button>
                      <Button bsStyle="primary">
                        {'>'}
                      </Button>
                    </div>
                  </Col>
                  </div>
                </Tab>

                <Tab eventKey={'audio'} title="Audio">
                  <div>
                    <div>
                      Audio Name
                      <Button bsStyle="primary">
                        Play
                      </Button>
                    </div>
                  </div>
                </Tab>
              </Tabs>

            </div>

          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e, 'showPictureSettings')}>Cancel</Button>
          </Modal.Footer>
        </Modal>}

        {this.state.organiser &&
        <Modal bsSize="large" show={this.state.showParticipants} onHide={(e) => this.close(e, 'showParticipants')}>
          <Modal.Header closeButton>
            <Modal.Title>Users</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <Tabs defaultActiveKey={'organisers'}>
              <Tab eventKey={'organisers'} title="Organisers">
                <div>
                  <Table striped bordered condensed hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {organisersList}
                    </tbody>
                  </Table>
                </div>
              </Tab>

              <Tab eventKey={'participants'} title="Participants">
                <div>
                  <Table striped bordered condensed hover>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {participantsList}
                    </tbody>
                  </Table>
                </div>
              </Tab>

              <Tab eventKey={'pending'} title="Pending">
                <div>
                  <div>
                    <Form inline>
                      <FormGroup controlId="formInlineEmail">
                        <FormControl type="email" placeholder="jane.doe@example.com" />
                      </FormGroup>
                      {' '}
                      <Button type="submit" bsStyle="primary">
                        Add User
                      </Button>
                    </Form>
                  </div>
                  <Table striped bordered condensed hover>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>darrelltzj@gmail.com</td>
                        <td>
                          <Button bsStyle="danger">
                            Remove
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Tab>
            </Tabs>

          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e, 'showParticipants')}>Cancel</Button>
          </Modal.Footer>
        </Modal>}

      </div>
    )
  }

}

export default Pictures