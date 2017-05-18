import React from 'react'

import AlbumSearch from '../albumSearch/AlbumSearch'
import AlbumItem from '../albumItem/AlbumItem'

class Albums extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: [
        {
          id: 1,
          audio: '',
          title: 'Some person\'s Wedding',
          description: 'Test Album'
        },
        {
          id: 2,
          audio: '',
          title: 'Another person\'s Wedding',
          description: 'Test Album'
        }
      ],
      pictures: [
        {
          id: 1,
          album_id: 1,
          img: 'http://i.imgur.com/G0na8bl.jpg',
          caption: 'Test Caption 1',
          votes: 1
        },
        {
          id: 2,
          album_id: 1,
          img: 'http://i.imgur.com/fi10aiX.jpg',
          caption: 'Test Caption 2',
          votes: 0
        },
        {
          id: 3,
          album_id: 2,
          img: 'http://i.imgur.com/xRtK2ea.jpg',
          caption: 'Test Caption 3',
          votes: 1
        }
      ]
    }
  }

  render() {
    return (
      <div>
        <h1>Albums</h1>
        <AlbumSearch handleSearch={(e) => this.movieSearch(e)} />
        <AlbumItem albums={this.state.albums} pictures={this.state.pictures}/>
      </div>
    )
  }
}

export default Albums
