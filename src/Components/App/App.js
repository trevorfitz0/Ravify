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
    this.logOut = this.logOut.bind(this)
    this.state = {
      token: null,
      accessCode: '',
      artistList: [],
      loggedIn: false,
      background: null,
      loading: true
    }
  }

  async accessToken() {
    if(sessionStorage.length > 0) {
      const retrivedData = sessionStorage.getItem('artist-data')
      const retrivedBackground = sessionStorage.getItem('background')
      this.setState( { artistList: JSON.parse(retrivedData), loading: false, loggedIn: true, background: retrivedBackground })
    } else {
      await getAccessToken()
      .then(r => r.json())
      .then(data => this.setState({ token: data.access_token, loading: false }))
    }
  }

  async componentDidMount() {
    this.accessToken()
    if (window.location.search.length > 0) {
      const data = await handleRedirect()
      this.setState({ artistList: data.items, loggedIn: true})
      sessionStorage.setItem('artist-data', JSON.stringify(data.items))
    }
  }

  setBackground(backgroundSelection) {
    this.setState({ background: backgroundSelection })
    sessionStorage.setItem('background', backgroundSelection)
  }

  logOut() {
    sessionStorage.clear()
    this.setState({ loggedIn: false})
  }

  render() {
    return (
        <div className='background'>
          <Route exact path='/' render={() => {
          return (
            <div className='login-screen'>
              <h1 className='main-title'>Welcome to Ravify!</h1>
              {this.state.loggedIn 
              ?
              <div className='main-button'>
                <Link to='/background'>Get Started!</Link> 
              </div> 
              : 
              <div className='main-button'>
                <h1 onClick={() => logUserIn()} >Log In With Spotify </h1>
                <i className="fa-brands fa-spotify fa-beat fa-xl" size="2xl" style={{color: "#ffffff"}}></i>
              </div>
              }
            </div>
          )
          }} />
          <Route exact path='/background' render={() => {
          return (
            <div className='home-screen'>
              <PickBackground setBackground={ this.setBackground  } logOut={ this.logOut }/>
            </div>
          )
          }} />
          <Route exact path='/home' render={() => {
          return (
            <div>
              <Result background={ this.state.background } artistList={ this.state.artistList} loading={ this.state.loading } logOut={ this.logOut } />
            </div>
          )
          }} />
        </div>
    )
  }
}
