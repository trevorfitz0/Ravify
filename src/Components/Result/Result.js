import React, { useState } from 'react';
import './Result.css';
import beach from '../../Images/beach.png';
import mountain from '../../Images/mountains.png';
import night from '../../Images/night.png';
import city from '../../Images/city.png';
import nightForest from '../../Images/night-forest.png';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';
import { toPng } from 'html-to-image';

function Result({ background, artistList, loading, logOut }) {

    function downloadImage() {
        // Request animation frame to ensure the screenshot is taken after the page has rendered
        requestAnimationFrame(() => {
            // Select the poster element
            const poster = document.querySelector('.poster');
    
            // Convert the poster to PNG image
            toPng(poster)
                .then(function (dataUrl) {
                    // Create a temporary link element
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = 'poster.png';
    
                    // Trigger a click event on the link to start the download
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                })
                .catch(function (error) {
                    console.error('Error generating PNG image:', error);
                });
        });
    }
    

    const backgroundImage = {
        beach,
        mountain,
        night,
        city,
        nightForest
    }[background];

    var acc = 0;

    if (loading) {
        return null;
    } else {
        return (
            <div>
                <div className='home-background'>
                    <Header logOut={logOut} />
                    <div className='poster'>
                        <img className='final-poster' alt='final poster' src={backgroundImage}></img>
                        <div className='artists'>
                            <h1 className='headliner'>{artistList[0].name}</h1>
                            <br />
                            <div className='direct-support'>
                                <h2 className={`direct-1`}>{artistList[1].name}</h2>
                                <h2 className={`direct-2`}>{artistList[2].name}</h2>
                            </div>
                        </div>
                        <div className='all-artists'>
                            {artistList.map(item => {
                                acc++;
                                if (acc > 3) {
                                    return <h3 key={item.name}>{item.name}</h3>;
                                }
                            })}
                            <i className="fa-brands fa-spotify fa-xl" id='spotify-logo' size="2xl" style={{ color: "#ffffff" }}></i>
                        </div>
                    </div>
                    <Link to='/background' className='change-background-button'>Change Background</Link>
                    <div className='share-section'>
                        <div className='html2can'>
                            <button onClick={downloadImage}>Download Image</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Result;
