import DS from 'ember-data';
import Picturable from './picturable';

export default DS.Model.extend({
  name: DS.attr('string'),

  category: DS.belongsTo('category', { async: true }),
  pictures: DS.hasMany('picture', { async: true }),
  attachments: DS.hasMany('attachment', { async: true }),

  versions: DS.hasMany('version', { async: true }),

  nameForSelectMenu: function(){
    return this.get('name');
  }.property('name'),

  previousVersions: function(){
    var sortedVersions = this.get('versions').sortBy('createdAt');
    var lastVersion = sortedVersions.get('firstObject');
    return sortedVersions.without(lastVersion);
  }.property('versions.@each.createdAt'),

  sortedVersions: function(){
    return this.get('versions').sortBy('createdAt');
  }.property('versions.@each.createdAt'),

  lastVersion: function(){
    return this.get('sortedVersions').get('firstObject');
  }.property('sortedVersions'),

  lastUpdatedVersion: function(){
    var sortedVersions = this.get('versions').sortBy('updatedAt:desc');
    return this.get('sortedVersions').get('firstObject');
  }.property('versions.@each.updatedAt')

});
