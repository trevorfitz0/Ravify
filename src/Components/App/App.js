import React, { Component } from 'react'
import { getAccessToken, handleRedirect, logUserIn } from './../../APICalls.js'
import { Link, Route } from 'react-router-dom';
import './App.css'
import PickBackground from '../PickBackground/PickBackground.js';
import Result from '../Result/Result.js';
import Header from '../Header/Header.js';

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
    const retrivedData = sessionStorage.getItem('artist-data')
    const retrivedBackground = sessionStorage.getItem('background')
    if(sessionStorage.length === 2 && retrivedData !== undefined) {
      this.setState( { artistList: JSON.parse(retrivedData), loading: false, loggedIn: true, background: retrivedBackground })
    } else {
      await getAccessToken()
      .then(r => r.json())
      .then(data => this.setState({ token: data.access_token, loading: false }))
    }
  }

  cypressCheck() {

    const check = sessionStorage.getItem('user-login-testing')

    if (window.Cypress && check === null) {
      this.setState({ loggedIn: true })
      this.setState({ artistList: JSON.parse(sessionStorage.getItem('artist-data')) })
    }
  }

  async componentDidMount() {
    this.cypressCheck()
    this.accessToken()
    const retrivedData = sessionStorage.getItem('artist-data')
    if (window.location.search.length > 0) {
      const data = await handleRedirect()
      console.log(data)
      if(data !== 'no data') {
        this.setState({ artistList: data.items, loggedIn: true})
        console.log(data.items)
        sessionStorage.setItem('artist-data', JSON.stringify(data.items))
      }
    }
  }

  setBackground(backgroundSelection) {
    this.cypressCheck()
    this.setState({ background: backgroundSelection })
    sessionStorage.setItem('background', backgroundSelection)
  }

  logOut() {
    sessionStorage.clear()
    this.setState({ loggedIn: false})
    console.log(JSON.parse(sessionStorage.getItem('artist-data')))
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
                <Link to='/background' className='main-button' id='get-started'>Get Started!</Link> 
              : 
              <div className='main-button' onClick={() => logUserIn()}>
                <h1>Log In With Spotify </h1>
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
              <Header/>
              <Result background={ this.state.background } artistList={ this.state.artistList} loading={ this.state.loading } logOut={ this.logOut } />
            </div>
          )
          }} />
        </div>
    )
  }
}
