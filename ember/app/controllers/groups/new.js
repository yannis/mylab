import GroupsBaseController from './base';

export default GroupsBaseController.extend({
  actions: {
    cancel: function() {
      this.model.rollback();
      this.transitionToRoute('groups');
    }
  }
});
