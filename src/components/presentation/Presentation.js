import React from 'react'

import * as firebase from 'firebase'

import {
  Image
 } from 'react-bootstrap'

class Presentation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pictures: [],
      messages: []
    }
    this.images = []
    this.index = 0
    this.total = this.images.length
		this.timer = null
    this.action()
  }

  componentDidMount () {
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

  setImages(e) {
    this.images = document.querySelector(`#album-${this.props.match.params.id}-presentation`).querySelectorAll('.presentation-image')
    // console.log(this.images, this.index)
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
  }

  action () {
    let self = this

    self.timer = setInterval(function () {
      self.index++
      if(self.index == self.images.length) {
        self.index = 0
      }

      // console.log('IMAGE INDEX: ', self.index)

      self.slideTo(self.index)
    }, 3000)
  }

  render() {
    let pictureList = this.state.pictures.map((picture, index) => {
      return (
        <Image src={picture.url} key={picture.id} className="presentation-image" />
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

    console.log('messages', messageList)

    return (
      <div className="presentation-container" id={`album-${this.props.match.params.id}-presentation`} onLoad={(e) => this.setImages(e)}>
        <div className="presentation-images-container">
          {pictureList}
          <div className="album-live-comment-container">
          {messageList[messageList.length - 1]}
          </div>
        </div>
      </div>
    )
  }
}

export default Presentation
