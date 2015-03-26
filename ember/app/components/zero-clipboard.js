import Ember from 'ember';
import ZeroClipboard from 'ember-cli-zero-clipboard/components/zero-clipboard';
import FlashMessageComponent from 'ember-flash-messages/components/flash-message';

export default ZeroClipboard.extend({
  actions: {
    afterCopy: function(){
      this.flashMessage({
        className: "alert",
        content: "Url copied to clipboard",
        duration: 2000,
        type: 'success'
      });
    }
  }
});
