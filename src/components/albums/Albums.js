import React from 'react'

import {
  Link
} from 'react-router-dom'

import * as firebase from 'firebase'

import AlbumSearch from '../albumSearch/AlbumSearch'
import AlbumItem from '../albumItem/AlbumItem'

import Navbar from '../navbar/Navbar'

class Albums extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: '',
      pictures: ''
    }
  }

  componentDidMount() {
    firebase.database().ref('/albums').on('value', snapshot => {
      let albums = []
      snapshot.forEach(album => {
        albums.push(album.val())
      })
      this.setState({
        albums: albums
      })
    })

    firebase.database().ref('/pictures').on('value', snapshot => {
      let pictures = []
      snapshot.forEach(picture => {
        pictures.push(picture.val())
      })
      this.setState({
        pictures: pictures
      })
    })
  }

  render() {
    let albumItems = []
    if (this.state.albums.length > 0) {
      albumItems = this.state.albums.map((album, index) => {
        return (
          <div key={album.id}>
              <Link to={`/albums/${album.id}`}>
                {album.title}
              </Link>
          </div>
        )
      })
    }

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

        {albumItems}

        {/* <AlbumItem albums={this.state.albums} pictures={this.state.pictures}/> */}

      </div>
    )
  }
}

export default Albums
