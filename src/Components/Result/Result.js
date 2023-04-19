import React from 'react'
import './Result.css'
import beach from '../../Images/beach.png'
import mountain from '../../Images/mountains.png'
import night from '../../Images/night.png'

function Result({ background, artistList }) {

    console.log(artistList)

    const backgroundImage = {
        beach,
        mountain,
        night
      }[background];

      var acc = 0

  return (
    <div>
        <div className='result-background'>
            <div className='main-area'>
                <h1 className='title'>Ravify!</h1>
                <h1>You're gonna have a good time!</h1>
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
        </div>
        
    </div>
  )
}

export default Result