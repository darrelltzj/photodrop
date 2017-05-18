import React from 'react'

const AlbumSearch = (props) => (
  <form>
    <label>
      Search{' '}
      <input type="text" placeholder="Search Album" onChange={props.handleSearch} />
    </label>
  </form>
)

export default AlbumSearch
