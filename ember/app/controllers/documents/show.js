import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    fileLoaded: function(file) {
      var self = this;
      // readAs="readAsFile"
      console.log(file.name, file.filename, file.type, file.size);

      if (isImage(file)) {
        savePicture(file);
      } else if (isDocument(file)) {
        saveAttachment(file);
      };

      function savePicture(file){
        var picture = self.get('store').createRecord('picture', {
          picturableId: self.get('model.id'),
          picturableType: self.get("model.constructor.typeKey").classify(),
          image: file
        });
        picture.save().then(reloadDocument).catch(failure);
      };

      function saveAttachment(file){
        var attachment = self.get('store').createRecord('attachment', {
          attachableId: self.get('model.id'),
          attachableType: self.get("model.constructor.typeKey").classify(),
          name: file.filename,
          file: file
        });
        attachment.save().then(reloadDocument).catch(failure);
      };

      function reloadDocument(pictureData) {
        self.get('model').reload();
        $(".file-picker__preview").hide();
      };

      function failure(reason) {
        console.log("FAILURE!!!", reason.message)
      };

      function isImage(file) {
        var fileTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/tiff'];
        return $.inArray(file.type, fileTypes) >= 0;
      };

      function isDocument(file) {
        var fileTypes = ['application/msword', 'text/plain', 'text/richtext', 'text/richtext', 'application/rtf', 'application/pdf'];
        return $.inArray(file.type, fileTypes) >= 0;
      };
    }
  }
});
