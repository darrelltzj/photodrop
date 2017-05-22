import React from 'react'

import {
  Redirect
} from 'react-router'

import * as firebase from 'firebase'

import Navbar from '../navbar/Navbar'

class AlbumEdit extends React.Component {
  constructor (props) {
    super(props)
    this.state = ({
      redirectSuccess: false,
      // redirectToUrl: '/',
      album: props.albums.filter(album => {
        return album.id == props.match.params.id
      })[0] || ''
    })
  }

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

  componentDidUpdate() {
    console.log('current state', this.state)
  }

  editAlbum (e) {
    e.preventDefault()

    let updatedAlbum = this.state.album

    updatedAlbum.title = e.target.querySelector(`#edit-album-title-${this.props.match.params.id}`).value,

    updatedAlbum.description = e.target.querySelector(`#edit-album-description-${this.props.match.params.id}`).value,
    updatedAlbum.lastUpdate = Date.now()

    firebase.database().ref('/albums/' + this.props.match.params.id).set(updatedAlbum).then((data) => {
      console.log('front', data)
    })

    console.log(this.state)

    this.setState({
      redirectSuccess: true
    })

    console.log(this.state)
  }

  deleteAlbum (e) {
    e.preventDefault()
    let updates = {}
    updates['/albums/' + this.props.match.params.id] = null
    updates['/pictures/' + this.props.match.params.id] = null
    firebase.database().ref().update(updates).then(() => {
      this.setState({
        redirectSuccess: true
        // redirectToUrl: '/'
      })
    }).catch((err) => {
      alert(err)
    })
  }

  render() {
    console.log('render',this.props)
    // console.log(this.state.redirectToUrl)
    return (
      <div>

        <Navbar />

        <div>

          {/* <form onSubmit={(e) => this.editAlbum(e)}> */}
          <form onSubmit={(e, album) => this.props.editAlbum (e, this.state.album)}>

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
          <Redirect to='/'/>
        }

      </div>
    )
  }
}

export default AlbumEdit
