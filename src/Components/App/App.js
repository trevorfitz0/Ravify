import React, { Component } from 'react'
import { getAccessToken, handleRedirect, logUserIn } from './../../APICalls.js'
import { Link, Route } from 'react-router-dom';
import './App.css'
import PickBackground from '../PickBackground/PickBackground.js';
import Result from '../Result/Result.js';


export default class App extends Component {
  
  constructor() {
    super()
    this.setBackground = this.setBackground.bind(this)
    this.state = {
      token: null,
      accessCode: '',
      artistList: [],
      loggedIn: false,
      background: null
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

  setBackground(backgroundSelection) {
    console.log('set back - ' + backgroundSelection)
    this.setState({ background: backgroundSelection })
  }

  render() {
    return (
        <div className='background'>
          <Route exact path='/' render={() => {
          return (
            <div className='login-screen'>
              <h1 className='title'>Welcome to Ravify!</h1>
              {this.state.loggedIn ?
              <Link to='/background' className='main-button'>Get Started!</Link> : 
              <div className='login-button'>
                <h1 onClick={() => logUserIn()} >Log In With Spotify </h1>
                <i className="fa-brands fa-spotify fa-beat fa-xl" size="2xl" style={{color: "#ffffff",}}></i>
              </div>
              }
            </div>
          )
          }} />
          <Route exact path='/background' render={() => {
          return (
            <div className='home-screen'>
              <PickBackground setBackground={ this.setBackground }/>
            </div>
          )
          }} />
          <Route path='/home' render={() => {
          return (
            <div>
              <Result background={ this.state.background } artistList={ this.state.artistList }/>
            </div>
          )
          }} />
        </div>
    )
  }
}
