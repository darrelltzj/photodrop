import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/app/App'
import './index.css'

import * as firebase from 'firebase'

require('dotenv').config({ silent: true })

var config = {
    apiKey: process.env.REACT_APP_apiKey,
    authDomain: process.env.REACT_APP_authDomain,
    databaseURL: process.env.REACT_APP_databaseURL,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId
  }

firebase.initializeApp(config)

ReactDOM.render(
  <App />,
  document.getElementById('root')
)
