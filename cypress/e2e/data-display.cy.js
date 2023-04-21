describe('Main Page', () => {

    it('should display data', () => {
    
        cy.visit('http://localhost:3000')

        cy.fixture('sample-session-storage.json').then((value) => {
            cy.log(JSON.stringify(value));  
            localStorage.setItem('entries', JSON.stringify(value));
            cy.log(localStorage.getItem('entries'));
            const details = localStorage.getItem('entries');
            cy.log(details);
        })
    
        window.sessionStorage.setItem('artist-data', JSON.stringify())
    })

})

// "background": "beach", "length": 2