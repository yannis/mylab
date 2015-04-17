import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  memberships: DS.hasMany('membership', { async: true }),
});
