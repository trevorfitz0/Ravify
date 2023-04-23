import React from 'react'
import './Result.css'
import beach from '../../Images/beach.png'
import mountain from '../../Images/mountains.png'
import night from '../../Images/night.png'
import city from '../../Images/city.png'
import nightForest from '../../Images/night-forest.png'
import { Link } from 'react-router-dom'
import Header from '../Header/Header'

function Result({ background, artistList, loading, logOut}) {

    const backgroundImage = {
        beach,
        mountain,
        night,
        city,
        nightForest
      }[background];

      var acc = 0

      if ( loading ) {
        return null
      } else {
  return (
    <div>
        <div className='home-background'>
            <Header logOut={ logOut }/>
            <div className='poster'>
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
                            return <h3 key={item.name}>{item.name}</h3>
                        }
                    })
                }
                </div>
            </div>
            <Link to='/background' className='change-background-button'>Change Background</Link>
        </div>
        
    </div>
  )
            }
}

export default Result