import VersionsBaseController from './base';

export default VersionsBaseController.extend({
  actions: {
    cancel: function() {
      this.get("model").rollback();
      this.transitionToRoute('documents.show.versions');
    }
  }
});
