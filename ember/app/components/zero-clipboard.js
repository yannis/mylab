import Ember from 'ember';
import ZeroClipboard from 'ember-cli-zero-clipboard/components/zero-clipboard';

export default ZeroClipboard.extend({
  actions: {
    afterCopy: function(){
      Ember.get(this, 'flashMessages').success('Url copied to clipboard!');
    }
  }
});
