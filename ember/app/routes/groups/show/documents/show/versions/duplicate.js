import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    var document = this.modelFor("documents.show");
    var version = this.store.createRecord('version');
    document.get('versions').then(function(versions){
      versions.pushObject(version);
    });
    var parentVersion = this.store.find('version', params.version_id).then(function(v){
      version.set("contentMd", v.get("contentMd"));
    });

    return version;
  }
});
