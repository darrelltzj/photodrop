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
  Tabs,
  Tab,
  PageHeader
 } from 'react-bootstrap'

import AlbumItem from '../albumItem/AlbumItem'

import Navbar from '../navbar/Navbar'

class Albums extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: '',
      pictures: '',
      key: 'participating'
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

  handleSelect(key) {
    // alert('selected ' + key)
    this.setState({
      key: key
    })
  }

  render() {
    let albumItems = []
    if (this.state.albums.length > 0) {
      albumItems = this.state.albums.map((album, index) => {
        return (
              <div key={album.id}>
              <Link to={`/albums/${album.id}`}>
                <PageHeader>
                  <small>{album.title}</small>
                </PageHeader>
              </Link>
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

        {/* <p>{this.state.key}</p> */}

        <Form horizontal onChange={(e) => this.search(e)}>
          <FormGroup bsSize="large">
            <Col sm={12}>
              <FormControl type='text' id='search-albums' name="search-albums" placeholder='Search Albums' />
            </Col>
          </FormGroup>
        </Form>

        <Col sm={4} md={2}>
        <Link to={`/albums_new`}>
          <Button bsStyle="primary">
            Create New Album
          </Button>
        </Link>
        </Col>

        <Tabs defaultActiveKey={this.state.key} onSelect={(e) => this.handleSelect(e)}>

          <Tab eventKey={'participating'} title="Participating">
            <div>
              {albumItems}
            </div>
          </Tab>

          <Tab eventKey={'organising'} title="Organising">

          </Tab>

          <Tab eventKey={'others'} title="Others">

          </Tab>

        </Tabs>

        {/* <AlbumItem albums={this.state.albums} pictures={this.state.pictures}/> */}
        </Col>

      </div>
    )
  }
}

export default Albums
