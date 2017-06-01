import React from 'react'
import ReactDOM from 'react-dom'

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
  Table,
  ProgressBar,
  Popover
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
      originalPictures: [],
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
      uploading: false,
      uploadProgress: 0,
      audio: []
    }
    this.messagesEnd = null
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

      pictures.sort((a, b) => {
        return a.index - b.index
      })

      this.setState({
        pictures: pictures,
        originalPictures: pictures
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

    firebase.database().ref('/audio/' + this.props.match.params.id).on('value', snapshot => {
      let audio = []
      snapshot.forEach(aud => {
        audio.push(aud.val())
      })
      audio.sort((a, b) => {
        return a.index - b.index
      })
      this.setState({
        audio: audio
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

  // componentDidUpdate () {
  //   if (document.querySelector('.message-end')) {
  //     document.querySelector('.message-end').scrollIntoView(true)
  //   }
  // }

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
    // Get file
    let image = e.target.querySelector('#imageUpload-' + this.props.match.params.id).files[0]

    var reader = new window.FileReader()
    reader.addEventListener('load', () => {
    // reader.addEventListener('change', () => {
      let self = this

      fixOrientation(reader.result, { image: true }, function (fixed, newImage) {
        // Set new Picture ID
        let newPictureKey = firebase.database().ref().child('pictures').push().key

        // Create Storage ref
        let imageRef = firebase.storage().ref('images/' + newPictureKey)

        // Upload file
        let uploadTask = imageRef.putString(fixed, 'data_url')
        // let uploadTask = imageRef.putString(newImage.src, 'data_url')

        // Check progress and completion
        uploadTask.on('state_changed', function (snapshot) {
          let percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          console.log('Upload is ' + percent + '% done')
          // Progress Bar (State)
          self.setState({
            uploading: true,
            uploadProgress: percent
          })

        }, function (error) {
          alert(error)
        }, function () {
          // console.log('COMPLETED!')
          let url = uploadTask.snapshot.downloadURL
          // console.log('URL', url, uploadTask.snapshot)

          let albumInPictures = {}
          firebase.database().ref('/pictures/' + self.props.match.params.id).once('value', snapshot => {
            albumInPictures = snapshot.val() || {}
          })

          // Update Current Object of Album inside Pictures
          albumInPictures[newPictureKey] = {
            id: newPictureKey,
            index: self.state.originalPictures.length,
            url: url,
            uid: firebase.auth().currentUser.uid,
            owner: firebase.auth().currentUser.displayName,
            timestamp: Date.now()
          }

          let updates = {}
          updates['/pictures/' + self.props.match.params.id] = albumInPictures
          updates['/albums/' + self.props.match.params.id + '/pictures/' + newPictureKey] = true
          // updates['/albums/' + self.props.match.params.id + '/nextIndex/'] = self.state.album.nextIndex + 1
          // console.log('updates', updates)
          firebase.database().ref().update(updates)

          self.setState({
            uploading: false,
            uploadProgress: 0
          })
          window.location = `/albums/${self.props.match.params.id}`
        })
      })
    }, false)
    reader.readAsDataURL(image)
  }

  uploadAudio(e) {
    e.preventDefault()
    let self = this

    let title = e.target.querySelector('#audioTitle-' + self.props.match.params.id).value
    let audio = e.target.querySelector('#audioUpload-' + self.props.match.params.id).files[0]

    let newAudioKey = firebase.database().ref().child('audio').push().key

    let audioRef = firebase.storage().ref('audio/' + newAudioKey)

    let uploadTask = audioRef.put(audio)

    uploadTask.on('state_changed', function (snapshot) {
      let percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
      console.log('Upload is ' + percent + '% done')
      // Progress Bar (State)
      self.setState({
        uploading: true,
        uploadProgress: percent
      })
    }, function (error) {
      alert(error)
    }, function () {
      let url = uploadTask.snapshot.downloadURL
      let updates = {}
      updates['/audio/' + self.props.match.params.id + '/' + newAudioKey] = {
        id: newAudioKey,
        index: self.state.audio.length || 0,
        url: url,
        title: title,
        status: 'Paused',
        timestamp: Date.now()
      }

      updates['/albums/' + self.props.match.params.id + '/audio/' + newAudioKey] = true
      // console.log('UPDATES', updates)
      firebase.database().ref().update(updates)

      self.setState({
        uploading: false,
        uploadProgress: 0
      })

      window.location = `/albums/${self.props.match.params.id}`
    })
  }

  editAlbumDetail (e) {
    e.preventDefault()

    let updatedAlbum = this.state.album

    updatedAlbum.title = e.target.querySelector(`#edit-album-title-${this.props.match.params.id}`).value

    updatedAlbum.description = e.target.querySelector(`#edit-album-description-${this.props.match.params.id}`).value

    updatedAlbum.lastUpdate = Date.now()

    firebase.database().ref('/albums/' + this.props.match.params.id).set(updatedAlbum).then((data) => {
      console.log('Update Successful')
      window.location = '/albums/' + this.props.match.params.id
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
        console.log('Delete Picture Successful')
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
    e.target.querySelector(`#new-internal-message-${albumId}`).value = ''

    let updates = {}
    updates['/messages/' + albumId + '/' + newMessageKey] = newMessage
    firebase.database().ref().update(updates).then(() => {
      console.log('New Message Sent')
      if (document.querySelector('.message-end')) {
          document.querySelector('.message-end').scrollIntoView(true)
        }
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

  isContentOwner(content) {
    if (content.uid == firebase.auth().currentUser.uid) {
      return true
    } else {
      return false
    }
  }

  removeAdmin (e, user) {
    if (confirm('Removing this user as an organiser. OK to proceed?')) {
      e.preventDefault()
      // console.log('removing',user)
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

  removePending (e, email) {
    if (confirm('Removing this email. OK to proceed?')) {
      e.preventDefault()
      let updates = {}
      updates['/albums/' + this.props.match.params.id + '/pending/' + email.email.replace('.',' ')] = null
      updates['/pending/' + email.email.replace('.',' ') + '/' + this.props.match.params.id] = null
      firebase.database().ref().update(updates).then(() => {
        console.log('Successfully removed email')
      }).catch((err) => {
        alert(err)
      })
    }
  }

  newPending (e) {
    e.preventDefault()
    console.log(e.target.querySelector(`#new-pending-${this.props.match.params.id}`).value)
    let pendingEmail = e.target.querySelector(`#new-pending-${this.props.match.params.id}`).value
    e.target.querySelector(`#new-pending-${this.props.match.params.id}`).value = ''
    // Check if user exists
    firebase.database().ref('/users/').once('value').then(snapshot => {
      let users = []
      snapshot.forEach(user => {
        users.push(user.val())
      })
      console.log('pushed', users)
      let filteredList = users.filter(user => {
        return user.email == pendingEmail
      })
      console.log('filtered', filteredList)
      // If yes, add to participant
      if (filteredList.length > 0) {
        // let existingParticipants = this.state.album.participants
        // existingParticipants[filteredList[0].id] = true
        let updates = {}
        updates['/albums/' + this.props.match.params.id + '/participants/' + filteredList[0].id] = true
        updates['/users/' + filteredList[0].id + '/participating/' + this.props.match.params.id] = true
        console.log('MATCH', updates)
        firebase.database().ref().update(updates)
      } else {
        // If not, save email address to pending
        let updates = {}
        updates['/pending/' + pendingEmail.replace('.', ' ') + '/' + this.props.match.params.id] = true
        updates['/albums/' + this.props.match.params.id + '/pending/' + pendingEmail.replace('.', ' ')] = true
        console.log('NO MATCH', updates)
        firebase.database().ref().update(updates)
      }
    })
  }

  searchPictures(e) {
    e.preventDefault()
    let searchQueury = e.target.value.trim().toLowerCase()
    let searchLength = searchQueury.length
    let originalPictures = this.state.originalPictures
    let fiteredPictures = originalPictures.filter((album) => {
      return album.owner.toLowerCase().slice(0, searchLength) === searchQueury
    })
    this.setState({
      pictures: fiteredPictures
    })
  }

  sendPictureBefore(e, image) {
    e.preventDefault()

    let updates = {}
    if (image.index == 0) {

      let pictureToSwap = this.state.originalPictures.filter(picture => {
        if (picture.index == this.state.originalPictures.length - 1) {
          return picture
        }
      })

      updates['/pictures/' + this.props.match.params.id + '/' + image.id + '/index/'] = this.state.originalPictures.length - 1
      if (pictureToSwap.length > 0) {
        updates['/pictures/' + this.props.match.params.id + '/' + pictureToSwap[0].id + '/index/'] = image.index
      }

    } else {

      let pictureToSwap = this.state.originalPictures.filter(picture => {
        if (picture.index == image.index - 1) {
          return picture
        }
      })

      updates['/pictures/' + this.props.match.params.id + '/' + image.id + '/index/'] = image.index - 1
      if (pictureToSwap.length > 0) {
        updates['/pictures/' + this.props.match.params.id + '/' + pictureToSwap[0].id + '/index/'] = image.index
      }
    }
    // console.log('new index', updates)
    firebase.database().ref().update(updates)
  }

  sendPictureAfter(e, image) {
    e.preventDefault()
    let updates = {}
    if (image.index == this.state.originalPictures.length - 1) {

      let pictureToSwap = this.state.originalPictures.filter(picture => {
        if (picture.index == 0) {
          return picture
        }
      })

      updates['/pictures/' + this.props.match.params.id + '/' + image.id + '/index/'] = 0
      if (pictureToSwap.length > 0) {
        updates['/pictures/' + this.props.match.params.id + '/' + pictureToSwap[0].id + '/index/'] = image.index
      }
    } else {

      let pictureToSwap = this.state.originalPictures.filter(picture => {
        if (picture.index == image.index + 1) {
          return picture
        }
      })

      updates['/pictures/' + this.props.match.params.id + '/' + image.id + '/index/'] = image.index + 1
      if (pictureToSwap.length > 0) {
        updates['/pictures/' + this.props.match.params.id + '/' + pictureToSwap[0].id + '/index/'] = image.index
      }

    }
    // console.log('updates', updates)
    firebase.database().ref().update(updates)
  }

  stopAudio (e, aud) {
    let updates = {}
    updates['/audio/' + this.props.match.params.id + '/' + aud.id + '/status/'] = 'Paused'
    updates['/albums/' + this.props.match.params.id + '/audioPlaying'] = null
    firebase.database().ref().update(updates)
  }

  playAudio (e, aud) {
    if (this.state.album.audioPlaying) {
      alert(this.state.album.audioPlaying.title + ' is currently playing. Pause it before playing')
    } else {
      let updates = {}
      updates['/audio/' + this.props.match.params.id + '/' + aud.id + '/status/'] = 'Playing'
      updates['/albums/' + this.props.match.params.id + '/audioPlaying'] = aud
      firebase.database().ref().update(updates)
    }
  }

  onImageHover (e, pictureId) {
    e.preventDefault()
    let elementsToHide = document.querySelectorAll(`.hover-${pictureId}`)
    elementsToHide.forEach(element => {
      element.style.background = 'rgba(0, 0, 0, 0.2)'
      element.childNodes.forEach(child => {
        child.style.visibility = 'visible'
      })
    })
  }

  onImageOver (e, pictureId) {
    e.preventDefault()
    let elementsToHide = document.querySelectorAll(`.hover-${pictureId}`)
    elementsToHide.forEach(element => {
      element.style.background = 'rgba(0, 0, 0, 0)'
      element.childNodes.forEach(child => {
        child.style.visibility = 'hidden'
      })
    })
  }

  onTitleHover (e, albumId) {
    e.preventDefault()
    let elementsToHide = document.querySelector(`#description-${albumId}`)
    elementsToHide.style.display = 'unset'
  }

  onTitleOver (e, albumId) {
    e.preventDefault()
    let elementsToHide = document.querySelector(`#description-${albumId}`)
    elementsToHide.style.display = 'none'
  }

  changeInterval(e) {
    e.preventDefault()
    let updates = {}
    updates['/albums/' + this.props.match.params.id + '/presentationInterval/'] = e.target.value
    firebase.database().ref().update(updates)
  }

  render() {
    const masonryOptions = {
        transitionDuration: 0.8
    }

    let pictureList = this.state.pictures.map((picture, index) => {

      return (
        <div key={picture.id} className="picture-container">
          <Image src={picture.url} className="album-image" rounded/>

          <div className={["picture-image-cover-container", `hover-${picture.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, picture.id)} onMouseOut={(e) => this.onImageOver(e, picture.id)} onTouchStart={(e) => this.onImageHover(e, picture.id)} onTouchEnd={(e) => this.onImageOver(e, picture.id)}>

            <div className="picture-image-delete-container">
              {(this.state.organiser || this.isContentOwner(picture)) &&
              <Button onClick={(e) => this.deletePicture(e, picture.id)} bsStyle="link" className="picture-cover-text">
                Delete
              </Button>}
            </div>

            <div className="picture-image-owner-container">
              Dropped in by: {picture.owner}
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

          {(this.state.organiser || this.isContentOwner(message)) &&
          <Button onClick={(e) => this.deleteMessage(e, message.id)} bsStyle="link">
            Delete
          </Button>}

          <br></br><br></br>
        </div>
      )
    })

    if (document.querySelector('.message-end')) {
      document.querySelector('.message-end').scrollIntoView(true)
    }

    let pictureSettings = this.state.album.live ? 'Pause Pictures' : 'Play Pictures'

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

    let pending = []
    for (var key in this.state.album['pending']) {
      pending.push(key.replace(' ', '.'))
    }

    // MAP INTO TABLE OR ALL USER TO STATE???
    // console.log(organisers, participants, pending)

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

    let pendingList = pending.map((email, index) => {
      return (
        <tr key={email}>
          <td>{email}</td>
          <td>
            <Button bsStyle="danger" onClick={(e) => this.removePending(e, {email})}>
              Remove
            </Button>
          </td>
        </tr>
      )
    })

    let presentationImages = this.state.originalPictures.map((picture, index) => {
      return (
        <div className="presentation-image-settings-row">
          <Col sm={3}>
            <span className="presentation-image-index">Index: {picture.index}</span>
          </Col>
          <Col sm={3}>
            <div className="thumbnail-container">
              <Thumbnail src={picture.url} className="thumbnail"/>
            </div>
          </Col>
          <Col sm={3}>
            <div className="presentation-image-control">
              <Button bsStyle="primary" onClick={(e) => this.sendPictureBefore(e, picture)}>
                {'<'}
              </Button>
              <Button bsStyle="primary" onClick={(e) => this.sendPictureAfter(e, picture)}>
                {'>'}
              </Button>
            </div>
          </Col>
        </div>
      )
    })

    let audioList = this.state.audio.map((aud, index) => {
      return (
        <div className="presentation-audio-settings-row">
          <Col sm={4}>
            <span className="presentation-audio-font">
              Index: {aud.index}
            </span>
          </Col>
          <Col sm={4}>
            <div className="thumbnail-container">
              <span className="presentation-audio-font">
                {aud.title}
              </span>
            </div>
          </Col>
          <Col sm={4}>
            <div className="presentation-audio-control">
              {aud.status == 'Playing' ?
              <Button bsStyle="primary" onClick={(e) => this.stopAudio(e, aud)}>
                Stop
              </Button>
              :
              <Button bsStyle="primary" onClick={(e) => this.playAudio(e, aud)}>
                Play
              </Button>}
            </div>
          </Col>
        </div>
      )
    })

    return (
      <div>
        <Navbar />
        <Col sm={8} className="albums-display">
          <div>
            <PageHeader id={`title-${this.state.album.id}`}
              onMouseOver={(e) => this.onTitleHover(e, this.state.album.id)}
              onMouseOut={(e) => this.onTitleOver(e, this.state.album.id)}
              onTouchStart={(e) => this.onTitleHover(e, this.state.album.id)}
              onTouchEnd={(e) => this.onTitleOver(e, this.state.album.id)}>
              <strong>{this.state.album.title}</strong>{' '}
            </PageHeader>
            <p className='album-description' id={`description-${this.state.album.id}`}>
              {this.state.album.description}
            </p>
          </div>

          <div>
            <Form horizontal onChange={(e) => this.searchPictures(e)}>
              <FormGroup bsSize="large">
                <Col sm={12}>
                  <FormControl type='text' placeholder='Search Pictures by Author' />
                </Col>
              </FormGroup>
            </Form>
          </div>

          <ButtonToolbar>
            <Button bsStyle="primary" onClick={(e) => this.open(e, 'addNewPicture')}>
              Drop in a Photo
            </Button>
            <Button bsStyle="primary" onClick={(e) => this.open(e, 'showMessages')}>
              Messages
            </Button>
            {this.state.organiser &&
              <Button onClick={(e) => this.open(e, 'editDetails')}>
                Album Details
              </Button>}
            {this.state.organiser &&
              <Button onClick={(e) => this.open(e, 'pictureSettings')}>
                Live Stream
              </Button>}
            {this.state.organiser &&
              <Button onClick={(e) => this.open(e, 'participants')}>
                Users
              </Button>}
          </ButtonToolbar>
        </Col>

        <div className='picture-content-container'>
          <Col sm={8} className="albums-display">
            <Masonry
              className={'masonry'}
              elementType={'div'}
              options={masonryOptions}
              disableImagesLoaded={false}
              // updateOnEachImageLoad={false}
              updateOnEachImageLoad={true}
                >
              {pictureList}
            </Masonry>
          </Col>
        </div>

        <Modal show={this.state.showAddNewPicture} onHide={(e) => this.close(e, 'showAddNewPicture')}>
          <Modal.Header closeButton>
            <Modal.Title>Drop in a Photo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.uploading &&
              <div>
                <span>
                  Uploading Image. Please wait.
                </span>
                <ProgressBar active now={this.state.uploadProgress} label={`${this.state.uploadProgress}%`} />
              </div>}

              {/* <Popover
                placement="right"
                positionLeft={220}
                positionTop={30}
                title="iPhone Portrait Camera Captures">
                  Portrait Camera captures from iPhone are currently not supported. Upload portrait image from storage instead.
              </Popover> */}

              <Form horizontal onSubmit={(e) => this.uploadImage(e)}>
                <FormGroup bsSize="large">
                  <Col sm={12}>
                    <FormControl type='file' id={`imageUpload-${this.props.match.params.id}`} accept='image/*' required/>
                    {/* <FormControl type='file' id={`imageUpload-${this.props.match.params.id}`} accept='image/*' capture='camera' /> */}
                  </Col>
                </FormGroup>

                <br></br><br></br>
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
                <div className="message-end" ref={(el) => { this.messagesEnd = el }}></div>
              </div>
              <div className="message-form-container">
                <Form className="album-live-comment-form" onSubmit={(e) => this.newMessage(e, this.props.match.params.id)}>
                  <FormGroup>
                    <Col sm={12}>
                      <FormControl componentClass="textarea" placeholder="Drop a message..." id={`new-internal-message-${this.props.match.params.id}`} required/>
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
                    <FormControl type='text' id={`edit-album-title-${this.props.match.params.id}`} name="title" placeholder='Title' value={this.state.album.title} onChange={(e) => this.handleChangeDetail(e, 'title')} required/>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col componentClass={ControlLabel} sm={2}>
                    Description
                  </Col>
                  <Col sm={10}>
                    <FormControl componentClass='textarea' id={`edit-album-description-${this.props.match.params.id}`} name="description" placeholder='Description' value={this.state.album.description} onChange={(e) => this.handleChangeDetail(e, 'description')} required/>
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
            <Col sm={5} md={3}>
              <Button bsStyle="primary" onClick={(e) => this.presentationRedirect(e)}>
                Open Presentation Screen
              </Button>
            </Col>
            <div>
              <Tabs defaultActiveKey={'pictures'}>
                <Tab eventKey={'pictures'} title="Pictures">
                  <div className="settings-images">
                    <br></br><br></br>
                    <FormGroup bsSize="large">
                      <Col componentClass={ControlLabel} sm={12}>
                        Presentation Interval (pause picture before updating)
                      </Col>
                      <br></br>
                      <Col sm={12}>
                        <FormControl componentClass="select" value={this.state.album.presentationInterval}onChange={(e) => this.changeInterval(e)}>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                        </FormControl>
                      </Col>
                    </FormGroup>
                    <br></br>
                    <Col smOffset={0} sm={2}>
                      <Button bsStyle="primary" onClick={(e) => this.playPictures(e)}>
                        {pictureSettings}
                      </Button>
                    </Col>
                    {presentationImages}
                  </div>
                </Tab>

                <Tab eventKey={'audio'} title="Audio">
                  <div className="settings-images">
                    <h1 className="audio-header">Upload Audio</h1>
                    {this.state.uploading &&
                      <div>
                        <span>
                          Uploading Audio. Please wait.
                        </span>
                        <ProgressBar active now={this.state.uploadProgress} label={`${this.state.uploadProgress}%`} />
                      </div>}
                      <Form horizontal onSubmit={(e) => this.uploadAudio(e)}>
                        <FormGroup bsSize="large">
                          <Col sm={12}>
                            <FormControl type='text' id={`audioTitle-${this.props.match.params.id}`} placeholder= 'Title' required/>
                          </Col>
                        </FormGroup>
                        <FormGroup bsSize="large">
                          <Col sm={12}>
                            <FormControl type='file' id={`audioUpload-${this.props.match.params.id}`} accept='audio/*' required/>
                          </Col>
                        </FormGroup>
                        <Button bsStyle="primary" type="submit">
                          Upload
                        </Button>
                      </Form>
                      <br></br><br></br>
                  </div>

                  <h1 className="audio-header">Audio List</h1>
                  {audioList}

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
                  <div className="add-pending">
                    <Form inline onSubmit={(e) => this.newPending(e)}>
                      <FormGroup>
                        <FormControl type="email" placeholder="jane.doe@example.com" id={`new-pending-${this.props.match.params.id}`}/>
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
                      {pendingList}
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
