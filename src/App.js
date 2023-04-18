import React, { Component } from 'react'
import { getAccessToken, getArtistInfo, getAuthCode, handleRedirect, logUserIn } from './APICalls'

export default class App extends Component {

  constructor() {
    super()
    this.state = {
      token: null,
      artist: [],
      accessCode: ''
    }
  }

  async accessToken() {
    //example grabbing API access token
    await getAccessToken()
    .then(r => r.json())
    .then(data => this.setState({ token: data.access_token }))
  }

  artistInfo() {
    //example grabbing artist
    console.log("www" + this.state.token)
    getArtistInfo(this.state.token, '3NJ94iuAmmMjbszODYT6pO') 
    .then(r => r.json())
    .then(data => this.setState({ artist: data }))
    .then(console.log(this.state.artist))
  }

  logIn() {
    logUserIn()
  }

  componentDidMount() {
    this.accessToken()
    if (window.location.search.length > 0) {
      const code = handleRedirect()
      this.setState({ accessCode: code })
    }
  }

  render() {
    return (
      <div>
        <button onClick={() => this.artistInfo() }>get artist info</button>
        <button onClick={() => this.logIn() }>Log In With Spotify</button>
        <h1> { this.state.accessCode }</h1>
        
      </div>
    )
  }
}
