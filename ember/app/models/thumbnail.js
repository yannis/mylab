import DS from 'ember-data';
import Abilities from '../lib/abilities';

export default DS.Model.extend(Abilities, {
  name: DS.attr('string'),
  width: DS.attr('number'),
  height: DS.attr('number'),
  url: DS.attr('string'),
  picture: DS.belongsTo('picture'),

  markdownTag: function(){
    return "!["+this.get('picture.filename')+"]("+this.get('url')+" '"+this.get('picture.filename')+"')"
  }.property('url', 'name', 'picture.filename')
});
