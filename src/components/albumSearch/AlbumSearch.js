import React from 'react'

const AlbumSearch = (props) => (
  <form>
    <input type='text' placeholder='Search' onChange={props.handleSearch} />
    <select>
      <option value='participating'>Participating</option>
      <option value='organising'>Organising</option>
      <option value='others'>Others</option>
    </select>
  </form>
)

export default AlbumSearch
