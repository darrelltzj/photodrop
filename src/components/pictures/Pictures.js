import React from 'react'

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
  ButtonToolbar,
  PageHeader,
  Modal,
  Image
 } from 'react-bootstrap'

import Navbar from '../navbar/Navbar'

class Pictures extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      album: '',
      pictures: [],
      showAddNewPicture: false,
      showEditDetails: false,
      showPictureSettings: false,
      showParticipants: false
    }
  }

  componentDidMount () {
    firebase.database().ref('/albums/' + this.props.match.params.id).on('value', snapshot => {
      let album = snapshot.val()
      this.setState({
        album: album
      })
    })

    firebase.database().ref('/pictures/' + this.props.match.params.id).on('value', snapshot => {
      let pictures = []
      snapshot.forEach(picture => {
        pictures.push(picture.val())
      })
      this.setState({
        pictures: pictures
      })
    })
  }

  open (e, selection) {
    if (selection == 'addNewPicture') {
      this.setState({
        showAddNewPicture: true
      })
    } else if (selection == 'editDetails') {
      this.setState({
        showEditDetails: true
      })
    } else if (selection == 'pictureSettings') {
      this.setState({
        showPictureSettings: true
      })
    } else if (selection == 'participants') {
      this.setState({
        showParticipants: true
      })
    }
  }

  close () {
    // HANDLE RESET STATE
    this.setState({
      showAddNewPicture: false,
      showEditDetails: false,
      showPictureSettings: false,
      showParticipants: false
    })
  }

  editAlbumDetail (e) {
    e.preventDefault()

    let updatedAlbum = this.state.album

    console.log(this.state.album)

    updatedAlbum.title = e.target.querySelector(`#edit-album-title-${this.props.match.params.id}`).value

    updatedAlbum.description = e.target.querySelector(`#edit-album-description-${this.props.match.params.id}`).value

    updatedAlbum.lastUpdate = Date.now()

    firebase.database().ref('/albums/' + this.props.match.params.id).set(updatedAlbum).then((data) => {
      console.log('Update Successful')
    }).catch((err) => {
      alert(err)
    })
  }

  handleChangeDetail (e, type) {
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

  deleteAlbumDetail (e) {
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
    let pictureList = this.state.pictures.map((picture, index) => {
      return (
        <div key={picture.id}>
          <img src={picture.img}/>
        </div>
      )
    })

    return (
      <div>
        <Navbar />

        <Col sm={8} className="albums-display">

        <div>
            <PageHeader>
              <strong>{this.state.album.title}</strong>{' '}
              <small>{this.state.album.description}</small>
            </PageHeader>
        </div>

        <div>
          <Form horizontal onChange={(e) => this.search(e)}>
            <FormGroup bsSize="large">
              <Col sm={12}>
                <FormControl type='text' placeholder='Search Pictures' />
              </Col>
            </FormGroup>
          </Form>
        </div>

        <ButtonToolbar>
          <Button bsStyle="primary" onClick={(e) => this.open(e, 'addNewPicture')}>
            Add New Picture
          </Button>
          <Button onClick={(e) => this.open(e, 'editDetails')}>
            Edit Details
          </Button>
          <Button onClick={(e) => this.open(e, 'pictureSettings')}>
            Picture Settings
          </Button>
          <Button onClick={(e) => this.open(e, 'participants')}>
            Participants
          </Button>
        </ButtonToolbar>

        <Modal show={this.state.showAddNewPicture} onHide={(e) => this.close(e)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Picture</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e)}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showEditDetails} onHide={(e) => this.close(e)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <Form horizontal onSubmit={(e) => this.editAlbumDetail(e)}>

                <FormGroup>
                  <Col componentClass={ControlLabel} sm={2}>
                    Title
                  </Col>
                  <Col sm={10}>
                    <FormControl type='text' id={`edit-album-title-${this.props.match.params.id}`} name="title" placeholder='Title' value={this.state.album.title} onChange={(e) => this.handleChangeDetail(e, 'title')}/>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col componentClass={ControlLabel} sm={2}>
                    Description
                  </Col>
                  <Col sm={10}>
                    <FormControl componentClass='textarea' id={`edit-album-description-${this.props.match.params.id}`} name="description" placeholder='Description' value={this.state.album.description} onChange={(e) => this.handleChangeDetail(e, 'description')}/>
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col smOffset={10} sm={1}>
                    <Button type="submit" bsStyle="primary">
                      Update
                    </Button>
                  </Col>
                </FormGroup>
              </Form>

              <Form horizontal onSubmit={(e) => this.deleteAlbumDetail(e)}>
                <FormGroup>
                  <Col smOffset={10} sm={1}>
                    <Button type="submit" bsStyle="danger">
                      Delete
                    </Button>
                  </Col>
                </FormGroup>
              </Form>

            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal bsSize="large" show={this.state.showPictureSettings} onHide={(e) => this.close(e)}>
          <Modal.Header closeButton>
            <Modal.Title>Picture Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button bsStyle="link">
              Live
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e)}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        <Modal bsSize="large" show={this.state.showParticipants} onHide={(e) => this.close(e)}>
          <Modal.Header closeButton>
            <Modal.Title>Participants</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={(e) => this.close(e)}>Cancel</Button>
          </Modal.Footer>
        </Modal>


        {/* <div>
          <Link to={`/albums/${this.props.match.params.id}/requests`}>Requests</Link>{' | '}
          <Link to={`/albums/${this.props.match.params.id}/settings`}>Settings</Link>{' | '}
          <Link to={`/albums/${this.props.match.params.id}/live`}>Live</Link>
        </div>

        <div>
          <Link to={`/albums/${this.state.albums.map(album => {
            return album.id
          })}/pictures_new`}>
            <button>
              +
            </button>
          </Link>
        </div> */}

        <div>
          {pictureList}
        </div>
        </Col>
      </div>
    )
  }
}

export default Pictures
