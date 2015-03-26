export function initialize(/* container, application */) {
  // application.inject('route', 'foo', 'service:foo');
}

export default {
  name: 'tooltip',
  initialize: function(){
    $(document).ready(function () {
      $('body').tooltip({
        selector: '[data-toggle="tooltip"]'
      });
    });
  },
};
