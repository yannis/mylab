import DS from 'ember-data';
import Abilities from '../lib/abilities';

export default DS.Model.extend(Abilities, {
  email: DS.attr('string'),
  groupName: DS.attr('string'),
  inviterName: DS.attr('string'),
  state: DS.attr('string'),
  stateAt: DS.attr('date'),
  inviter: DS.belongsTo('user', { async: true, inverse: 'invitationsAsInviter'}),
  invited: DS.belongsTo('user', { async: true, inverse: 'invitationsAsInvited'}),
  group: DS.belongsTo('group', { async: true }),
});
