describe('User redirect flow', () => {

  it('should be able to visit site', () => {
    cy.visit('http://localhost:3000/')
  })
  it('should be able to log Into Spotify', () => {
    cy.visit('http://localhost:3000/')

    cy.get('.main-button').click()

    cy.origin('https://accounts.spotify.com', () => {
      cy.get('input#login-username').type('spotifycypresstest@gmail.com')
      cy.get('input#login-password').type('password123!')
      cy.get('.ButtonInner-sc-14ud5tc-0').click()

      //checking that the users personal authorziation code is returned. If a code is returned here it will be sent back to the site for use in later API GET requests
      cy.url().should('include', 'response_type=code')
    })


  })
})

// Testing123!