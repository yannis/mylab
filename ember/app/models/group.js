import Ember from 'ember';
import DS from 'ember-data';
import Abilities from '../lib/abilities';

export default DS.Model.extend(Abilities, {
  name: DS.attr('string'),
  text: Ember.computed.alias('name'),
  memberships: DS.hasMany('membership', { async: true }),
  sharings: DS.hasMany('sharing', { async: true }),
  invitations: DS.hasMany('invitation', { async: true }),

  sharedWithSharable: function(sharable){
    var sharables = this.get('sharings').mapBy('sharable');
    return sharables.contains(sharable);
  }.property('sharings.@each.sharable')
});
