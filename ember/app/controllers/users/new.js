import UsersBaseController from './base';

export default UsersBaseController.extend({
  actions: {
    cancel: function() {
      this.model.rollback();
      this.transitionToRoute('users');
    }
  }
});
