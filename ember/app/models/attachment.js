import DS from 'ember-data';
import Abilities from '../lib/abilities';

export default DS.Model.extend(Abilities, {
  file: DS.attr('raw'),
  url: DS.attr('string', {readOnly: true}),
  name: DS.attr('string'),
  attachableId: DS.attr('number'),
  attachableType: DS.attr('string'),
  // attachable: function(){
  //   debugger
  // }.property("attachableId", "attachableType").readOnly()
});
