import React from 'react'

import {
  Redirect
} from 'react-router'

import * as firebase from 'firebase'

import Navbar from '../navbar/Navbar'

class AlbumsNew extends React.Component {
  constructor () {
    super();
    this.state = {
      redirectSuccess: false,
      newAlbumKey: ''
    }
  }

  newAlbum(e) {
    e.preventDefault()
    let newAlbumKey = firebase.database().ref().child('albums').push().key
    let newAlbum = {
      id: newAlbumKey,
      title: e.target.querySelector('#new-album-title').value,
      description: e.target.querySelector('#new-album-description').value,
      lastUpdate: Date.now(),
      owner: '',
      organisers: [],
      participants: [],
      requests: [],
      live: false,
      pictures: [],
      default: ''
    }
    let updates = {}
    updates['/albums/' + newAlbumKey] = newAlbum
    firebase.database().ref().update(updates).then(() => {
      this.setState({
        redirectSuccess: true,
        newAlbumKey: newAlbumKey
      })
    }).catch((err) => {
      alert(err)
    })
  }

  render() {
    // console.log(Date(Date.now()))
    return (
      <div>
        <Navbar />

        <div>
          <form onSubmit={(e) => this.newAlbum(e)}>
            <label>
              Title
              <input type='text' id="new-album-title" name="title" placeholder='Title' />
            </label>
            <label>
              Description
              <input type='text' id="new-album-description" name="description" placeholder='Description' />
            </label>
            <button>Submit</button>
          </form>
        </div>

        {this.state.redirectSuccess && (
          <Redirect to={`/albums/${this.state.newAlbumKey}`}/>
        )}

      </div>
    )
  }
}

export default AlbumsNew
