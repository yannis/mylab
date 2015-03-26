import DS from 'ember-data';

export default DS.Model.extend({
  file: DS.attr('raw'),
  url: DS.attr('string', {readOnly: true}),
  name: DS.attr('string'),
  attachableId: DS.attr('number'),
  attachableType: DS.attr('string'),
  attachable: function(){
    debugger
  }.property("attachableId", "attachableType").readOnly()
});
