import React from 'react'

import {
  Link
} from 'react-router-dom'

const AlbumItem = (props) => {
  let albumsWithPictures = props.pictures.map((picture, index) => {
    return picture.album_id
  })
  let albumlist = props.albums.map((album, index) => {
    if (albumsWithPictures.includes(album.id)) {
      return (
        <div key={album.id}>
          <div>
            <Link to={`/albums/${album.id}`}>
              {album.title}
            </Link>
          </div>
          <img src={
            props.pictures.filter((picture, index) => {
              return picture.album_id === album.id
            }).sort(function (a, b) {
              return b.votes - a.votes
            })[0].img
          } alt='album' />
        </div>
      )
    } else {
      return (
        <div key={album.id}>
          <div>
            <Link to={`/albums/${album.id}`}>
              {album.title}
            </Link>
          </div>
        </div>
      )
    }
  })

  return (
      <div>
        {albumlist}
      </div>
  )
}

export default AlbumItem
