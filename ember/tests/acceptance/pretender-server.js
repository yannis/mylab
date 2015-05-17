// import Ember from 'ember';
// import DS from 'ember-data';
import Pretender from 'pretender';

var categories = [
  {id: 1, name: 'category1'},
  {id: 2, name: 'category2'},
  {id: 3, name: 'category3'}
];

var documents = [
  {id: 1, name: 'document1'},
  {id: 2, name: 'document2'},
  {id: 3, name: 'document3'}
];

var groups = [
  {id: 1, name: 'group1'},
  {id: 2, name: 'group2'},
  {id: 3, name: 'group3'}
];

var users = [
  {id: 1, name: 'user1', email: 'user1@mail.com', token: 'token1'},
  {id: 2, name: 'user2', email: 'user2@mail.com', token: 'token2'}
];

export default new Pretender(function() {
  // CSRF
  this.get('/api/v1/csrf', function(request) {
    return [200, {"Content-Type": "application/json"}, JSON.stringify({authenticity_token: "an_authenticity_token"})];
  });

  // Categories
  this.get('/api/v1/categories', function(request) {
    return [200, {"Content-Type": "application/json"}, JSON.stringify({categories: categories})];
  });
  this.get('/api/v1/categories/:id', function(request) {
    var category = categories.find(function(category) {
      if (category.id === parseInt(request.params.id, 10)) {
        return category;
      }
    });
    return [200, {"Content-Type": "application/json"}, JSON.stringify({category: category})];
  });

  // Documents
  this.get('/api/v1/documents', function(request) {
    return [200, {"Content-Type": "application/json"}, JSON.stringify({documents: documents})];
  });
  this.get('/api/v1/documents/:id', function(request) {
    var document = documents.find(function(document) {
      if (document.id === parseInt(request.params.id, 10)) {
        return document;
      }
    });
    return [200, {"Content-Type": "application/json"}, JSON.stringify({document: document})];
  });
  this.post('/api/v1/documents', function(request) {
    return [200, {"Content-Type": "application/json"}, JSON.stringify({document: {id: 4, name: 'document4'}})];
  });

  // Groups
  this.get('/api/v1/groups', function(request) {
    return [200, {"Content-Type": "application/json"}, JSON.stringify({groups: groups})];
  });
  this.get('/api/v1/groups/:id', function(request) {
    var group = groups.find(function(group) {
      if (group.id === parseInt(request.params.id, 10)) {
        return group;
      }
    });
    return [200, {"Content-Type": "application/json"}, JSON.stringify({group: group})];
  });

  // Users
  this.get('/api/v1/users', function(request) {
    return [200, {"Content-Type": "application/json"}, JSON.stringify({users: users})];
  });
  this.get('/api/v1/users/:id', function(request) {
    var user = users.find(function(user) {
      if (user.id === parseInt(request.params.id, 10)) {
        return user;
      }
    });
    return [200, {"Content-Type": "application/json"}, JSON.stringify({user: user})];
  });

});
