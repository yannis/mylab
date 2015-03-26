import Ember from 'ember';
// import RouteMixin from 'ember-cli-pagination/remote/route-mixin';

export default Ember.Route.extend({


  // optional. default is 10
  // perPage: 10,

  // queryParams: {
  //   query: {
  //     refreshModel: true
  //   }
  // },

  model: function(params) {
    return this.store.find('document', params);
    // return this.findPaged('document', params);
  },

  // afterModel: function(documents, transition){
  //   debugger
  // },

  actions: {
    // didSelect: function(id) {
    //   debugger;
    //   this.transitionTo('documents.show', id);
    // },
    delete: function(document){
      var _this = this;
      if (window.confirm("Are you sure you want to delete this document?")) {
        document.destroyRecord().then(function() {
          _this.transitionTo('documents.index');
        });
      }
    },
    deletePicture: function(picture){
      if (window.confirm("Are you sure you want to delete this picture?")) {
        picture.destroyRecord();
      }
    },
    deleteAttachment: function(attachment){
      if (window.confirm("Are you sure you want to delete this attachment?")) {
        attachment.destroyRecord();
      }
    }
  }
});

