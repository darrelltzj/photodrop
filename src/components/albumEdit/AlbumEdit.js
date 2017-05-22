import React from 'react'

import {
  Redirect
} from 'react-router-dom'

import * as firebase from 'firebase'

import Navbar from '../navbar/Navbar'

class AlbumEdit extends React.Component {
  constructor (props) {
    super(props)
    this.state = ({
      redirectSuccess: false,
      redirectToUrl: '/',
      album: ''
    })
  }

  componentDidMount() {
    firebase.database().ref('/albums/' + this.props.match.params.id).once('value').then(snapshot => {
      let album = snapshot.val()
      this.setState({
        album: album
      })
    })
  }

  // componentDidUpdate() {
  //   console.log('current state', this.state)
  // }

  handleChange (e, type) {
    e.preventDefault()
    let editingAlbum = this.state.album
    if (type === 'title') {
      editingAlbum.title = e.target.value
    } else if (type === 'description') {
      editingAlbum.description = e.target.value
    }
    this.setState({
      album: editingAlbum
    })
  }

  editAlbum (e) {
    e.preventDefault()

    let updatedAlbum = this.state.album

    updatedAlbum.title = e.target.querySelector(`#edit-album-title-${this.props.match.params.id}`).value

    updatedAlbum.description = e.target.querySelector(`#edit-album-description-${this.props.match.params.id}`).value

    updatedAlbum.lastUpdate = Date.now()

    firebase.database().ref('/albums/' + this.props.match.params.id).set(updatedAlbum).then((data) => {
      this.setState({
        redirectToUrl: `/albums/${this.props.match.params.id}`,
        redirectSuccess: true
      })
    })
  }

  deleteAlbum (e) {
    if (confirm('Deleting this album will delete the pictures along with it. OK to proceed?')) {
      e.preventDefault()
      let updates = {}
      updates['/albums/' + this.props.match.params.id] = null
      updates['/pictures/' + this.props.match.params.id] = null
      firebase.database().ref().update(updates).then(() => {
        this.setState({
          redirectToUrl: '/',
          redirectSuccess: true
        })
      }).catch((err) => {
        alert(err)
      })
    } else {
      return false
    }
  }

  render() {
    return (
      <div>
        <Navbar />
        <div>
          <form onSubmit={(e) => this.editAlbum(e)}>

            <label>
              Title
              <input type='text' id={`edit-album-title-${this.props.match.params.id}`} name="title" placeholder='Title' value={this.state.album.title} onChange={(e) => this.handleChange(e, 'title')}/>
            </label>

            <label>
              Description
              <input type='text' id={`edit-album-description-${this.props.match.params.id}`} name="description" placeholder='Description' value={this.state.album.description} onChange={(e) => this.handleChange(e, 'description')}/>
            </label>

            <button>Update</button>
          </form>

          <form onSubmit={(e) => this.deleteAlbum(e)}>
            <button>Delete</button>
          </form>

        </div>

        {this.state.redirectSuccess &&
          <Redirect to={this.state.redirectToUrl}/>
        }
      </div>
    )
  }
}

export default AlbumEdit
