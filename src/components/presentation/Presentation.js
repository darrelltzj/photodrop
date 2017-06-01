import React from 'react'
import ReactDOM from 'react-dom'

import * as firebase from 'firebase'

import {
  Image
 } from 'react-bootstrap'

import ReactAudioPlayer from 'react-audio-player'
import ReactPlayer from 'react-player'

class Presentation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pictures: [],
      messages: [],
      audio: [],
      currentUserUid: null,
      organiser: false
    }
    this.images = []
    this.index = 0

    this.messagesTimer = 5
    this.messages = null

    this.total = this.images.length
		this.timer = null
    this.messagesEnd = null
    this.playPictures = false
    this.interval = 4000
    // this.action()
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
      // console.log(this.playPictures)
    })

    firebase.database().ref('/audio/' + this.props.match.params.id).on('value', snapshot => {
      let audio = []
      snapshot.forEach(aud => {
        audio.push(aud.val())
      })
      this.setState({
        audio: audio
      })
    })
  }

  componentDidUpdate () {
    firebase.database().ref('/albums/' + this.props.match.params.id + '/presentationInterval').on('value', snapshot => {
      this.interval = snapshot.val() * 1000 || 4000
    })
    // console.log('updating')
    // Set new image order
    this.setImages()
    this.setMessages()
    // Check for live - to start or stop
    this.stopStart()
  }

  // launchFullScreen (element) {
  //   console.log('FULL')
  //   if (element.requestFullScreen) {
  //     element.requestFullScreen()
  //   } else if (element.mozRequestFullScreen) {
  //     element.mozRequestFullScreen()
  //   } else if (element.webkitRequestFullScreen) {
  //     element.webkitRequestFullScreen()
  //   }
  // }

  setImages(e) {
    // console.log('updatingAgain')
    this.images = document.querySelector(`#album-${this.props.match.params.id}-presentation`).querySelectorAll('.presentation-image')
  }

  setMessages(e) {
    this.messages = document.querySelector(`#album-${this.props.match.params.id}-presentation`).querySelector('.presentation-message-container')
    this.messagesTimer = 5
    this.messages.style.opacity = 1
    // console.log('UPDATING', this.messages);
  }

  slideTo(index) {
    let currentImage = this.images[index]
    // console.log('CURRENT IMAGE',currentImage)
    currentImage.style.opacity = 1
    for(var i = 0; i < this.images.length; i++) {
      let slide = this.images[i]
      if(slide !== currentImage) {
        slide.style.opacity = 0
      }
    }
    if (this.messagesTimer < 1 || !this.timer) {
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
        // console.log('INDEX', self.index)
        // console.log('MessageTimer', self.messagesTimer)
        self.slideTo(self.index)
      }, self.interval || 4000)
    }
  }

  stopStart () {
    let self = this
    // console.log(self.timer)
    if (self.playPictures) {
      self.action()
    } else {
      clearInterval(self.timer)
      self.timer = null
      self.slideTo(self.index)
    }
  }

  fullScreen () {
    var el = document.documentElement
    var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen
    rfs.call(el)
  }

  render() {
    // this.launchFullScreen(document.documentElement)

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

    let audioSelected = this.state.audio.filter((audio, index) => {
      if (audio.status == 'Playing') {
        return true
      } else {
        return false
      }
    })[0]

    // console.log(audioSelected)

    // console.log('playing')
    return (
      <div className="presentation-container" id={`album-${this.props.match.params.id}-presentation`} onLoad={(e) => this.setImages(e)} onClick={(e) => this.fullScreen(e)}>
        {/* <div className="presentation-images-container"> */}
          {pictureList}
          <div className="presentation-message-container">
            {messageList[messageList.length - 1]}
            <div className="message-end" ref={(el) => { this.messagesEnd = el }}></div>
          </div>

          <ReactPlayer
            url={audioSelected ? audioSelected.url : null} playing={audioSelected ? true : false}
            loop={true}/>

        {/* </div> */}
      </div>
    )
  }
}

export default Presentation
