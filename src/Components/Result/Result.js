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
    const backgroundImage = {
        beach,
        mountain,
        night,
        city,
        nightForest
    }[background];

    const handleDownloadImage = () => {
        const poster = document.getElementById('poster-container');

        toPng(poster)
            .then((dataUrl) => {
                // Create a link element to download the image
                const downloadLink = document.createElement('a');
                downloadLink.href = dataUrl;
                downloadLink.download = 'festival_lineup.png';

                // Simulate click to trigger download
                downloadLink.click();
            })
            .catch((error) => {
                console.error('Error generating image:', error);
            });
    };

    if (loading) {
        return null;
    } else {
        return (
            <div className='background2'>
                <div className='home-background'>
                    <Header logOut={logOut} />
                    <div className='poster' id='poster-container'>
                        <h1 className='festival-name'>Powered by ravify.me</h1>
                        <p className='linebreak'></p>
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
                                return <h3 key={item.name}>{item.name}</h3>;
                            })}
                            <i className="fa-brands fa-spotify fa-xl" id='spotify-logo' size="2xl" style={{ color: "#ffffff" }}></i>
                        </div>
                    </div>
                    <Link to='/background' className='change-background-button'>Change Background</Link>
                    <div className='share-section'>
                        <div className='html2can'>
                            <div className='download-button' onClick={handleDownloadImage}>Download Image</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Result;
