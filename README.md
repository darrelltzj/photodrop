# Photodrop
_**Collect the Good Times**_

[**Photodrop**](https://photodrop.herokuapp.com/) is a live photo feed web application where users can post photos and messages to a live photo and audio presentation. It is developed with [React](https://facebook.github.io/react/) (front-end) and [Firebase](https://firebase.google.com/) (back-end). It was originally planned for as a continuation to [**theRyanJoleneProject**](https://github.com/darrelltzj/theRyanJoleneProject) for wedding guests to share their well-wishes and photographs on screen, but it can be used for other events as well.

[**Photodrop**](https://photodrop.herokuapp.com/) started as my [forth project](https://jeremiahalex.gitbooks.io/wdi-sg/content/11-projects/project-4/readme.html) at General Assembly's WDI Course. It was also my personal experiment on [React](https://facebook.github.io/react/) and [Firebase](https://firebase.google.com/). There is room for improvement in this project (see below).

## Targeted features
:white_check_mark: Users can create and / or participate in albums.

:white_check_mark: Participants of each album can post messages and pictures.

:white_check_mark: Organisers of each album can upload audio files and control the order of pictures for the live photo feed presentation.

## Installing this project

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app) and deployed with [Buildpack](https://github.com/mars/create-react-app-buildpack). It is also design with [React Bootstrap](https://react-bootstrap.github.io/). See the package.json file for full dependencies.

### Installing

Fork, clone or download this repository to your desired directory. Install the necessary NPM files by entering the following code in your terminal in your directory:

```
npm install
```
A [Firebase](https://firebase.google.com/) project is required as the backend. This repository will also require a .env file that contains all the secret variables used in the project.  See the .env.sample file for the environment configurations required to connect the [Firebase](https://firebase.google.com/) project to the [React](https://facebook.github.io/react/) end of this project.

## The application
![Demo](http://i.imgur.com/PnyCMDs.gif)

[Try it out](https://photodrop.herokuapp.com/)

### Images
**Image Upload Process**

User uploads image --> React reads image dataUrl --> fix-orientation --> React uploads image to Firebase storage

**Image Reading Process**

React reads image URL from Firebase storage

## Future Development

### EXIF Orientation issue: iPhone Portrait Camera Capture
[npm fix-orientation](https://www.npmjs.com/package/fix-orientation) was used to handle the images' orientations from their Exchangeable image file format (EXIF) meta data. Images are oriented correctly according to their orientations before uploading to [Firebase](https://firebase.google.com/). Currently, images through camera capture by iPhone are do not have their orientation fixed before they are uploaded. This causes portrait images to appear rotated 90 degrees on the web application.

Further research has to be conducted on this. A guess would be that iPhone hides its image EXIF data during camera capture. An alternative would be to try to upload images from firebase onto a canvas, then correct fix the images' orientations from their dataUrl.

### Facebook / Instragram integration
This is to allow users to be able to both upload from and to their social media sites. This application could act as an extended feature for social media sites. For example, [Photodrop](https://photodrop.herokuapp.com/) can be re-configured to read [Instragram](https://www.instagram.com) #tags instead, thus reducing the need to upload images.

### Option to privatise / restrict guest rights
Currently, any participant can upload a photo or a message that may or may not be appropriate. A review section may be needed for users to approve their participants' posts before allowing the images and messages into the feed. Alternatively, [Google Cloud Vision](https://cloud.google.com/vision/) can be used to filter off inappropriate images.

### Reducing image size
Reading large image files may affect the application's performance. An alternative would be to save and read a lower version of each image.

## Author(s)
- [Darrell Teo](https://github.com/darrelltzj)

## Credits

### References
- [Automatic Slideshow by Gabriele Romanato](https://codepen.io/gabrieleromanato/pen/dImly)

### Coding assistance
- [Prima Aulia](https://github.com/primaulia)
- [Lee Yi Sheng](https://github.com/yisheng90)
- [Sahaya Sharona Valluvan](https://github.com/sharona1610)

### Fixing Photo Orientation
- [Jonathan Ng](https://github.com/noll-fyra) from [Via Priori](https://github.com/noll-fyra/viapriori2)
- [Jerel Lim](https://github.com/jerel-lim) from [Via Priori](https://github.com/noll-fyra/viapriori2)

### Resources
- polaroid by Raz Cohen from the Noun Project
- Placeholder Images from the [Unsplash](https://unsplash.com/)
