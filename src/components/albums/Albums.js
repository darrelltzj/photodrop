import React from 'react'

import {
  Link
} from 'react-router-dom'

import AlbumSearch from '../albumSearch/AlbumSearch'
import AlbumItem from '../albumItem/AlbumItem'

import Navbar from '../navbar/Navbar'

class Albums extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: props.albums,
      pictures: props.pictures
    }
  }

  render() {
    return (
      <div>
        <Navbar />

        <h1>Albums</h1>

        <AlbumSearch handleSearch={(e) => this.albumSearch(e)} />

        <Link to={`/albums_new`}>
          <button>
            New Album
          </button>
        </Link>

        <AlbumItem albums={this.state.albums} pictures={this.state.pictures}/>

      </div>
    )
  }
}

export default Albums
