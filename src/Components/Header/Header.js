import React from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

function Header({ logOut }) {
  return (
    <div>
        <div className='header'>
            <h1 className='title'>Ravify!</h1>
            <Link to='/' onClick={() => logOut()} className='logout-button'>Log Out</Link>
        </div>
        <p className='line-break'></p>
    </div>
  )
}

export default Header