import DS from 'ember-data';

var attr = DS.attr;

export default DS.Model.extend({
  doc: attr('raw'),
  markdown: DS.attr('string')
});
