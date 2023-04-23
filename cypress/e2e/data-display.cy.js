describe('Main Page', () => {

    //Note, there are two calls of a cyrpesscheck function in my App.js file, the first call sets our log in state but that will also submit an empty array to our artistList. After that it is called again to set the artists again.

    //Another note, I cannot use cy.intercept in this project because to sent any get request you need a user token which is only valid for an hour and to recieve that I would have to have a user log in. Besides that a post request would not work either here because there is no return from it.

    it('should display data', () => {
    
        cy.visit('http://localhost:3000')

        sessionStorage.setItem('loggedIn', true)
        cy.get('#get-started').click()

        //Sets the artist data since we never received any from Authentication
        cy.window().then( win => {
            cy.fixture('sample-session-storage.json').then((artists) => {
                sessionStorage.setItem('artist-data', JSON.stringify(artists))
            })
        })

        cy.get('[alt="night"]').click()

    })
})

// "background": "beach", "length": 2