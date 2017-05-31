import React from 'react'
import * as firebase from 'firebase'

class MessagesDisplay extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: props.messages
    }
  }

  render () {
    let messageList = this.state.messages.map((message, index) => {
      let timestamp = Date(message.timestamp)
      return (
        <div key={message.id}>
          <strong>{message.userName}</strong>
          <br></br>
          <p>{message.message}</p>
          <br></br>
          <small>{timestamp}</small>
          <br></br><br></br>
        </div>
      )
    })

    return (
      <div>
        {messageList}
      </div>
    )
  }
}

export default MessagesDisplay
