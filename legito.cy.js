describe('legito tests', () => {
  beforeEach(() => {
    cy.visit('https://thinking-tester-contact-list.herokuapp.com/');
  })

  let loginInfo = new Map ([['#firstName', 'Test'], ['#lastName', 'Testovy'],
                          ['#email', makeid(6) + '@email.com'], ['#password', 'password123']])
  let contact1 = new Map ([['#firstName', 'Jane'], ['#lastName', 'Doe'], 
                          ['#email', 'jane.doe@email.com'], ['#phone', '123456789']]);

  Cypress.Commands.add('login', (loginInfo) => {
    cy.get('#email').type(loginInfo.get('#email'));
    cy.get('#password').type(loginInfo.get('#password'));
    cy.get('#submit').click();
    cy.get('h1').should('contain', 'Contact List');
  })

  Cypress.Commands.add('inputContactInfo', (contact) => {
    contact.forEach((value, key) => {
      cy.get(key).clear().type(value);
    })
    cy.get('#submit').click();
  })

  Cypress.Commands.add('checkContact', (contact) => {
    cy.get('h1').should('contain', 'Contact Details');
    contact.forEach((value, key) => {
      cy.get(key).should('contain', value);
    })
  })

  Cypress.Commands.add('signUp', (loginInfo) => {
    cy.get('#signup').click();
    cy.get('h1').should('contain', 'Add User');
    loginInfo.forEach((value, key) => {
      cy.get(key).type(value);
    })
    cy.get('#submit').click();
  })

  it('create account - invalid password', () => {
    loginInfo.set('#password', 'pwd123');
    cy.signUp(loginInfo).then(() => {
      loginInfo.set('#password', 'password123');
    });
    cy.get('#error').should('contain', 
      'User validation failed: password: Path `password` (`pwd123`) is shorter than the minimum allowed length (7).');
  })

  it('create account', () => {
    cy.signUp(loginInfo);
    cy.get('h1').should('contain', 'Contact List')
  })

  it('add contact - invalid phone', () => {
    contact1.set('#phone', '12345');
    cy.login(loginInfo);
    cy.get('#add-contact').click();
    cy.get('h1').should('contain','Add Contact');
    cy.inputContactInfo(contact1).then(() => {
      contact1.set('#phone', '123456789');
    });
    cy.get('#error').should('contain', 
      'Contact validation failed: phone: Phone number is invalid');
  })

  it('add contact', () => {
    cy.login(loginInfo);
    cy.get('#add-contact').click();
    cy.get('h1').should('contain','Add Contact');
    cy.inputContactInfo(contact1);
    cy.get('h1').should('contain','Contact List');
    cy.get('.contactTableBodyRow > :nth-child(2)').click();
    cy.checkContact(contact1);
  })

  it('edit contact', () => {
    cy.login(loginInfo);
    cy.get('.contactTableBodyRow > :nth-child(2)').click();
    cy.get('h1').should('contain', 'Contact Details')
    cy.get('#edit-contact').click();
    cy.get('h1').should('contain', 'Edit Contact');
    cy.get('#email').should('have.value', contact1.get('#email'));
    contact1.set('#email', 'doe.jane@email.com');
    contact1.set('#city', 'Brno');
    cy.inputContactInfo(contact1);
    cy.get('h1').should('contain', 'Contact Details')
    cy.checkContact(contact1);
  })

  it('delete contact', () => {
    cy.login(loginInfo);
    cy.get('.contactTableBodyRow > :nth-child(2)').click();
    cy.get('#delete').click();
    cy.get('h1').should('contain', 'Contact List');
    cy.get('.contactTableBodyRow > :nth-child(2)').should('not.exist');
  })
})

//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}