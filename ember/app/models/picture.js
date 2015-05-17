import DS from 'ember-data';
import Ember from 'ember';
import Abilities from '../lib/abilities';
// import Thumbnail from './thumbnail'

export default DS.Model.extend(Abilities, {
  image: DS.attr('raw'),
  filename: DS.attr('string'),
  thumbnails: DS.hasMany('thumbnail'),
  // url: DS.attr('string', {readOnly: true}),
  // urls: DS.attr('string', {readOnly: true}),
  // thumbUrl: DS.attr('string', {readOnly: true}),
  // thumbXsUrl: DS.attr('string', {readOnly: true}),
  thumbSmallUrl: DS.attr('string', {readOnly: true}),
  // mediumUrl: DS.attr('string', {readOnly: true}),
  picturableId: DS.attr('number'),
  picturableType: DS.attr('string'),

  // thumbs: function(){
  //   debugger
  //   var thumbs = [];
  //   return thumbs
  // }.property('thumbnails')

  // picturable: function(){
  // }.property("picturableId", "picturableType").readOnly()


});
