import DS from 'ember-data';
import dateHelper from '../utils/date-helpers';
import config from '../config/environment';
import Abilities from '../lib/abilities';


export default DS.Model.extend(Abilities, {
  name: DS.attr('string'),
  contentMd: DS.attr('string'),
  contentHtml: DS.attr('string'),
  pdfUrl: DS.attr('string'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  document: DS.belongsTo('document', {async: true}),
  creator: DS.belongsTo('user', {async: true}),
  updater: DS.belongsTo('user', {async: true}),

  nameForSelectMenu: function(){
    return "Version '"+this.get('name')+"' (created "+dateHelper.formatDate(this.get('createdAt'), 'LL')+")";
  }.property('name', 'createdAt'),
});
