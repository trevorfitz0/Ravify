
import React from 'react'
import './PickBackground.css'
import beachImage from '../../Images/beach.png'
import mountainImage from '../../Images/mountains.png'
import nightImage from '../../Images/night.png'
import cityImage from '../../Images/city.png'
import { Link } from 'react-router-dom'
import Header from '../Header/Header'

function PickBackground({ setBackground, logOut }) {
  return (
    <div className='background'>
        <Header logOut={ logOut }/>
        <div className='background-text'>
          <h1>Pick A Background</h1>
        </div>
          <Link to='/home'>
            <div className='images'>
              <img alt='beach' src={beachImage} onClick={() => setBackground('beach')}></img>
              <img alt='mountain' src={mountainImage} onClick={() => setBackground('mountain')}></img>
              <img alt='night' src={nightImage} onClick={() => setBackground('night')}></img>
            </div>
          </Link>
    </div>
  )
}

export default PickBackground