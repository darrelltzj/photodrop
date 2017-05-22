import React from 'react'

import {
  Link
} from 'react-router-dom'

import Navbar from '../navbar/Navbar'

class AlbumSettings extends React.Component {
  constructor() {
    super()
    this.state = {
      albums: [],
      pictures: []
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        <Link to={`/albums/${this.props.match.params.id}/edit`}>
          Edit Album
        </Link>
      </div>
    )
  }
}

export default AlbumSettings
