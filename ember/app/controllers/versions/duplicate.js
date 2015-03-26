import VersionsBaseController from './base';

export default VersionsBaseController.extend({
  actions: {
    cancel: function() {
      this.model.rollback();
      this.transitionToRoute('versions');
    }
  }
});
