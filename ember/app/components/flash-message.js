import FlashMessageComponent from 'ember-flash-messages/components/flash-message';

export default FlashMessageComponent.extend({
  tagName: 'p',
  className: 'alert',
  duration: 2000,
});
