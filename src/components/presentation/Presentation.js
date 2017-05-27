import React from 'react'

class Presentation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [{
        caption: 'A lovely caption',
        url: 'http://loremflickr.com/640/300/cat'
      },
      {
        url: 'http://loremflickr.com/640/300/dog'
      },
      {
        caption: 'Another awesome caption',
        url: 'http://loremflickr.com/640/300/nature'
      },
      {
        url: 'http://loremflickr.com/640/300/rock'
      },
      {
        caption: 'Another awesome caption',
        url: 'http://loremflickr.com/640/300/paris'
      },
      {
        url: 'http://loremflickr.com/640/300/shoes'
      },
      {
        caption: 'Simple and awesome slideshow!',
        url: 'http://loremflickr.com/640/300/clothes'
      }]
    }
  }
  render() {
    return (
      <div>
        TEST
      </div>
    )
  }
}

export default Presentation
