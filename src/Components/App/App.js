import React, { Component } from 'react'
import { getAccessToken, handleRedirect, logUserIn } from './../../APICalls.js'
import { Link, NavLink, Route } from 'react-router-dom';
import './App.css'


export default class App extends Component {
  
  constructor() {
    super()
    this.state = {
      token: null,
      artist: [],
      accessCode: '',
      artistList: [],
      loggedIn: false
    }
  }

  async accessToken() {
    // grabbing API access token
    await getAccessToken()
    .then(r => r.json())
    .then(data => this.setState({ token: data.access_token }))
  }

  async componentDidMount() {
    this.accessToken()
    if (window.location.search.length > 0) {
      const data = await handleRedirect()
      console.log(data)
      this.setState({ artistList: data.items, loggedIn: true})
    }
  }

  render() {
    return (
        <div className='background'>
          <Route exact path='/' render={() => {
          return (
            <div className='login-screen'>
              <h1 className='title'>Welcome to Ravify!</h1>
              {this.state.loggedIn ?
              <NavLink to='/home' className='main-button'>Get Started!</NavLink> : 
              <div className='login-button'>
                <h1 onClick={() => logUserIn()} className='main-button'>Log In With Spotify </h1>
                <i class="fa-brands fa-spotify fa-beat fa-xl" beat size="2xl" style={{color: "#1e3050",}}></i>
              </div>
              }
            </div>
          )
          }} />
          <Route exact path='/home' render={() => {
          return (
            <div className='home-screen'>
              <h1>Welcome to Ravify!</h1>
            </div>
          )
          }} />
        </div>
    )
  }
}
