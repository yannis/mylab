import Ember from 'ember';

export default Ember.Component.extend({
  attribute: null,
  model: null,
  errors: function(){
    return this.get("model.errors."+this.get("attribute"));
  }.property("model.errors.[]", "attribute")
});
