import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  documents: DS.hasMany('document', { async: true })
});
