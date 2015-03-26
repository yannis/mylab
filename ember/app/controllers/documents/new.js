import DocumentsBaseController from './base';

export default DocumentsBaseController.extend({
  actions: {
    cancel: function() {
      this.model.rollback();
      this.transitionToRoute('documents');
    }
  }
});
