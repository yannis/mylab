import CategoriesBaseController from './base';

export default CategoriesBaseController.extend({
  actions: {
    cancel: function() {
      this.model.rollback();
      this.transitionToRoute('categories');
    }
  }
});
