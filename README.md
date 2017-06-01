# Photodrop
_**Collect the Good Times**_

[**Photodrop**](https://photodrop.herokuapp.com/) is a live photo feed web application where users can post photos and messages to a live presentation. It is developed with [React](https://facebook.github.io/react/) (front-end) and [Firebase](https://firebase.google.com/) (back-end). It was originally planned for as a continuation from [**theRyanJoleneProject**](https://github.com/darrelltzj/theRyanJoleneProject) so that wedding guests can share their well-wishes and moments on screen, but it can be used for other events and situations as well.

[**Photodrop**](https://photodrop.herokuapp.com/) is currently a work in progress with points for improvement below.

## Targeted features
:white_check_mark: Users can create and / or participate in albums.

:white_check_mark: Participants of each album can post messages and pictures.

:white_check_mark: Organisers of each album can upload audio files and control the order of pictures for the live photo feed presentation.

## Installing this project

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) and deployed with [Buildpack](https://github.com/mars/create-react-app-buildpack).

### Installing

Fork, clone or download this repository to your desired directory. Install the necessary NPM files by entering the following code in your terminal in your directory:

```
npm install
```
A [Firebase](https://firebase.google.com/) project is required as the backend. The project will also require a .env file that contains all the secret variables used in the project.  See the .env.sample file for the environment configurations required to connect the [Firebase](https://firebase.google.com/) project to the [React](https://facebook.github.io/react/) end of this project.

## The application
![Demo](http://i.imgur.com/PnyCMDs.gif)

[Try it out](https://photodrop.herokuapp.com/)

### Images
**Uploading images**

User uploads image --> React reads dataUrl --> fix-orientation --> React uploads image to Firebase

**Reading images**

React reads image URL from Firebase

## Future Development

### Refactor Refactor Refactor
Yes. The code smells at the moment. This is my first project on [React](https://facebook.github.io/react/) and [Firebase](https://firebase.google.com/). The priority was to get the photos loaded and the slides running. The next priority would be to clean up the code.

### EXIF Orientation issue: iPhone Portrait Camera Capture
[npm fix-orientation](https://www.npmjs.com/package/fix-orientation) was used to handle the EXIF meta data in the imgages. Images are correctly before uploading to [Firebase](https://firebase.google.com/). Currently, images through camera capture by iPhone are do not have their EXIF Orientation fixed before they are uploaded. This causes these portrait images to appear rotated 90 degrees on the web application.

Further research has to be conducted on this. An alternative would be to try to upload the image from firebase onto a canvas, then correct the image's orientation from the dataUrl.

### Facebook / Instragram Integration
This is so that users can both upload from and to their social media. This application could act as an extended feature for social media sites.

### Option to privatise / restrict guest rights
Currently, any guest can upload a photo or a message, some users are uncomfortable with this. A review section may be needed for users to approve their guests' posts before allowing the images and messages into the feed.

## Authors
- [Darrell Teo](https://github.com/darrelltzj)

## Credits

### Coding assistance
- [Prima Aulia](https://github.com/primaulia)
- [Lee Yi Sheng](https://github.com/yisheng90)
- [Sahaya Sharona Valluvan](https://github.com/sharona1610)

### Fixing Photo Orientation
- [Jonathan Ng](https://github.com/noll-fyra)
- [Jerel Lim](https://github.com/jerel-lim)

### Resources
* polaroid by Raz Cohen from the Noun Project
