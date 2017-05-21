import React from 'react'

import {
  Link
} from 'react-router-dom'

import Navbar from '../navbar/Navbar'

class Pictures extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      albums: props.albums.filter(album => {
        return album.id == this.props.match.params.id
      }),
      pictures: props.pictures.filter(picture => {
        return picture.album_id == this.props.match.params.id
      })
    }
    console.log(this.state.albums)
  }

  render() {
    let pictureList = this.state.pictures.map((picture, index) => {
      return (
        <div key={picture.id}>
          <img src={picture.img}/>
        </div>
      )
    })

    let header = this.state.albums.map((album, index) => {
      return (
        <div key={album.id}>
          <h1>
            {album.title}
          </h1>
          <h2>
            {album.description}
          </h2>
        </div>
      )
    })

    return (
      <div>
        <Navbar />
        {header}

        <div>
          <Link to={`/albums/${this.props.match.params.id}/requests`}>Requests</Link>{' | '}
          <Link to={`/albums/${this.props.match.params.id}/settings`}>Settings</Link>{' | '}
          <Link to={`/albums/${this.props.match.params.id}/live`}>Live</Link>
        </div>

        <div>
          <form>
            <input type='text' placeholder='Search' />
            <select>
              <option value='owner'>Owner</option>
              <option value='tag'>Tag</option>
            </select>
          </form>
        </div>

        <div>
          <Link to={`/albums/${this.state.albums.map(album => {
            return album.id
          })}/pictures_new`}>
            <button>
              +
            </button>
          </Link>
        </div>

        <div>
          {pictureList}
        </div>
      </div>
    )
  }
}

export default Pictures
