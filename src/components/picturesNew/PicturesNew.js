import React from 'react'

import * as firebase from 'firebase'
import uuidGenerator from 'uuid/v4'

import Navbar from '../navbar/Navbar'

class PicturesNew extends React.Component {
  uploadImage(e) {
    e.preventDefault()

    //get file
    let image = e.target.querySelector('#imageUpload').files[0]

    //create storage ref
    let pictureId = uuidGenerator()
    let imageNameArray = image.name.split('.')
    let type = imageNameArray[imageNameArray.length - 1]
    let imageRef = firebase.storage().ref('images/' + pictureId + '.' + type)

    // CHECK FOR PICTURE FILES ONLY

    //upload file
    let task = imageRef.put(image)

    // update progress
    task.on('state_changed',
      function progress(snapshot) {
        console.log('Progress: ', snapshot)
      },
      function error(err) {
        console.log('Error: ', err)
      },
      function complete() {
        console.log('Completed: ', task)
        imageRef.getDownloadURL().then((url) => {
          console.log(url)
          // update ref
          firebase.database().ref('pictures/' + pictureId).set({
            id: pictureId,
            album_id: this.props.match.params.id,
            img: url,
            votes: 0
          })
          // REDIRECT
        })
      }.bind(this)
    )
  }

  render() {
    return (
      <div>
        <Navbar />

        <div>
          <span>Pick Photo</span>{' | '}
          <span>Use Camera</span>{' | '}
          <span>Post a Message</span>
        </div>

        <div onSubmit={(e) => this.uploadImage(e)}>
          <form>
            {/* <input type='file'/> */}
            <input type='file' id='imageUpload' accept='image/*' capture='camera' />
            <input type='text' placeholder='Tags' />
            <input type='text' placeholder='Comment' />
            <button>Submit</button>
          </form>
        </div>

      </div>
    )
  }
}

export default PicturesNew
