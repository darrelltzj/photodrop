import React from 'react'
// import ReactDOM from 'react-dom'

import {
  Link
} from 'react-router-dom'

import * as firebase from 'firebase'

import {
  Form,
  FormGroup,
  Col,
  FormControl,
  ControlLabel,
  Button,
  Tabs,
  Tab,
  PageHeader,
  Modal,
  Image,
  Popover
 } from 'react-bootstrap'

// import Autosuggest from 'react-autosuggest'

import Navbar from '../navbar/Navbar'
import MessagesDisplay from '../messages/MessagesDisplay'

class Albums extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      albums: [],
      originalAlbums: [],
      pictures: {},
      messages: {},
      // currentUserUid: firebase.auth().currentUser.uid || '',
      key: 'participating',
      showModal: false,
      isParticipating: false
    }
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase.database().ref('/users/' + user.uid + '/participating').on('value', snapshot => {
          if (snapshot.val()) {
            this.setState({
              isParticipating: true
            })
          }
        })
      }
    })
  }

  componentDidMount () {
    firebase.database().ref('/albums').on('value', snapshot => {
      let albums = []
      snapshot.forEach(album => {
        albums.push(album.val())
      })
      albums.sort((a, b) => {
        if(a.title < b.title) return -1
        if(a.title > b.title) return 1
        return 0
      })
      // console.log('ALBUMS', albums);
      this.setState({
        albums: albums,
        originalAlbums: albums
      })
    })

    firebase.database().ref('/pictures').on('value', snapshot => {
      this.setState({
        pictures: snapshot.val() || {}
      })
    })

    firebase.database().ref('/messages/').on('value', snapshot => {
      this.setState({
        messages: snapshot.val() || {}
      })
    })
  }

  handleAlbumSelect (key) {
    this.setState({
      key: key
    })
  }

  close () {
    this.setState({ showModal: false })
  }

  open () {
    this.setState({ showModal: true })
  }

  newAlbum (e) {
    e.preventDefault()
    let currentUserUid = firebase.auth().currentUser.uid

    let newAlbumKey = firebase.database().ref().child('albums').push().key
    let newAlbumOrganisers = {}
    newAlbumOrganisers[currentUserUid] = true
    let newAlbumParticipants = {}
    newAlbumParticipants[currentUserUid] = true
    let newAlbum = {
      id: newAlbumKey,
      title: e.target.querySelector('#new-album-title').value,
      description: e.target.querySelector('#new-album-description').value,
      lastUpdate: Date.now(),
      owner: currentUserUid,
      organisers: newAlbumOrganisers,
      participants: newAlbumParticipants,
      requests: {'none': true},
      live: false,
      presentationInterval: 4,
      pictures: {},
      // nextIndex: 0,
      current: {},
      default: {}
    }

    let updates = {}
    updates['/albums/' + newAlbumKey] = newAlbum
    updates['/users/' + currentUserUid + '/organising/' + newAlbumKey] = true
    updates['/users/' + currentUserUid + '/participating/' + newAlbumKey] = true

    firebase.database().ref().update(updates).then(() => {
      window.location = '/albums/' + newAlbumKey
    }).catch((err) => {
      alert(err)
    })
  }

  newMessage(e, albumId) {
    e.preventDefault()
    let userName = ''
    firebase.database().ref('/users/' + firebase.auth().currentUser.uid + '/name/').once("value", snapshot => {
      userName = snapshot.val()
    })

    let newMessageKey = firebase.database().ref('/messages/' + albumId).push().key
    let newMessage = {
      id: newMessageKey,
      uid: firebase.auth().currentUser.uid,
      userEmail: firebase.auth().currentUser.email,
      userName: userName,
      message: e.target.querySelector(`#new-message-${albumId}`).value,
      timestamp: Date.now()
    }
    let updates = {}
    updates['/messages/' + albumId + '/' + newMessageKey] = newMessage
    firebase.database().ref().update(updates).then(() => {
      console.log('New Message Sent')
    }).catch((err) => {
      alert(err)
    })
  }

  newRequest (e, album) {
    e.preventDefault()
    let updates = {}
    updates['/albums/' + album.id + '/participants/' + firebase.auth().currentUser.uid] = true
    updates['/users/' + firebase.auth().currentUser.uid + '/participating/' + album.id] = true
    firebase.database().ref().update(updates).then(() => {
      console.log('Updated Request')
    }).catch((err) => {
      alert(err)
    })
  }

  offRequest (e, album) {
    e.preventDefault()
    if (confirm('Proceed to unfollow album?')) {
      let updates = {}
      updates['/albums/' + album.id + '/participants/' + firebase.auth().currentUser.uid] = null
      updates['/users/' + firebase.auth().currentUser.uid + '/participating/' + album.id] = null
      updates['/albums/' + album.id + '/organisers/' + firebase.auth().currentUser.uid] = null
      updates['/users/' + firebase.auth().currentUser.uid + '/organising/' + album.id] = null
      firebase.database().ref().update(updates).then(() => {
        console.log('Updated Request')
      }).catch((err) => {
        alert(err)
      })
    }
  }

  searchAlbum (e) {
    e.preventDefault()
    let searchQueury = e.target.value.trim().toLowerCase()
    let searchLength = searchQueury.length
    let originalAlbums = this.state.originalAlbums
    let filteredAlbums = originalAlbums.filter((album) => {
      return album.title.toLowerCase().slice(0, searchLength) === searchQueury
    })
    this.setState({
      albums: filteredAlbums
    })
  }

  onImageHover (e, albumId) {
    e.preventDefault()
    // console.log('ALBUM ID',albumId)
    let elementsToHide = document.querySelectorAll(`.hover-${albumId}`)
    elementsToHide.forEach(element => {
      // console.log('element', element)
      element.style.opacity = 1
    })
  }

  onImageOver (e, albumId) {
    e.preventDefault()
    // console.log('ALBUM ID',albumId)
    let elementsToHide = document.querySelectorAll(`.hover-${albumId}`)
    elementsToHide.forEach(element => {
      // console.log('element', element)
      element.style.opacity = 0
    })
  }

  hidePopover (e) {
    e.preventDefault()
    let elementToHide = document.querySelector(`.popover`)
    elementToHide.style.display = 'none'
  }

  render () {
    let albumsParticipating = []
    if (this.state.albums.length > 0) {
      albumsParticipating = this.state.albums.filter((album, index) => {
        if (album.participants) {
          if (firebase.auth().currentUser.uid in album.participants) {
            return true
          }
        }
      }).map((album,index) => {

        let albumId = Object.keys(this.state.messages).filter((albumId, index) => {
          if (albumId == album.id) {
              return true
            }
        })[0]

        let messageList = []
        for (var key in this.state.messages[albumId]) {
          // messageList.push(this.state.messages[albumId][key])
          messageList[0] = this.state.messages[albumId][key]
        }

        let pictureList = []
        if (this.state.pictures[album.id]) {
          for (var key in this.state.pictures[album.id]) {
            pictureList.push(this.state.pictures[album.id][key])
          }
        } else {
          pictureList.push({id:'default', lastUpdate:'default', uid:'default', url:'http://i.imgur.com/UBshxxy.png'})
        }
        pictureList.sort((a, b) => {
          return a.index - b.index
        })

        return (
          <div key={album.id}>

            <div className="album-content-container">
              <div className="album-image-container">

                <Link to={`/albums/${album.id}`}>
                  <h2 className={["album-title", `hover-${album.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)}>
                    {/* onTouchStart={(e) => this.onImageHover(e, album.id)}> */}
                    {/* onTouchEnd={(e) => this.onImageOver(e, album.id)}> */}
                    {album.title}
                  </h2>
                </Link>

                {firebase.auth().currentUser.uid != album.owner &&<Button type="submit" bsStyle="link" onClick={(e) => this.offRequest(e, album)}  className={['album-request', `hover-${album.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)}>
                  {/* onTouchEnd={(e) => this.onImageOver(e, album.id)}> */}
                  Unfollow
                </Button>}

                <Link to={`/albums/${album.id}`}>
                  <Image src={pictureList[0].url} responsive className="album-image" onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)} />
                    {/* onTouchEnd={(e) => this.onImageOver(e, album.id)}/> */}
                </Link>

                <Link to={`/albums/${album.id}`}>
                  <div className={["album-live-comment-container", `hover-${album.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)} >
                    {/* onTouchEnd={(e) => this.onImageOver(e, album.id)}> */}
                    <MessagesDisplay messages={messageList} albumId={album.id}/>
                  </div>
                </Link>
              </div>

              <div className="album-live-comment-form-container">
                <Form className="album-live-comment-form" onSubmit={(e) => this.newMessage(e, album.id)}>
                  <FormGroup>
                    <Col sm={12}>
                    <FormControl componentClass="textarea" placeholder="Drop a message..." id={`new-message-${album.id}`} />
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col sm={1}>
                    <Button type="submit" bsStyle="primary">
                      Submit
                    </Button>
                    </Col>
                  </FormGroup>
                </Form>
              </div>
            </div>
          </div>
        )
      })
    }

    let albumsOrganising = []
    if (this.state.albums.length > 0) {
      albumsOrganising = this.state.albums.filter((album, index) => {
        if (firebase.auth().currentUser.uid in album.organisers) {
          return true
        }
      }).map((album,index) => {
        let albumId = Object.keys(this.state.messages).filter((albumId, index) => {
          if (albumId == album.id) {
              return true
            }
        })[0]

        let messageList = []
        for (var key in this.state.messages[albumId]) {
          // messageList.push(this.state.messages[albumId][key])
          messageList[0] = this.state.messages[albumId][key]
        }

        let pictureList = []
        if (this.state.pictures[album.id]) {
          for (var key in this.state.pictures[album.id]) {
            pictureList.push(this.state.pictures[album.id][key])
          }
        } else {
          pictureList.push({id:'default', lastUpdate:'default', uid:'default', url:'http://i.imgur.com/UBshxxy.png'})
        }
        pictureList.sort((a, b) => {
          return a.index - b.index
        })

        return (
          <div key={album.id}>

            <div className="album-content-container">
              <div className="album-image-container">

                <Link to={`/albums/${album.id}`}>
                  <h2 className={["album-title", `hover-${album.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)}>
                    {/* onTouchStart={(e) => this.onImageHover(e, album.id)}> */}
                    {album.title}
                  </h2>
                </Link>

                {firebase.auth().currentUser.uid != album.owner &&<Button type="submit" bsStyle="link" onClick={(e) => this.offRequest(e, album)}  className={['album-request', `hover-${album.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)}>
                  {/* onTouchEnd={(e) => this.onImageOver(e, album.id)}> */}
                  Unfollow
                </Button>}

                <Link to={`/albums/${album.id}`}>
                  <Image src={pictureList[0].url} responsive className="album-image" onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)} />
                     {/* onTouchEnd={(e) => this.onImageOver(e, album.id)}/> */}
                </Link>

                <div className={["album-live-comment-container", `hover-${album.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)} >
                  {/* onTouchEnd={(e) => this.onImageOver(e, album.id)}> */}
                  <MessagesDisplay messages={messageList} albumId={album.id}/>
                </div>
              </div>

              <div className="album-live-comment-form-container">
                <Form className="album-live-comment-form" onSubmit={(e) => this.newMessage(e, album.id)}>
                  <FormGroup>
                    <Col sm={12}>
                    <FormControl componentClass="textarea" placeholder="Drop a message..." id={`new-message-${album.id}`} />
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col sm={1}>
                    <Button type="submit" bsStyle="primary">
                      Submit
                    </Button>
                    </Col>
                  </FormGroup>
                </Form>
              </div>
            </div>
          </div>
        )
      })
    }

    let albumsOthers = []
    if (this.state.albums.length > 0) {
      albumsOthers = this.state.albums.filter((album, index) => {
        if (firebase.auth().currentUser.uid in album.organisers || firebase.auth().currentUser.uid in album.participants || firebase.auth().currentUser.uid in album.requests) {
          return false
        } else {
          return true
        }
      }).map((album,index) => {
        let pictureList = []
        if (this.state.pictures[album.id]) {
          for (var key in this.state.pictures[album.id]) {
            pictureList.push(this.state.pictures[album.id][key])
          }
        } else {
          pictureList.push({id:'default', lastUpdate:'default', uid:'default', url:'http://i.imgur.com/UBshxxy.png'})
        }

        return (
          <div key={album.id}>
            <div className="album-content-container">
              <div className="album-image-container">
                <h2 className={["album-title", `hover-${album.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)}>
                  {album.title}
                </h2>

                <Button type="submit" bsStyle="link" onClick={(e) => this.newRequest(e, album)} className={['album-request', `hover-${album.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)}>
                  Participate
                </Button>

                <Image src={pictureList[0].url} responsive className="album-image" onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)} />
                  {/* onClick={(e) => this.newRequest(e, album)}/> */}

                <div className={["album-live-comment-container", `hover-${album.id}`].join(' ')} onMouseOver={(e) => this.onImageHover(e, album.id)} onMouseOut={(e) => this.onImageOver(e, album.id)} onTouchStart={(e) => this.onImageHover(e, album.id)}>
                  {album.description}
                </div>
              </div>
            </div>
          </div>
        )
      })
    }

    return (
      <div>
        <Navbar />

        <Col sm={8} className="albums-display">
          <PageHeader>
            <strong>Albums</strong>
          </PageHeader>

          <Form horizontal>
            <FormGroup bsSize="large">
              <Col sm={12}>

                <FormControl type='text' id='search-albums' name="search-albums" placeholder='Search Albums by Title' onChange={(e) => this.searchAlbum(e)}/>

              </Col>
            </FormGroup>
          </Form>

          {!this.state.isParticipating && <Popover
            placement="top"
            positionLeft={320}
            positionTop={84}
            title="New here?" className="popover" onClick={(e) => this.hidePopover(e)}>
              Start participating in albums from the  <strong>Others</strong> tab OR simply <strong>Create Album</strong>.
          </Popover>}

          <Col sm={4} md={2}>
            <Button bsStyle="primary" onClick={(e) => this.open(e)}>
              Create Album
            </Button>
          </Col>

          <Tabs ref="targetIntro" defaultActiveKey={this.state.key} onSelect={(e) => this.handleAlbumSelect(e)}>

            <Tab eventKey={'participating'} title="Participating" className='album-tab'>
              {/* <div className="albums-container"> */}
              <div className="actual-album-container">
                {albumsParticipating}
              </div>
            </Tab>

            <Tab eventKey={'organising'} title="Organising" className='album-tab'>
              <div className="actual-album-container">
                {albumsOrganising}
              </div>
            </Tab>

            <Tab eventKey={'others'} title="Others" className='album-tab'>
              <div className="actual-album-container">
                {albumsOthers}
              </div>
            </Tab>

          </Tabs>
        </Col>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Create New Album</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <Form horizontal onSubmit={(e) => this.newAlbum(e)}>
                <FormGroup>
                  <Col componentClass={ControlLabel} sm={2}>
                    Title
                  </Col>
                  <Col sm={10}>
                    <FormControl type='text' id="new-album-title" name="title" placeholder='Title' required/>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col componentClass={ControlLabel} sm={2}>
                    Description
                  </Col>
                  <Col sm={10}>
                    <FormControl componentClass='textarea' id="new-album-description" name="description" placeholder='Description' required/>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col smOffset={10} sm={1}>
                    <Button type="submit" bsStyle="primary">
                      Submit
                    </Button>
                  </Col>
                </FormGroup>

              </Form>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e)}>Cancel</Button>
          </Modal.Footer>
        </Modal>

      </div>
    )
  }
}

export default Albums
