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
    const [showModal, setShowModal] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');

    function openModal(url) {
        setShowModal(true);
        setModalImageUrl(url);
    }

    function closeModal() {
        setShowModal(false);
    }

    function downloadImage() {
        // Select the poster element
        const poster = document.querySelector('.poster');
    
        // Wait for the image to render completely
        setTimeout(() => {
            // Convert the poster to PNG image
            toPng(poster)
                .then(function (dataUrl) {
                    openModal(dataUrl);
                })
                .catch(function (error) {
                    console.error('Error generating PNG image:', error);
                });
        }, 1000); // Adjust the delay time as needed
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
                        <h1 className='festival-name'>ravify.me</h1>
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
                {showModal && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content">
                            <img src={modalImageUrl} alt="Screenshot" style={{ maxWidth: '100%' }} />
                            <button onClick={closeModal}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Result;
