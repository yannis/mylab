// app/transforms/raw.js
import DS from 'ember-data';
import Ember from 'ember';

export default DS.Transform.extend({
  deserialize: function(serialized) {
    return Ember.isNone(serialized) ? {} : serialized;
  },

  serialize: function(deserialized) {
    return Ember.isNone(deserialized) ? {} : deserialized;
  }
});
