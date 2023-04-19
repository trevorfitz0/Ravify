import React from 'react'
import './Result.css'
import beach from '../../Images/beach.png'
import mountain from '../../Images/mountains.png'
import night from '../../Images/night.png'
import { Link } from 'react-router-dom'

function Result({ background, artistList, loading }) {

    console.log(artistList)

    const backgroundImage = {
        beach,
        mountain,
        night
      }[background];

      var acc = 0
      if ( loading ) {
        return null
      }
  return (
    <div>
        <div className='result-background'>
            <div className='main-area'>
                <h1 className='title'>Ravify!</h1>
                <Link to='/background' className='header-link'>Log Out</Link>
            </div>
            <p className='line-break'></p>
            <div className='display-area'>
                <img className='final-poster' alt='final poster' src={ backgroundImage }></img>
                <div className='artists'>
                    <h1 className='headliner'>{artistList[0].name}</h1>
                    <br/>
                    <div className='direct-support'>
                        <h2 className={`direct-1`}>{artistList[1].name}</h2>
                        <h2 className={`direct-2`}>{artistList[2].name}</h2>
                    </div>
                </div>
                <div className='all-artists'>
                {
                    artistList.map(item => {
                        acc++
                        if (acc > 3) {
                            return <h3>{item.name}</h3>
                        }
                    })
                }
                </div>
            </div>
            <Link to='/background' className='background-link'>Change Background</Link>
        </div>
        
    </div>
  )
}

export default Result