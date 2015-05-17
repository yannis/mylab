import DS from 'ember-data';
import Abilities from '../lib/abilities';

export default DS.Model.extend(Abilities, {
  name: DS.attr('string'),
  email: DS.attr('string'),
  password: DS.attr('string'),
  // required for user creation from invitation
  token: DS.attr('string'),
  invitation_id: DS.attr('number'),
  //
  memberships: DS.hasMany('membership', {async: true}),
  documents: DS.hasMany('document', {async: true}),
  invitationsAsInvited: DS.hasMany('invitation', {async: true}),
  invitationsAsInviter: DS.hasMany('invitation', {async: true}),

  pendingInvitationsAsInvited: function(){
    return this.get("invitationsAsInvited").filterBy("state", null);
  }.property('invitationsAsInvited.@each.state'),

  pendingInvitationsAsInviter: function(){
    return this.get("invitationsAsInviter").filterBy("state", null);
  }.property('invitationsAsInviter.@each', 'invitationsAsInviter.@each.state'),

  pastInvitationsAsInvited: function(){
    return this.get("invitationsAsInvited").filterBy("state", "accepted");
  }.property('invitationsAsInvited.@each.state'),

  pastInvitationsAsInviter: function(){
    return this.get("invitationsAsInviter").filterBy("state", "accepted");
  }.property('invitationsAsInviter.@each.state'),

  pastInvitationsCount: function(){
    return this.get("pastInvitationsAsInviter.length")+this.get("pastInvitationsAsInvited.length");
  }.property('pastInvitationsAsInviter', 'pastInvitationsAsInvited'),

  canCreateCategory: DS.attr('boolean'),
  canCreateDocument: DS.attr('boolean'),
  canCreateGroup: DS.attr('boolean'),
  canCreateMembership: DS.attr('boolean'),
  canCreateSharing: DS.attr('boolean'),
  canCreateUser: DS.attr('boolean'),
  canCreateVersion: DS.attr('boolean'),
});
