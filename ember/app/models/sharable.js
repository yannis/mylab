import DS from 'ember-data';

export default DS.Model.extend({
  sharings: DS.hasMany('sharing', { async: true }),

  sharedWithGroup: function(group){
    var groups = this.get('sharings').mapBy('group');
    return groups.contains(group);
  }.property("sharings.@each.group")
});
