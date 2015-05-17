import DS from 'ember-data';
import Abilities from '../lib/abilities';

export default DS.Model.extend(Abilities, {
  name: DS.attr('string'),
  documents: DS.hasMany('document', { async: true })
});
