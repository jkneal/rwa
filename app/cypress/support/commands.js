// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', (username) => {
    cy.session(username + ' is logged in', () => {
            expect(username, 'username set?').to.be.a('string').and.not.be.empty;
            const password = decode(Cypress.env('loadtestPassword'));
            if (typeof password !== 'string' || !password) {
                throw new Error('Missing password value');
            }
            cy.request('/')
                .then((response) => {
                    cy.request({
                        method: 'POST',
                        url:
                            'https://cas-loadtest.iu.edu/cas/login?service=https%3A%2F%2Fapps-test.iu.edu%2Fuaa-stg%2Flogin%2Fcas',
                        form: true,
                        body: {
                            username: username,
                            password: password,
                            lt: response.body.match(/name="lt" value="(.+?)"/)[1],
                            execution: response.body.match(/name="execution" value="(.+?)"/)[1],
                            _eventId_submit: 'Login',
                        }
                    })
                        .then((response2) => {
                            const title = response2.body.match(/<title>(.*?)<\/title>/)[1];
                            expect(title).contains('Remote Work Arrangement');
                        });
                });
        },
        {
            validate() {
                cy.request('/api/user')
                    .then((response) => {
                        expect(response.status).equals(200)
                        expect(response.body).to.have.property('networkId', username)
                    })
            },
            cacheAcrossSpecs: true,
        });
});

function decode(str) {
    return str.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
        const num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
    });
}

Cypress.Commands.add('backdoor', (username) => {
    cy.login(username)
    cy.visit('/')
})

Cypress.Commands.add('field', (fieldName) => {
    return cy.get('[name="' + fieldName + '"]')
})

Cypress.Commands.add('deleteArrangement', (documentNumber) => {
    cy.request({
        method: 'DELETE',
        url: '/api/arrangement/' + documentNumber
    })
})

Cypress.Commands.add('getTable', {prevSubject: true}, (subject, options = {})  => {
    if (subject.get().length > 1) throw new Error(`Selector "${subject.selector}" returned more than 1 element.`)

    const tableElement = subject.get()[0]
    let headers = [...tableElement.querySelectorAll('thead th')].map(e => e.textContent)

    // transform rows into array of array of strings for each td
    const rows = [...tableElement.querySelectorAll('tbody tr')].map(row => {
        return [...row.querySelectorAll('td')].map(e => e.textContent)
    })

    // return structured object from headers and rows variables
    return rows.map(row =>
        row.reduce((acc, curr, idx) => {
            if (options.onlyColumns && !options.onlyColumns.includes(headers[idx])) {
                // dont include columns that are not present in onlyColumns
                return { ...acc }
            }
            return { ...acc, [headers[idx]]: curr }
        }, {})
    )
})
