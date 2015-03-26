import DS from 'ember-data';

export default DS.Model.extend({
  pictures: DS.hasMany('picture', { async: true })
});
