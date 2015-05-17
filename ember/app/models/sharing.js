import DS from 'ember-data';
import Abilities from '../lib/abilities';

export default DS.Model.extend(Abilities, {
  group: DS.belongsTo('group', { async: true }),
  sharable: DS.belongsTo('sharable', {polymorphic: true, async: true}),
});
