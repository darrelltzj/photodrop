import React from 'react'
import ReactDOM from 'react-dom'

import * as firebase from 'firebase'

import {
  Image
 } from 'react-bootstrap'

class Presentation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pictures: [],
      messages: [],
      currentUserUid: null,
      organiser: false
    }
    this.images = []
    this.index = 0

    this.messagesTimer = 3
    this.messages = null

    this.total = this.images.length
		this.timer = null
    this.messagesEnd = null
    this.playPictures = false
    this.action()
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
        })
        // console.log('setting state', this.state.currentUserUid)
      }
    })
  }

  componentDidMount () {
    firebase.database().ref('/pictures/' + this.props.match.params.id).on('value', snapshot => {
      let pictures = []
      snapshot.forEach(picture => {
        pictures.push(picture.val())
      })

      pictures.sort((a, b) => {
        return a.index - b.index
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

    firebase.database().ref('/albums/' + this.props.match.params.id + '/live').on('value', snapshot => {
      this.playPictures = snapshot.val()
      console.log(this.playPictures)
    })
  }

  componentDidUpdate () {
    // console.log('updating')
    // Set new image order
    this.setImages()
    this.setMessages()
    // Check for live - to start or stop
    this.stopStart()
  }

  setImages(e) {
    // console.log('updatingAgain')
    this.images = document.querySelector(`#album-${this.props.match.params.id}-presentation`).querySelectorAll('.presentation-image')
  }

  setMessages(e) {
    this.messages = document.querySelector(`#album-${this.props.match.params.id}-presentation`).querySelector('.presentation-message-container')
    this.messagesTimer = 3
    this.messages.style.opacity = 1
    console.log('UPDATING', this.messages);
  }

  slideTo(index) {
    let currentImage = this.images[index]
    currentImage.style.opacity = 1

    for(var i = 0; i < this.images.length; i++) {
      let slide = this.images[i]
      if(slide !== currentImage) {
        slide.style.opacity = 0
      }
    }

    if (this.messagesTimer < 1) {
      this.messages.style.opacity = 0
    }

  }

  action () {
    let self = this

    if (!self.timer) {

      self.timer = setInterval(function () {
        self.index++
        self.messagesTimer--
        if(self.index == self.images.length) {
          self.index = 0
        }

        console.log('INDEX', self.index)
        console.log('MessageTimer', self.messagesTimer)

        self.slideTo(self.index)
      }, 3000)

    }

  }

  stopStart () {
    let self = this
    console.log(self.timer)
    if (self.playPictures) {
      self.action()
    } else {
      clearInterval(self.timer)
      self.timer = null
    }
  }

  render() {
    let pictureList = this.state.pictures.map((picture, index) => {
      return (
        <Image src={picture.url} key={picture.id} className="presentation-image" id={picture.index} />
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
          <br></br><br></br>
        </div>
      )
    })

    if (document.querySelector('.message-end')) {
      document.querySelector('.message-end').scrollIntoView(true)
    }

    return (
      <div className="presentation-container" id={`album-${this.props.match.params.id}-presentation`} onLoad={(e) => this.setImages(e)}>
        {/* <div className="presentation-images-container"> */}
          {pictureList}
          <div className="presentation-message-container">
            {messageList}
            <div className="message-end" ref={(el) => { this.messagesEnd = el }}></div>
          </div>
        {/* </div> */}
      </div>
    )
  }
}

export default Presentation
