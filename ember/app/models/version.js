import DS from 'ember-data';
import dateHelper from '../utils/date-helpers';
import config from '../config/environment';


export default DS.Model.extend({
  name: DS.attr('string'),
  contentMd: DS.attr('string'),
  contentHtml: DS.attr('string'),
  createdAt: DS.attr('date'),
  updatedAt: DS.attr('date'),

  document: DS.belongsTo('document'),

  pdfUrl: function(){
    return config.proxy+config.apiHost+"/versions/"+this.get('id')+".pdf";
  }.property('id'),

  nameForSelectMenu: function(){
    return "Version '"+this.get('name')+"' (created "+dateHelper.formatDate(this.get('createdAt'), 'LL')+")";
  }.property('name', 'createdAt'),
});
