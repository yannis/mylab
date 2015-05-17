import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['neitherEditingNorShared:hidden'],

  sharable: function(){
    return this.get("targetObject.model")
  }.property("targetObject"),

  sharable: function(){
    console.error("Sharable not defined");
  },

  group: function(){
    console.error("Group not defined");
  },

  isEditing: false,

  isShared: function(){
    var sharable = this.get("sharable");
    var group = this.get("group");
    var sharableGroups = sharable.get('sharings').mapBy('group.content');
    return sharableGroups.contains(group);
  }.property("sharable", "group"),

  neitherEditingNorShared: function(){
    return !(this.get("isShared") || this.get("isEditing"))
  }.property("isShared", "isEditing"),

  actions: {
    addSharing: function(group){
      var _this = this;
      var sharable = this.get('sharable');
      var store = this.get('targetObject.store');
      var sharing = store.createRecord('sharing', {sharable: sharable, group: group});
      sharing.save().then( function(sharing) {
        sharable.get('sharings').addObject(sharing);
        Ember.get(_this, 'flashMessages').success('Document shared!', {sticky: true});
      });
    },
    destroySharing: function(group){
      var _this = this;
      var sharable = this.get('sharable');
      var store = this.get('targetObject.store');
      var sharing = this.get("sharable.sharings.firstObject", {group: group});
      sharing.destroyRecord().then( function(sharing) {
        sharable.get('sharings').removeObject(sharing);
        Ember.get(_this, 'flashMessages').success('Document unshared!', {sticky: true});
      });
    }
  },
});
