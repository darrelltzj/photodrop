import React from 'react'

const AlbumItem = (props) => {


  let albumlist = props.albums.map((album, index) => {

    return (
      <li key={index}>
        <p>{album.title}</p>
        <img key={index} src={
          props.pictures.filter((picture, index) => {
            return picture.album_id === album.id
          }).sort(function (a, b) {
            return b.votes - a.votes
          })[0].img
        } alt="album"/>
      </li>
    )

  })

  return (
    <ul>
      {albumlist}
    </ul>
  )

}

export default AlbumItem
