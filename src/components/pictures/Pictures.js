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
  Image
 } from 'react-bootstrap'

import Masonry from 'react-masonry-component'

import Navbar from '../navbar/Navbar'

class Pictures extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      album: '',
      pictures: [],
      messages: [],
      showAddNewPicture: false,
      showMessages: false,
      showEditDetails: false,
      showPictureSettings: false,
      showParticipants: false
    }
  }

  componentDidMount () {
    firebase.database().ref('/albums/' + this.props.match.params.id).on('value', snapshot => {
      let album = snapshot.val()
      this.setState({
        album: album
      })
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
    let image = e.target.querySelector('#imageUpload').files[0]
    // Set new Picture ID
    let newPictureKey = firebase.database().ref().child('pictures').push().key

    // create storage ref
    // Change Picture Name to ID
    let imageNameArray = image.name.split('.')
    let type = imageNameArray[imageNameArray.length - 1]
    let imageRef = firebase.storage().ref('images/' + newPictureKey + '.' + type)

    // CHECK FOR PICTURE FILES ONLY

    //upload file
    let task = imageRef.put(image)
    // update progress
    task.on('state_changed',
      function progress(snapshot) {
        console.log('Progress: ', snapshot)
      },
      function error(err) {
        console.log('Error: ', err)
      },
      function complete() {
        console.log('Completed: ', task)
        imageRef.getDownloadURL().then((url) => {
          // GET Current Object of Album inside Pictures
          let albumInPictures = {}
          firebase.database().ref('/pictures/' + this.props.match.params.id).once('value', snapshot => {
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
          let picturesInAlbum = this.state.album.pictures || {}
          // Update Current Object of Pictures inside Album
          picturesInAlbum[newPictureKey] = true

          let updates = {}
          updates['/pictures/' + this.props.match.params.id] = albumInPictures
          updates['/albums/' + this.props.match.params.id + '/pictures/'] = picturesInAlbum

          firebase.database().ref().update(updates)
          // REDIRECT
        })
      }.bind(this)
    )
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

  render() {
    const masonryOptions = {
        transitionDuration: 0.8
    }

    let pictureList = this.state.pictures.map((picture, index) => {
      return (
        <div key={picture.id} className="picture-container">
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

    return (
      <div>
        <Navbar />
        <Col sm={8} className="albums-display">
        <div>
          <PageHeader>
            <strong>{this.state.album.title}</strong>{' '}
            <small>{this.state.album.description}</small>
          </PageHeader>
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
          <Button onClick={(e) => this.open(e, 'editDetails')}>
            Edit Details
          </Button>
          <Button onClick={(e) => this.open(e, 'pictureSettings')}>
            Picture Settings
          </Button>
          <Button onClick={(e) => this.open(e, 'participants')}>
            Participants
          </Button>
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
            <Form horizontal onSubmit={(e) => this.uploadImage(e)}>

              <FormGroup bsSize="large">
                <Col sm={12}>
                  <FormControl type='file' id='imageUpload' accept='image/*' capture='camera' />
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
        </Modal>

        <Modal bsSize="large" show={this.state.showPictureSettings} onHide={(e) => this.close(e, 'showPictureSettings')}>
          <Modal.Header closeButton>
            <Modal.Title>Picture Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button bsStyle="link">
              Live
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e, 'showPictureSettings')}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        <Modal bsSize="large" show={this.state.showParticipants} onHide={(e) => this.close(e, 'showParticipants')}>
          <Modal.Header closeButton>
            <Modal.Title>Participants</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e, 'showParticipants')}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        {/* <div>
          <Link to={`/albums/${this.props.match.params.id}/requests`}>Requests</Link>{' | '}
          <Link to={`/albums/${this.props.match.params.id}/settings`}>Settings</Link>{' | '}
          <Link to={`/albums/${this.props.match.params.id}/live`}>Live</Link>
        </div>

        <div>
          <Link to={`/albums/${this.state.albums.map(album => {
            return album.id
          })}/pictures_new`}>
            <button>
              +
            </button>
          </Link>
        </div> */}

      </div>
    )
  }
}

export default Pictures
