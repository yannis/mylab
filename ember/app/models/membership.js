import DS from 'ember-data';
import Abilities from '../lib/abilities';

export default DS.Model.extend(Abilities, {
  role: DS.attr('string'),
  user: DS.belongsTo('user', { async: true }),
  group: DS.belongsTo('group', { async: true }),
});
