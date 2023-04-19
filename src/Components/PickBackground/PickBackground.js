
import React from 'react'
import './PickBackground.css'
import beachImage from '../../Images/beach.png'
import mountainImage from '../../Images/mountains.png'
import night from '../../Images/night.png'
import { Link } from 'react-router-dom'

function PickBackground({ setBackground }) {
  return (
    <div className='PickBackground'>
        <div className='main-area'>
          <h1 className='title'>Ravify!</h1>
            <h1>Pick a Background</h1>
        </div>
        <p className='line-break'></p>
          <Link to='/home'>
            <div className='images'>
              <img alt='beach' src={beachImage} onClick={() => setBackground('beach')}></img>
              <img alt='mountain' src={mountainImage} onClick={() => setBackground('mountain')}></img>
              <img alt='night' src={night} onClick={() => setBackground('night')}></img>
            </div>
          </Link>
    </div>
  )
}

export default PickBackground