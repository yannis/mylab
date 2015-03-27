import { moduleForModel, test } from 'ember-qunit';

moduleForModel('version', {
  // Specify the other units that are required for this test.
  needs: ['model:document', 'model:picture', 'model:attachment', 'model:thumbnail'],
  beforeEach: function () {
    this.store = this.store();
    this.version = this.subject({id: 74576484, name: 'version_name', createdAt: "2015-02-01"});
  },
});

test('its valid', function(assert) {
  assert.ok(this.version);
  assert.ok(this.version instanceof DS.Model);
  assert.equal(this.version.get('name'), "version_name");
  assert.equal(this.version.get('pdfUrl'), "http://mylab.dev/api/v1/versions/74576484.pdf");
  assert.equal(this.version.get('nameForSelectMenu'), "Version 'version_name' (created February 1, 2015)");
});

test('it belongs to a document', function(assert) {
  var _this = this;
  Ember.run(function() {
    _this.version.set('document', _this.store.createRecord('document', {name: "document_name"}))
  });
  assert.ok(this.version.get('document'));
  assert.ok(this.version.get('document') instanceof DS.Model);
});
