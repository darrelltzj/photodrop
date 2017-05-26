import React from 'react'
import * as firebase from 'firebase'

class MessagesDisplay extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // albumId: props.albumId,
      messages: props.messages,
    }
  }

  // componentDidMount () {
  //   console.log('TEST', this.props.albumId)
  //   // firebase.database().ref().on('value',snap=>{
  //   //   console.log('test', snap)
  //   // })
  //   firebase.database().ref('/messages/' + this.props.albumId).on('value', snapshot => {
  //     console.log('test', snapshot)
  //     let messages = []
  //     snapshot.forEach(message => {
  //       messages.push(message.val())
  //     })
  //     this.setState({
  //       messages: messages
  //     })
  //   })
  // }

  render () {
    console.log('===MESSAGES===', this.state.messages)
    // ---> album
    let albumIdArray = Object.keys(this.state.messages).filter((albumId, index) => {
      if (albumId == this.props.albumId) {
          return true
        }
    })[0]
    let messageList = []
    for (var key in this.state.messages[albumIdArray]) {
      messageList.push(this.state.messages[albumIdArray][key])
    }
    console.log('filtered', this.state.messages[albumIdArray])
    console.log('list', messageList)

    // NOW MAP IT


    // let messageList = this.state.messages.filter((message, index) => {
    //   console.log(this.props.albumId, 'message', message)
    //   if (this.props.albumId in message) {
    //     return true
    //   }
    // }).map((message, index) => {
    //   return (
    //     <div key={message.id}>
    //       <strong>{message.uid}</strong>{': '}{message.message}
    //     </div>
    //   )
    // })
    return (
      <div>Test</div>
    )
  }
}

export default MessagesDisplay
