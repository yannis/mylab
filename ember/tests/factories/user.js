// file tests/factories/user.js
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('user', {
  // Put default 'user' attributes in the default section
  default: {
    name: 'Dude',
    email: "email@email.com",
    password: "password",
  },
  // Create a named 'user' with custom attributes
  admin: {
    style: 'super',
    name: 'Admin'
  }
});
