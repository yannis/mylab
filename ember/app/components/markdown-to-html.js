import Ember from 'ember';
import MarkdownToHtmlComponent from 'ember-cli-showdown/components/markdown-to-html';

export default MarkdownToHtmlComponent.extend({
  afterInit: function() {
    this.converter = new Showdown.converter({ extensions: ['table', 'github'] });
  }.on('init')
});
