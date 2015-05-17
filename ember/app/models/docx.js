import DS from 'ember-data';
import Abilities from '../lib/abilities';

export default DS.Model.extend(Abilities, {
  doc: DS.attr('raw'),
  markdown: DS.attr('string')
});
