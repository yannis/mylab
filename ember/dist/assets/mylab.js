/* jshint ignore:start */

/* jshint ignore:end */

define('mylab/adapters/application', ['exports', 'ember-data', 'mylab/config/environment'], function (exports, DS, ENV) {

  'use strict';

  exports['default'] = DS['default'].ActiveModelAdapter.extend({
    namespace: ENV['default'].apiHost
  });

});
define('mylab/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'mylab/config/environment', 'rails-csrf/config'], function (exports, Ember, Resolver, loadInitializers, environment, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: environment['default'].modulePrefix,
    podModulePrefix: environment['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  config.setCsrfUrl(environment['default'].apiHost + "/csrf");

  loadInitializers['default'](App, environment['default'].modulePrefix);

  loadInitializers['default'](App, "rails-csrf");

  exports['default'] = App;

  Ember['default'].LinkView.reopen({
    attributeBindings: ["data-toggle", "data-placement"]
  });

  Ember['default'].TextField.reopen({
    attributeBindings: ["data-error"]
  });

});
define('mylab/components/file-picker', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    classNames: ["file-picker"],
    classNameBindings: ["multiple:multiple:single"],
    accept: "*",
    multiple: false,
    preview: true,
    dropzone: true,
    progress: true,
    readAs: "readAsFile",

    progressStyle: Ember['default'].computed("progressValue", function () {
      var width = this.get("progressValue") || 0;
      return "width: " + width + "%;";
    }),

    /**
     * When the component got inserted
     */
    didInsertElement: function didInsertElement() {
      this.hideInput();
      this.hidePreview();
      this.hideProgress();

      this.$(".file-picker__input").on("change", this.filesSelected.bind(this));
    },

    willDestroyElement: function willDestroyElement() {
      this.$(".file-picker__input").off("change", this.filesSelected.bind(this));
    },

    /**
     * When the file input changed (a file got selected)
     * @param  {Event} event The file change event
     */
    filesSelected: function filesSelected(event) {
      this.handleFiles(event.target.files);
    },

    handleFiles: function handleFiles(files) {
      // TODO implement
      // if (!this.isValidFileType(files)) {
      //   this.set('errors.fileTypeNotAllowed', true);
      //   return;
      // }

      if (this.get("preview")) {
        this.updatePreview(files);
      }

      if (this.get("multiple")) {
        this.sendAction("filesLoaded", files);
      } else {
        if (this.get("readAs") === "readAsFile") {
          this.sendAction("fileLoaded", files[0]);
        } else {
          this.readFile(files[0], this.get("readAs")).then((function (file) {
            this.sendAction("fileLoaded", file);
          }).bind(this));
        }
      }
    },

    /**
     * Update preview
     * @param  {Array} files The selected files
     */
    updatePreview: function updatePreview(files) {
      if (this.get("multiple")) {} else {
        this.clearPreview();
        this.$(".file-picker__progress").show();

        this.readFile(files[0], "readAsDataURL").then(this.addPreviewImage.bind(this));

        this.$(".file-picker__dropzone").hide();
      }

      this.$(".file-picker__preview").show();
    },

    addPreviewImage: function addPreviewImage(file) {
      var image = this.$("<img src=\"" + file.data + "\" class=\"file-picker__preview__image " + (this.get("multiple") ? "multiple" : "single") + "\">");

      this.hideProgress();
      this.$(".file-picker__preview").append(image);
    },

    /**
     * Reads a file 
     * @param {File} file A file
     * @param {String} readAs One of
     *  - readAsArrayBuffer
     *  - readAsBinaryString
     *  - readAsDataURL
     *  - readAsText
     * @return {Promise}
     */
    readFile: function readFile(file, readAs) {
      var reader = new FileReader();

      Ember['default'].assert("readAs method \"" + readAs + "\" not implemented", reader[readAs] && readAs !== "abort");

      return new Ember['default'].RSVP.Promise((function (resolve, reject) {
        reader.onload = function (event) {
          resolve({
            // TODO rename to file / breaking change
            filename: file.name,
            type: file.type,
            data: event.target.result,
            size: file.size
          });
        };

        reader.onabort = function () {
          reject({ event: "onabort" });
        };

        reader.onerror = function (error) {
          reject({ event: "onerror", error: error });
        };

        reader.onprogress = (function (event) {
          this.set("progressValue", event.loaded / event.total * 100);
        }).bind(this);

        reader[readAs](file);
      }).bind(this));
    },

    hideInput: function hideInput() {
      this.$(".file-picker__input").hide();
    },

    hidePreview: function hidePreview() {
      this.$(".file-picker__preview").hide();
    },

    hideProgress: function hideProgress() {
      this.$(".file-picker__progress").hide();
    },

    clearPreview: (function () {
      if (this.get("removePreview")) {
        this.$(".file-picker__preview").html("");
        this.hidePreview();
        this.$(".file-picker__dropzone").show();

        // reset
        this.set("removePreview", false);
      }
    }).observes("removePreview"),

    // handles DOM events
    eventManager: {
      // Trigger a input click to open file dialog
      click: function click(event, view) {
        view.$(".file-picker__input").trigger("click");
      },
      dragOver: function dragOver(event, view) {
        if (event.preventDefault) {
          event.preventDefault();
        }

        event.dataTransfer.dropEffect = "copy";
      },
      dragEnter: function dragEnter(event, view) {
        if (!view.get("multiple")) {
          view.clearPreview();
        }

        view.$().addClass("over");
      },
      dragLeave: function dragLeave(event, view) {
        view.$().removeClass("over");
      },
      drop: function drop(event, view) {
        if (event.preventDefault) {
          event.preventDefault();
        }

        view.handleFiles(event.dataTransfer.files);
      }
    }
  });

  // TODO

});
define('mylab/components/flash-message', ['exports', 'ember-cli-flash/components/flash-message'], function (exports, FlashMessage) {

	'use strict';

	exports['default'] = FlashMessage['default'];

});
define('mylab/components/markdown-to-html', ['exports', 'ember', 'ember-cli-showdown/components/markdown-to-html'], function (exports, Ember, MarkdownToHtmlComponent) {

  'use strict';

  exports['default'] = MarkdownToHtmlComponent['default'].extend({
    afterInit: (function () {
      this.converter = new Showdown.converter({ extensions: ["table", "github"] });
    }).on("init")
  });

});
define('mylab/components/page-numbers', ['exports', 'ember', 'ember-cli-pagination/util', 'ember-cli-pagination/lib/page-items', 'ember-cli-pagination/validate'], function (exports, Ember, Util, PageItems, Validate) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    currentPageBinding: "content.page",
    totalPagesBinding: "content.totalPages",

    hasPages: Ember['default'].computed.gt("totalPages", 1),

    watchInvalidPage: (function () {
      var me = this;
      var c = this.get("content");
      if (c && c.on) {
        c.on("invalidPage", function (e) {
          me.sendAction("invalidPageAction", e);
        });
      }
    }).observes("content"),

    truncatePages: true,
    numPagesToShow: 10,

    validate: function validate() {
      if (Util['default'].isBlank(this.get("currentPage"))) {
        Validate['default'].internalError("no currentPage for page-numbers");
      }
      if (Util['default'].isBlank(this.get("totalPages"))) {
        Validate['default'].internalError("no totalPages for page-numbers");
      }
    },

    pageItemsObj: (function () {
      return PageItems['default'].create({
        parent: this,
        currentPageBinding: "parent.currentPage",
        totalPagesBinding: "parent.totalPages",
        truncatePagesBinding: "parent.truncatePages",
        numPagesToShowBinding: "parent.numPagesToShow",
        showFLBinding: "parent.showFL"
      });
    }).property(),

    //pageItemsBinding: "pageItemsObj.pageItems",

    pageItems: (function () {
      this.validate();
      return this.get("pageItemsObj.pageItems");
    }).property("pageItemsObj.pageItems", "pageItemsObj"),

    canStepForward: (function () {
      var page = Number(this.get("currentPage"));
      var totalPages = Number(this.get("totalPages"));
      return page < totalPages;
    }).property("currentPage", "totalPages"),

    canStepBackward: (function () {
      var page = Number(this.get("currentPage"));
      return page > 1;
    }).property("currentPage"),

    actions: {
      pageClicked: function pageClicked(number) {
        Util['default'].log("PageNumbers#pageClicked number " + number);
        this.set("currentPage", number);
        this.sendAction("action", number);
      },
      incrementPage: function incrementPage(num) {
        var currentPage = Number(this.get("currentPage")),
            totalPages = Number(this.get("totalPages"));

        if (currentPage === totalPages && num === 1) {
          return false;
        }
        if (currentPage <= 1 && num === -1) {
          return false;
        }
        this.incrementProperty("currentPage", num);

        var newPage = this.get("currentPage");
        this.sendAction("action", newPage);
      }
    }
  });

});
define('mylab/components/select-2', ['exports', 'ember-select-2/components/select-2'], function (exports, Select2Component) {

	'use strict';

	/*
		This is just a proxy file requiring the component from the /addon folder and
		making it available to the dummy application!
	 */
	exports['default'] = Select2Component['default'];

});
define('mylab/components/zero-clipboard', ['exports', 'ember', 'ember-cli-zero-clipboard/components/zero-clipboard'], function (exports, Ember, ZeroClipboard) {

  'use strict';

  exports['default'] = ZeroClipboard['default'].extend({
    actions: {
      afterCopy: function afterCopy() {
        Ember['default'].get(this, "flashMessages").success("Url copied to clipboard!");
      }
    }
  });

});
define('mylab/controllers/application', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({});

});
define('mylab/controllers/categories/base', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
      save: function save() {
        var _this = this;
        this.get("model").save().then(function (category) {
          Ember['default'].get(_this, "flashMessages").success("Category saved!");
          _this.transitionToRoute("categories.show", category);
        });
      }
    }
  });

});
define('mylab/controllers/categories/edit', ['exports', 'mylab/controllers/categories/base'], function (exports, CategoriesBaseController) {

  'use strict';

  exports['default'] = CategoriesBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("categories.show", this.get("model"));
      }
    }
  });

});
define('mylab/controllers/categories/new', ['exports', 'mylab/controllers/categories/base'], function (exports, CategoriesBaseController) {

  'use strict';

  exports['default'] = CategoriesBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("categories");
      }
    }
  });

});
define('mylab/controllers/documents', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    sortProperties: ["name"],
    currentDocumentChanged: (function () {
      if (this.get("currentDocument")) {
        this.transitionToRoute("documents.show", this.get("currentDocument"));
      } else {
        this.transitionToRoute("documents");
      }
    }).observes("currentDocument") });

});
define('mylab/controllers/documents/base', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    categories: function categories() {
      return this.get("model.store").find("document");
    },
    actions: {
      save: function save() {
        var _this = this;
        this.get("model").save().then(function (document) {
          Ember['default'].get(_this, "flashMessages").success("Document saved!", { sticky: true });
          _this.transitionToRoute("documents.show", document);
        });
      }
    } });

});
define('mylab/controllers/documents/edit', ['exports', 'mylab/controllers/documents/base'], function (exports, DocumentsBaseController) {

  'use strict';

  exports['default'] = DocumentsBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("documents.show", this.get("model"));
      }
    }
  });

});
define('mylab/controllers/documents/new', ['exports', 'mylab/controllers/documents/base'], function (exports, DocumentsBaseController) {

  'use strict';

  exports['default'] = DocumentsBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("documents");
      }
    }
  });

});
define('mylab/controllers/documents/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
      fileLoaded: function fileLoaded(file) {
        var self = this;
        // readAs="readAsFile"
        console.log(file.name, file.filename, file.type, file.size);

        if (isImage(file)) {
          savePicture(file);
        } else if (isDocument(file)) {
          saveAttachment(file);
        };

        function savePicture(file) {
          var picture = self.get("store").createRecord("picture", {
            picturableId: self.get("model.id"),
            picturableType: self.get("model.constructor.typeKey").classify(),
            image: file
          });
          picture.save().then(reloadDocument)["catch"](failure);
        };

        function saveAttachment(file) {
          var attachment = self.get("store").createRecord("attachment", {
            attachableId: self.get("model.id"),
            attachableType: self.get("model.constructor.typeKey").classify(),
            name: file.filename,
            file: file
          });
          attachment.save().then(reloadDocument)["catch"](failure);
        };

        function reloadDocument(pictureData) {
          self.get("model").reload();
          $(".file-picker__preview").hide();
        };

        function failure(reason) {
          console.log("FAILURE!!!", reason.message);
        };

        function isImage(file) {
          var fileTypes = ["image/png", "image/jpg", "image/jpeg", "image/tiff"];
          return $.inArray(file.type, fileTypes) >= 0;
        };

        function isDocument(file) {
          var fileTypes = ["application/msword", "text/plain", "text/richtext", "text/richtext", "application/rtf", "application/pdf"];
          return $.inArray(file.type, fileTypes) >= 0;
        };
      }
    }
  });

});
define('mylab/controllers/groups/base', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
      save: function save() {
        var _this = this;
        this.get("model").save().then(function (group) {
          Ember['default'].get(_this, "flashMessages").success("Group saved!");
          _this.transitionToRoute("groups.show", group);
        });
      }
    }
  });

});
define('mylab/controllers/groups/edit', ['exports', 'mylab/controllers/groups/base'], function (exports, GroupsBaseController) {

  'use strict';

  exports['default'] = GroupsBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("groups.show", this.get("model"));
      }
    }
  });

});
define('mylab/controllers/groups/new', ['exports', 'mylab/controllers/groups/base'], function (exports, GroupsBaseController) {

  'use strict';

  exports['default'] = GroupsBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("groups");
      }
    }
  });

});
define('mylab/controllers/login', ['exports', 'ember', 'simple-auth/mixins/login-controller-mixin'], function (exports, Ember, LoginControllerMixin) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend(LoginControllerMixin['default'], {
    authenticator: "simple-auth-authenticator:devise" });

  // actions: {
  //   authenticate: function() {
  //     var data = this.getProperties('identification', 'password');
  //     return this.get('session').authenticate('simple-auth-authenticator:devise', data);
  //   }
  // }

});
define('mylab/controllers/memberships/base', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    categories: function categories() {
      return this.get("model.store").find("document");
    },
    actions: {
      save: function save() {
        var _this = this;
        this.get("model").save().then(function (document) {
          Ember['default'].get(_this, "flashMessages").success("Document saved!", { sticky: true });
          _this.transitionToRoute("documents.show", document);
        });
      }
    } });

});
define('mylab/controllers/memberships/edit', ['exports', 'mylab/controllers/memberships/base'], function (exports, DocumentsBaseController) {

  'use strict';

  exports['default'] = DocumentsBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("documents.show", this.get("model"));
      }
    }
  });

});
define('mylab/controllers/memberships/new', ['exports', 'mylab/controllers/memberships/base'], function (exports, DocumentsBaseController) {

  'use strict';

  exports['default'] = DocumentsBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("documents");
      }
    }
  });

});
define('mylab/controllers/memberships/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
      fileLoaded: function fileLoaded(file) {
        var self = this;
        // readAs="readAsFile"
        console.log(file.name, file.filename, file.type, file.size);

        if (isImage(file)) {
          savePicture(file);
        } else if (isDocument(file)) {
          saveAttachment(file);
        };

        function savePicture(file) {
          var picture = self.get("store").createRecord("picture", {
            picturableId: self.get("model.id"),
            picturableType: self.get("model.constructor.typeKey").classify(),
            image: file
          });
          picture.save().then(reloadDocument)["catch"](failure);
        };

        function saveAttachment(file) {
          var attachment = self.get("store").createRecord("attachment", {
            attachableId: self.get("model.id"),
            attachableType: self.get("model.constructor.typeKey").classify(),
            name: file.filename,
            file: file
          });
          attachment.save().then(reloadDocument)["catch"](failure);
        };

        function reloadDocument(pictureData) {
          self.get("model").reload();
          $(".file-picker__preview").hide();
        };

        function failure(reason) {
          console.log("FAILURE!!!", reason.message);
        };

        function isImage(file) {
          var fileTypes = ["image/png", "image/jpg", "image/jpeg", "image/tiff"];
          return $.inArray(file.type, fileTypes) >= 0;
        };

        function isDocument(file) {
          var fileTypes = ["application/msword", "text/plain", "text/richtext", "text/richtext", "application/rtf", "application/pdf"];
          return $.inArray(file.type, fileTypes) >= 0;
        };
      }
    }
  });

});
define('mylab/controllers/users/base', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
      save: function save() {
        var _this = this;
        this.get("model").save().then(function (group) {
          Ember['default'].get(_this, "flashMessages").success("User saved!");
          _this.transitionToRoute("users.show", user);
        });
      }
    }
  });

});
define('mylab/controllers/users/edit', ['exports', 'mylab/controllers/users/base'], function (exports, UsersBaseController) {

  'use strict';

  exports['default'] = UsersBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("users.show", this.get("model"));
      }
    }
  });

});
define('mylab/controllers/users/new', ['exports', 'mylab/controllers/users/base'], function (exports, UsersBaseController) {

  'use strict';

  exports['default'] = UsersBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("users");
      }
    }
  });

});
define('mylab/controllers/versions', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    needs: ["documents/show"],
    sortProperties: ["createdAt"],
    sortAscending: false,

    currentVersionChanged: (function () {
      if (this.get("currentVersion")) {
        this.transitionToRoute("versions.show", this.get("currentVersion"));
      } else {
        this.transitionToRoute("versions");
      }
    }).observes("currentVersion"),

    actions: {
      createVersionFromWordFile: function createVersionFromWordFile(file) {
        var _this = this;
        var docu = this.get("model.document");
        var docx = this.get("store").createRecord("docx", {
          doc: file
        });
        docx.save().then(function (d) {
          var document = _this.get("controllers.documents/show.model");
          var version = _this.get("store").createRecord("version", {
            contentMd: d.get("markdown"),
            document: document
          });
          version.save().then(function (v) {
            document.get("versions").pushObject(v);
            _this.flashMessage({
              content: "Docx successfully converted", // String
              duration: 2000, // Number in milliseconds
              type: "success" });
            _this.transitionToRoute("versions.show", v);
          });
        });
      }
    }
  });
  // String

});
define('mylab/controllers/versions/base', ['exports', 'ember', 'ic-ajax'], function (exports, Ember, ajax) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
      save: function save() {
        var _this = this;
        this.get("model.document").save();
        this.get("model").save().then(function (document) {
          _this.transitionToRoute("versions.show", document);
          _this.flashMessage({
            content: "Version saved",
            duration: 2000, // Number in milliseconds
            type: "success" });
        });
      }
    }
  });
  // String

});
define('mylab/controllers/versions/duplicate', ['exports', 'mylab/controllers/versions/base'], function (exports, VersionsBaseController) {

  'use strict';

  exports['default'] = VersionsBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("versions");
      }
    }
  });

});
define('mylab/controllers/versions/edit', ['exports', 'mylab/controllers/versions/base'], function (exports, VersionsBaseController) {

  'use strict';

  exports['default'] = VersionsBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("versions.show", this.get("model"));
      } }
  });

});
define('mylab/controllers/versions/new', ['exports', 'mylab/controllers/versions/base'], function (exports, VersionsBaseController) {

  'use strict';

  exports['default'] = VersionsBaseController['default'].extend({
    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("versions");
      }
    }
  });

});
define('mylab/flash/object', ['exports', 'ember-cli-flash/flash/object'], function (exports, Flash) {

	'use strict';

	exports['default'] = Flash['default'];

});
define('mylab/helpers/fa-icon', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var FA_PREFIX = /^fa\-.+/;

  var warn = Ember['default'].Logger.warn;

  /**
   * Handlebars helper for generating HTML that renders a FontAwesome icon.
   *
   * @param  {String} name    The icon name. Note that the `fa-` prefix is optional.
   *                          For example, you can pass in either `fa-camera` or just `camera`.
   * @param  {Object} options Options passed to helper.
   * @return {Ember.Handlebars.SafeString} The HTML markup.
   */
  var faIcon = function faIcon(name, options) {
    if (Ember['default'].typeOf(name) !== "string") {
      var message = "fa-icon: no icon specified";
      warn(message);
      return Ember['default'].String.htmlSafe(message);
    }

    var params = options.hash,
        classNames = [],
        html = "";

    classNames.push("fa");
    if (!name.match(FA_PREFIX)) {
      name = "fa-" + name;
    }
    classNames.push(name);
    if (params.spin) {
      classNames.push("fa-spin");
    }
    if (params.flip) {
      classNames.push("fa-flip-" + params.flip);
    }
    if (params.rotate) {
      classNames.push("fa-rotate-" + params.rotate);
    }
    if (params.lg) {
      warn("fa-icon: the 'lg' parameter is deprecated. Use 'size' instead. I.e. {{fa-icon size=\"lg\"}}");
      classNames.push("fa-lg");
    }
    if (params.x) {
      warn("fa-icon: the 'x' parameter is deprecated. Use 'size' instead. I.e. {{fa-icon size=\"" + params.x + "\"}}");
      classNames.push("fa-" + params.x + "x");
    }
    if (params.size) {
      if (Ember['default'].typeOf(params.size) === "string" && params.size.match(/\d+/)) {
        params.size = Number(params.size);
      }
      if (Ember['default'].typeOf(params.size) === "number") {
        classNames.push("fa-" + params.size + "x");
      } else {
        classNames.push("fa-" + params.size);
      }
    }
    if (params.fixedWidth) {
      classNames.push("fa-fw");
    }
    if (params.listItem) {
      classNames.push("fa-li");
    }
    if (params.pull) {
      classNames.push("pull-" + params.pull);
    }
    if (params.border) {
      classNames.push("fa-border");
    }
    if (params.classNames && !Ember['default'].isArray(params.classNames)) {
      params.classNames = [params.classNames];
    }
    if (!Ember['default'].isEmpty(params.classNames)) {
      Array.prototype.push.apply(classNames, params.classNames);
    }

    html += "<";
    var tagName = params.tagName || "i";
    html += tagName;
    html += " class='" + classNames.join(" ") + "'";
    if (params.title) {
      html += " title='" + params.title + "'";
    }
    if (params.ariaHidden === undefined || params.ariaHidden) {
      html += " aria-hidden=\"true\"";
    }
    html += "></" + tagName + ">";
    return Ember['default'].String.htmlSafe(html);
  };

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(faIcon);

  exports.faIcon = faIcon;

});
define('mylab/helpers/formatted-date', ['exports', 'ember', 'mylab/utils/date-helpers'], function (exports, Ember, date_helpers) {

  'use strict';

  exports.formattedDate = formattedDate;

  function formattedDate(date, format) {
    return date_helpers.formatDate(date, format);
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(formattedDate);

});
define('mylab/initializers/app-version', ['exports', 'mylab/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;
  var registered = false;

  exports['default'] = {
    name: "App Version",
    initialize: function initialize(container, application) {
      if (!registered) {
        var appName = classify(application.toString());
        Ember['default'].libraries.register(appName, config['default'].APP.version);
        registered = true;
      }
    }
  };

});
define('mylab/initializers/export-application-global', ['exports', 'ember', 'mylab/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('mylab/initializers/flash-messages-service', ['exports', 'ember-cli-flash/services/flash-messages-service', 'mylab/config/environment'], function (exports, FlashMessagesService, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(_container, application) {
    var flashMessageDefaults = config['default'].flashMessageDefaults;
    var injectionFactories = flashMessageDefaults.injectionFactories;

    application.register("config:flash-messages", flashMessageDefaults, { instantiate: false });
    application.register("service:flash-messages", FlashMessagesService['default'], { singleton: true });
    application.inject("service:flash-messages", "flashMessageDefaults", "config:flash-messages");

    injectionFactories.forEach(function (factory) {
      application.inject(factory, "flashMessages", "service:flash-messages");
    });
  }

  exports['default'] = {
    name: "flash-messages-service",
    initialize: initialize
  };

});
define('mylab/initializers/simple-auth-config', ['exports', 'ember', 'simple-auth/session', 'simple-auth-devise/authenticators/devise', 'mylab/config/environment'], function (exports, Ember, Session, DeviseAuthenticator, config) {

  'use strict';

  exports['default'] = {
    name: "simple-auth-config",
    before: "simple-auth",

    initialize: function initialize(container, application) {

      DeviseAuthenticator['default'].reopen({
        invalidate: function invalidate() {
          return Ember['default'].$.ajax({
            url: config['default'].apiHost + "/users/sign_out",
            type: "DELETE",
            dataType: "JSON"
          });
        }
      });

      Session['default'].reopen({
        currentUser: (function () {
          var userId = this.get("user_id");
          if (!Ember['default'].isEmpty(userId)) {
            return container.lookup("store:main").find("user", userId);
          };
        }).property("user_id")
      });
    }
  };

});
define('mylab/initializers/simple-auth-devise', ['exports', 'simple-auth-devise/configuration', 'simple-auth-devise/authenticators/devise', 'simple-auth-devise/authorizers/devise', 'mylab/config/environment'], function (exports, Configuration, Authenticator, Authorizer, ENV) {

  'use strict';

  exports['default'] = {
    name: "simple-auth-devise",
    before: "simple-auth",
    initialize: function initialize(container, application) {
      Configuration['default'].load(container, ENV['default']["simple-auth-devise"] || {});
      container.register("simple-auth-authorizer:devise", Authorizer['default']);
      container.register("simple-auth-authenticator:devise", Authenticator['default']);
    }
  };

});
define('mylab/initializers/simple-auth', ['exports', 'simple-auth/configuration', 'simple-auth/setup', 'mylab/config/environment'], function (exports, Configuration, setup, ENV) {

  'use strict';

  exports['default'] = {
    name: "simple-auth",
    initialize: function initialize(container, application) {
      Configuration['default'].load(container, ENV['default']["simple-auth"] || {});
      setup['default'](container, application);
    }
  };

});
define('mylab/initializers/tooltip', ['exports'], function (exports) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {}

  exports['default'] = {
    name: "tooltip",
    initialize: function initialize() {
      $(document).ready(function () {
        $("body").tooltip({
          selector: "[data-toggle=\"tooltip\"]"
        });
      });
    } };
  /* container, application */
  // application.inject('route', 'foo', 'service:foo');

});
define('mylab/models/attachment', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    file: DS['default'].attr("raw"),
    url: DS['default'].attr("string", { readOnly: true }),
    name: DS['default'].attr("string"),
    attachableId: DS['default'].attr("number"),
    attachableType: DS['default'].attr("string"),
    attachable: (function () {
      debugger;
    }).property("attachableId", "attachableType").readOnly()
  });

});
define('mylab/models/category', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string"),
    documents: DS['default'].hasMany("document", { async: true })
  });

});
define('mylab/models/document', ['exports', 'ember-data', 'mylab/models/picturable'], function (exports, DS, Picturable) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string"),

    category: DS['default'].belongsTo("category", { async: true }),
    pictures: DS['default'].hasMany("picture", { async: true }),
    attachments: DS['default'].hasMany("attachment", { async: true }),

    versions: DS['default'].hasMany("version", { async: true }),

    nameForSelectMenu: (function () {
      return this.get("name");
    }).property("name"),

    previousVersions: (function () {
      var sortedVersions = this.get("versions").sortBy("createdAt");
      var lastVersion = sortedVersions.get("firstObject");
      return sortedVersions.without(lastVersion);
    }).property("versions.@each.createdAt"),

    sortedVersions: (function () {
      return this.get("versions").sortBy("createdAt");
    }).property("versions.@each.createdAt"),

    lastVersion: (function () {
      return this.get("sortedVersions").get("firstObject");
    }).property("sortedVersions"),

    lastUpdatedVersion: (function () {
      var sortedVersions = this.get("versions").sortBy("updatedAt:desc");
      return this.get("sortedVersions").get("firstObject");
    }).property("versions.@each.updatedAt")

  });

});
define('mylab/models/docx', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var attr = DS['default'].attr;

  exports['default'] = DS['default'].Model.extend({
    doc: attr("raw"),
    markdown: DS['default'].attr("string")
  });

});
define('mylab/models/group', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string"),
    memberships: DS['default'].hasMany("membership", { async: true }) });

});
define('mylab/models/membership', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    role: DS['default'].attr("string"),
    user: DS['default'].belongsTo("user", { async: true }),
    group: DS['default'].belongsTo("group", { async: true }) });

});
define('mylab/models/picturable', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    pictures: DS['default'].hasMany("picture", { async: true })
  });

});
define('mylab/models/picture', ['exports', 'ember-data', 'ember'], function (exports, DS, Ember) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    image: DS['default'].attr("raw"),
    filename: DS['default'].attr("string"),
    thumbnails: DS['default'].hasMany("thumbnail"),
    // url: DS.attr('string', {readOnly: true}),
    // urls: DS.attr('string', {readOnly: true}),
    // thumbUrl: DS.attr('string', {readOnly: true}),
    // thumbXsUrl: DS.attr('string', {readOnly: true}),
    thumbSmallUrl: DS['default'].attr("string", { readOnly: true }),
    // mediumUrl: DS.attr('string', {readOnly: true}),
    picturableId: DS['default'].attr("number"),
    picturableType: DS['default'].attr("string") });

  // thumbs: function(){
  //   debugger
  //   var thumbs = [];
  //   return thumbs
  // }.property('thumbnails')

  // picturable: function(){
  // }.property("picturableId", "picturableType").readOnly()

});
define('mylab/models/thumbnail', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string"),
    width: DS['default'].attr("number"),
    height: DS['default'].attr("number"),
    url: DS['default'].attr("string"),
    picture: DS['default'].belongsTo("picture"),

    markdownTag: (function () {
      return "![" + this.get("picture.filename") + "](" + this.get("url") + " '" + this.get("picture.filename") + "')";
    }).property("url", "name", "picture.filename")
  });

});
define('mylab/models/user', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string"),
    email: DS['default'].attr("string"),
    memberships: DS['default'].hasMany("membership", { async: true })
  });

});
define('mylab/models/version', ['exports', 'ember-data', 'mylab/utils/date-helpers', 'mylab/config/environment'], function (exports, DS, dateHelper, config) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string"),
    contentMd: DS['default'].attr("string"),
    contentHtml: DS['default'].attr("string"),
    createdAt: DS['default'].attr("date"),
    updatedAt: DS['default'].attr("date"),

    document: DS['default'].belongsTo("document"),

    pdfUrl: (function () {
      return config['default'].proxy + config['default'].apiHost + "/versions/" + this.get("id") + ".pdf";
    }).property("id"),

    nameForSelectMenu: (function () {
      return "Version '" + this.get("name") + "' (created " + dateHelper['default'].formatDate(this.get("createdAt"), "LL") + ")";
    }).property("name", "createdAt") });

});
define('mylab/router', ['exports', 'ember', 'mylab/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route("login");
    this.route("logout");

    this.resource("categories", function () {
      this.route("new");
      this.route("show", { path: ":category_id" });
      this.route("edit", { path: ":category_id/edit" });
    });
    // this.resource('API::V1::picture', function() {});
    this.resource("documents", { path: "/documents" }, function () {
      this.route("show", { path: ":document_id" }, function () {
        this.resource("versions", function () {

          this.route("show", {
            path: ":version_id"
          });

          this.route("edit", {
            path: ":version_id/edit"
          });

          this.route("duplicate", {
            path: ":version_id/duplicate"
          });

          this.route("pdf", {
            path: ":version_id/pdf"
          });

          this.route("new");
        });
      });

      this.route("edit", {
        path: ":document_id/edit"
      });

      this.route("new");
    });
    this.resource("memberships", function () {
      this.route("show", { path: ":membership_id" });
      this.route("new");
      this.route("edit", { path: ":membership_id/edit" });
    });
    this.resource("users", function () {
      this.route("show", {
        path: ":user_id"
      });
      this.route("new");
      this.route("edit", { path: ":user_id/edit" });
    });
    this.resource("groups", function () {
      this.route("show", { path: ":group_id" });
      this.route("new");
      this.route("edit", { path: ":group_id/edit" });
    });
  });

  exports['default'] = Router;

});
define('mylab/routes/application', ['exports', 'ember', 'simple-auth/mixins/application-route-mixin'], function (exports, Ember, ApplicationRouteMixin) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(ApplicationRouteMixin['default'], {
    beforeModel: function beforeModel() {
      return this.csrf.fetchToken();
    },
    actions: {
      sessionAuthenticationSucceeded: function sessionAuthenticationSucceeded() {
        Ember['default'].get(_this, "flashMessages").success("Successfully signed in!");
        this._super();
      },
      invalidateSession: function invalidateSession() {
        this.get("session").invalidate();
      }
    }
  });

});
define('mylab/routes/categories', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin'], function (exports, Ember, AuthenticatedRouteMixin) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {
    model: function model() {
      return this.store.find("category");
    } });

});
define('mylab/routes/categories/edit', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('mylab/routes/categories/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({

    model: function model(params) {
      return this.modelFor("categories");
    },

    afterModel: function afterModel(model, transition) {
      if (model.length) {
        var lastCategory = model.sortBy("name:asc").get("firstObject");
        return this.transitionTo("documents.show", lastCategory);
      }
    }
  });

});
define('mylab/routes/categories/new', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      return this.store.createRecord("category");
    }
  });

});
define('mylab/routes/categories/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    actions: {
      "delete": function _delete(category) {
        var _this = this;
        if (window.confirm("Are you sure you want to delete this category?")) {
          category.destroyRecord().then(function (v) {
            Ember['default'].get(_this, "flashMessages").success("Category deleted");
            _this.transitionTo("categories");
          });
        }
      } }
  });

});
define('mylab/routes/documents', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin'], function (exports, Ember, AuthenticatedRouteMixin) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {

    // optional. default is 10
    // perPage: 10,

    // queryParams: {
    //   query: {
    //     refreshModel: true
    //   }
    // },

    model: function model(params) {
      return this.store.find("document");
      // return this.findPaged('document', params);
    },

    // afterModel: function(documents, transition){
    //   debugger
    // },

    actions: {
      // didSelect: function(id) {
      //   debugger;
      //   this.transitionTo('documents.show', id);
      // },
      "delete": function _delete(document) {
        var _this = this;
        if (window.confirm("Are you sure you want to delete this document?")) {
          document.destroyRecord().then(function () {
            _this.transitionTo("documents.index");
          });
        }
      },
      deletePicture: function deletePicture(picture) {
        if (window.confirm("Are you sure you want to delete this picture?")) {
          picture.destroyRecord();
        }
      },
      deleteAttachment: function deleteAttachment(attachment) {
        if (window.confirm("Are you sure you want to delete this attachment?")) {
          attachment.destroyRecord();
        }
      }
    }
  });

});
define('mylab/routes/documents/edit', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      var documents = this.modelFor("documents");
      return documents.findBy("id", params.document_id);
    },

    setupController: function setupController(controller, model) {
      this._super(controller, model);
      controller.set("categories", this.store.find("category"));
    }
  });

});
define('mylab/routes/documents/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({

    model: function model(params) {
      return this.modelFor("documents");
    },

    afterModel: function afterModel(model, transition) {
      if (model.length) {
        var lastUpdatedDocument = model.sortBy("updatedAt:desc").get("firstObject");
        return this.transitionTo("documents.show", lastUpdatedDocument);
      }
    }
  });

});
define('mylab/routes/documents/new', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model() {
      return this.store.createRecord("document");
    }

  });

});
define('mylab/routes/documents/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      var documents = this.modelFor("documents");
      return documents.findBy("id", params.document_id);
    },

    setupController: function setupController(controller, model) {
      // Call _super for default behavior
      this._super(controller, model);
      this.controllerFor("documents").set("currentDocument", model);
    },

    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("documents.show", this.get("model"));
      } }
  });

});
define('mylab/routes/documents/show/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      return this.modelFor("documents.show");
    },
    redirect: function redirect(model, transition) {
      this.transitionTo("versions");
    } });

});
define('mylab/routes/groups', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      return this.store.find("group");
      // return this.findPaged('document', params);
    } });

});
define('mylab/routes/groups/new', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      return this.store.createRecord("group");
    }
  });

});
define('mylab/routes/groups/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    actions: {
      "delete": function _delete(group) {
        var _this = this;
        if (window.confirm("Are you sure you want to delete this group?")) {
          group.destroyRecord().then(function (v) {
            Ember['default'].get(_this, "flashMessages").success("Group deleted");
            _this.transitionTo("groups");
          });
        }
      },
      deleteMembership: function deleteMembership(membership) {
        var _this = this;
        if (window.confirm("Are you sure you want to delete this membership?")) {
          membership.destroyRecord().then(function (v) {
            Ember['default'].get(_this, "flashMessages").success("Membership deleted");
          });
        }
      } }
  });

});
define('mylab/routes/login', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    setupController: function setupController(controller, model) {
      return controller.set("validationErrors", null);
    }
  });

});
define('mylab/routes/logout', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    renderTemplate: function renderTemplate(controller) {
      controller.logout();
    }
  });

});
define('mylab/routes/memberships', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin'], function (exports, Ember, AuthenticatedRouteMixin) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {

    model: function model(params) {
      return this.store.find("membership");
    },

    actions: {
      "delete": function _delete(membership) {
        var _this = this;
        if (window.confirm("Are you sure you want to delete this membership?")) {
          membership.destroyRecord().then(function () {
            _this.transitionTo("memberships.index");
          });
        }
      }
    }
  });

});
define('mylab/routes/memberships/edit', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      var memberships = this.modelFor("memberships");
      return memberships.findBy("id", params.membership_id);
    },

    setupController: function setupController(controller, model) {
      this._super(controller, model);
      controller.set("groups", this.store.find("group"));
      controller.set("users", this.store.find("user"));
    }
  });

});
define('mylab/routes/memberships/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({

    model: function model(params) {
      return this.modelFor("memberships");
    }
  });

});
define('mylab/routes/memberships/new', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model() {
      return this.store.createRecord("membership");
    },

    setupController: function setupController(controller, model) {
      this._super(controller, model);
      controller.set("groups", this.store.find("group"));
      controller.set("users", this.store.find("user"));
    }

  });

});
define('mylab/routes/memberships/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      var memberships = this.modelFor("memberships");
      return memberships.findBy("id", params.membership_id);
    },

    setupController: function setupController(controller, model) {
      // Call _super for default behavior
      this._super(controller, model);
      this.controllerFor("memberships").set("currentmembership", model);
    },

    actions: {
      cancel: function cancel() {
        this.model.rollback();
        this.transitionToRoute("memberships.show", this.get("model"));
      } }
  });

});
define('mylab/routes/memberships/show/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      return this.modelFor("memberships.show");
    },
    redirect: function redirect(model, transition) {
      this.transitionTo("versions");
    } });

});
define('mylab/routes/picture', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('mylab/routes/users', ['exports', 'ember', 'simple-auth/mixins/authenticated-route-mixin'], function (exports, Ember, AuthenticatedRouteMixin) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {

    model: function model(params) {
      return this.store.find("user");
    } });

});
define('mylab/routes/users/show', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('mylab/routes/versions', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      var document = this.modelFor("documents/show");
      return document.get("versions").sortBy("createdAt:desc");
    },

    actions: {
      optionSelected: function optionSelected(id) {
        this.transitionTo("versions.show", id);
      } }
  });

});
define('mylab/routes/versions/duplicate', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      var document = this.modelFor("documents.show");
      var version = this.store.createRecord("version");
      document.get("versions").then(function (versions) {
        versions.pushObject(version);
      });
      var parentVersion = this.store.find("version", params.version_id).then(function (v) {
        version.set("contentMd", v.get("contentMd"));
      });

      return version;
    }
  });

});
define('mylab/routes/versions/edit', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      return this.store.find("version", params.version_id);
    },
    deactivate: function deactivate() {
      var model = this.modelFor("versions/edit");
      model.rollback();
    },
    actions: {
      willTransition: function willTransition(transition) {
        var model = this.get("controller.model");
        var leave;
        if (model.get("isDirty")) {
          leave = window.confirm("You have unsaved changes. Are you sure you want to leave?");
          if (leave) {
            model.rollback();
          } else {
            transition.abort();
          }
        }
      }
    }
  });

});
define('mylab/routes/versions/index', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({

    model: function model(params) {
      return this.modelFor("versions");
    },

    redirect: function redirect(model, transition) {
      var lastCreatedVersion = model.sortBy("createdAt:desc").get("firstObject");
      if (lastCreatedVersion) {
        return this.transitionTo("versions.show", lastCreatedVersion);
      }
    }
  });

});
define('mylab/routes/versions/new', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      var document = this.modelFor("documents.show");
      var version = this.store.createRecord("version");
      document.get("versions").pushObject(version);
      return version;
    }
  });

});
define('mylab/routes/versions/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model(params) {
      return this.store.find("version", params.version_id);
    },

    setupController: function setupController(controller, model) {
      // Call _super for default behavior
      this._super(controller, model);
      // Implement your custom setup after
      this.controllerFor("versions").set("currentVersion", model);
    },

    actions: {
      "delete": function _delete(version) {
        var _this = this;
        if (window.confirm("Are you sure you want to delete this version?")) {
          version.destroyRecord().then(function (v) {
            Ember['default'].get(_this, "flashMessages").success("Version deleted");
            _this.transitionTo("documents.show", v.get("document"));
          });
        }
      } }
  });

});
define('mylab/serializers/picture', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].ActiveModelSerializer.extend(DS['default'].EmbeddedRecordsMixin, {
    attrs: {
      thumbnails: { embedded: "always" }
    }
  });

});
define('mylab/services/flash-messages-service', ['exports', 'ember-cli-flash/services/flash-messages-service'], function (exports, FlashMessagesService) {

	'use strict';

	exports['default'] = FlashMessagesService['default'];

});
define('mylab/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","dropdown");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"href","#");
          dom.setAttribute(el2,"class","dropdown-toggle");
          dom.setAttribute(el2,"data-toggle","dropdown");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("span");
          dom.setAttribute(el3,"class","glyphicon glyphicon-user");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("b");
          dom.setAttribute(el3,"class","caret");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          dom.setAttribute(el2,"class","dropdown-menu");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          var el4 = dom.createTextNode("\n              ");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          dom.setAttribute(el3,"class","divider");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("li");
          var el4 = dom.createTextNode("\n              ");
          dom.appendChild(el3, el4);
          var el4 = dom.createElement("a");
          var el5 = dom.createTextNode("Logout");
          dom.appendChild(el4, el5);
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var element2 = dom.childAt(element1, [3]);
          var element3 = dom.childAt(element2, [5, 1]);
          var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),2,3);
          var morph1 = dom.createMorphAt(dom.childAt(element2, [1]),0,1);
          content(env, morph0, context, "session.currentUser.name");
          inline(env, morph1, context, "link-to", ["Settings", "users.show", get(env, context, "session.currentUser")], {});
          element(env, element3, context, "action", ["invalidateSession"], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("Login");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["authenticateSession"], {});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 1,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement, blockArguments) {
          var dom = env.dom;
          var hooks = env.hooks, set = hooks.set, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          set(env, context, "flash", blockArguments[0]);
          inline(env, morph0, context, "flash-message", [], {"flash": get(env, context, "flash")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","navbar navbar-default");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container-fluid");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","navbar-header");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"type","button");
        dom.setAttribute(el4,"class","navbar-toggle collapsed");
        dom.setAttribute(el4,"data-toggle","collapse");
        dom.setAttribute(el4,"data-target","#bs-example-navbar-collapse-1");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","sr-only");
        var el6 = dom.createTextNode("Toggle navigation");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"class","navbar-brand");
        dom.setAttribute(el4,"href","#");
        var el5 = dom.createTextNode("myLab");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","collapse navbar-collapse");
        dom.setAttribute(el3,"id","bs-example-navbar-collapse-1");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4,"class","nav navbar-nav");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4,"class","nav navbar-nav navbar-right");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container-fluid");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","footer");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"href","http://daringfireball.net/projects/markdown/syntax");
        dom.setAttribute(el3,"class","text-muted");
        var el4 = dom.createTextNode("Markdown reference");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline, get = hooks.get, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element4 = dom.childAt(fragment, [0, 1, 3]);
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(fragment, [2]);
        var morph0 = dom.createMorphAt(dom.childAt(element5, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element5, [3]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element5, [5]),0,1);
        var morph3 = dom.createMorphAt(dom.childAt(element5, [7]),0,1);
        var morph4 = dom.createMorphAt(dom.childAt(element5, [9]),0,1);
        var morph5 = dom.createMorphAt(dom.childAt(element4, [3]),0,1);
        var morph6 = dom.createMorphAt(element6,0,1);
        var morph7 = dom.createMorphAt(element6,1,2);
        inline(env, morph0, context, "link-to", ["Documents", "documents"], {});
        inline(env, morph1, context, "link-to", ["Categories", "categories"], {});
        inline(env, morph2, context, "link-to", ["Groups", "groups"], {});
        inline(env, morph3, context, "link-to", ["Memberships", "memberships"], {});
        inline(env, morph4, context, "link-to", ["Users", "users"], {});
        block(env, morph5, context, "if", [get(env, context, "session.isAuthenticated")], {}, child0, child1);
        block(env, morph6, context, "each", [get(env, context, "flashMessages.queue")], {}, child2, null);
        content(env, morph7, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/attachments/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("li");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("a");
        dom.setAttribute(el2,"href","#");
        dom.setAttribute(el2,"class","btn btn-danger");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","glyphicon glyphicon-trash");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    Destroy\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, content = hooks.content, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element0, [3]);
        var morph0 = dom.createMorphAt(element1,0,1);
        element(env, element1, context, "bind-attr", [], {"href": "attachment.url"});
        content(env, morph0, context, "attachment.name");
        element(env, element2, context, "action", ["deleteAttachment", get(env, context, "attachment")], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/categories', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-plus");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" New category\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","list-group-item");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          inline(env, morph0, context, "link-to", [get(env, context, "category.name"), "categories.show", get(env, context, "category")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 col-md-4 col-lg-4");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("\n      Categories\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","list-group");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 col-md-8 col-lg-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [1, 1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        block(env, morph0, context, "link-to", ["categories.new"], {"classNames": "btn btn-primary", "title": "Create a new category"}, child0, null);
        block(env, morph1, context, "each", [get(env, context, "arrangedContent")], {"keyword": "category"}, child1, null);
        content(env, morph2, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/categories/-form', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        var el4 = dom.createTextNode("\n      Name\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"type","submit");
        dom.setAttribute(el2,"value","Save");
        dom.setAttribute(el2,"class","btn btn-success");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn btn-default");
        var el3 = dom.createTextNode("cancel");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [5]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1, 1]),0,1);
        element(env, element0, context, "action", ["save"], {"on": "submit"});
        inline(env, morph0, context, "input", [], {"value": get(env, context, "model.name"), "classNames": "form-control"});
        element(env, element1, context, "action", ["cancel"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/categories/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("Edit category '");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("'");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,1);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        content(env, morph0, context, "model.name");
        inline(env, morph1, context, "partial", ["categories/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/categories/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("New category");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,1,2,contextualElement);
        inline(env, morph0, context, "partial", ["categories/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/categories/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-edit");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","list-group-item");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
            inline(env, morph0, context, "link-to", [get(env, context, "document.name"), "documents.show", get(env, context, "document")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h4");
          var el2 = dom.createTextNode("Documents");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1,"class","list-group");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),0,1);
          block(env, morph0, context, "each", [get(env, context, "model.documents")], {"keyword": "document"}, child0, null);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","well");
          var el2 = dom.createTextNode("\n      No documents\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col-md-12");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        var el3 = dom.createTextNode("\n    Category '");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("'\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("small");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","btn-group");
        dom.setAttribute(el4,"role","group");
        dom.setAttribute(el4,"aria-label","...");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"href","#");
        dom.setAttribute(el5,"class","btn btn-danger");
        dom.setAttribute(el5,"title","Destroy this category");
        dom.setAttribute(el5,"data-toggle","tooltip");
        dom.setAttribute(el5,"data-placement","top");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","glyphicon glyphicon-trash");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element1, [2, 1]);
        var element3 = dom.childAt(element2, [2]);
        var morph0 = dom.createMorphAt(element1,0,1);
        var morph1 = dom.createMorphAt(element2,0,1);
        var morph2 = dom.createMorphAt(element0,2,-1);
        content(env, morph0, context, "model.name");
        block(env, morph1, context, "link-to", ["categories.edit", get(env, context, "model")], {"classNames": "btn btn-primary", "title": "Edit this category", "data-toggle": "tooltip", "data-placement": "top"}, child0, null);
        element(env, element3, context, "action", ["delete", get(env, context, "model")], {});
        block(env, morph2, context, "if", [get(env, context, "model.documents")], {}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/components/file-picker', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","file-picker__dropzone");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          content(env, morph0, context, "yield");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "yield");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","file-picker__preview");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","file-picker__progress");
          var el2 = dom.createTextNode("\n    ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","file-picker__progress__value");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "bind-attr", [], {"style": "progressStyle"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,4]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        var morph2 = dom.createMorphAt(fragment,2,3,contextualElement);
        var morph3 = dom.createMorphAt(fragment,3,4,contextualElement);
        block(env, morph0, context, "if", [get(env, context, "dropzone")], {}, child0, child1);
        block(env, morph1, context, "if", [get(env, context, "preview")], {}, child2, null);
        block(env, morph2, context, "if", [get(env, context, "progress")], {}, child3, null);
        inline(env, morph3, context, "input", [], {"type": "file", "value": get(env, context, "file"), "accept": get(env, context, "accept"), "multiple": get(env, context, "multiple"), "class": "file-picker__input"});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/components/file-upload', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "yield");
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/components/flash-message', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "yield", [get(env, context, "this"), get(env, context, "flash")], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("div");
            dom.setAttribute(el1,"class","alert-progress");
            var el2 = dom.createTextNode("\n      ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","alert-progressBar");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, attribute = hooks.attribute;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1, 1]);
            var attrMorph0 = dom.createAttrMorph(element0, 'style');
            attribute(env, attrMorph0, element0, "style", get(env, context, "progressDuration"));
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[2]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
          content(env, morph0, context, "flash.message");
          block(env, morph1, context, "if", [get(env, context, "showProgressBar")], {}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "if", [get(env, context, "template")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/components/markdown-to-html', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "html");
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/components/message-queue', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "flash-message", [], {"message": get(env, context, "message")});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "each", [get(env, context, "untimedMessages")], {"keyword": "message"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "flash-message", [], {"message": get(env, context, "currentMessage")});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,2]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        block(env, morph0, context, "if", [get(env, context, "untimedMessages")], {}, child0, null);
        block(env, morph1, context, "if", [get(env, context, "currentMessage")], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/components/page-numbers', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","arrow prev enabled-arrow");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("«");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element4 = dom.childAt(fragment, [1, 1]);
          element(env, element4, context, "action", ["incrementPage", -1], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","arrow prev disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("«");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element3 = dom.childAt(fragment, [1, 1]);
          element(env, element3, context, "action", ["incrementPage", -1], {});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","active page-number");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1, 1]),-1,-1);
            content(env, morph0, context, "item.page");
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","page-number");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("a");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element2 = dom.childAt(fragment, [1, 1]);
            var morph0 = dom.createMorphAt(element2,-1,-1);
            element(env, element2, context, "action", ["pageClicked", get(env, context, "item.page")], {});
            content(env, morph0, context, "item.page");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "if", [get(env, context, "item.current")], {}, child0, child1);
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","arrow next enabled-arrow");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("»");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1, 1]);
          element(env, element1, context, "action", ["incrementPage", 1], {});
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("li");
          dom.setAttribute(el1,"class","arrow next disabled");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          var el3 = dom.createTextNode("»");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["incrementPage", 1], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","pagination-centered");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        dom.setAttribute(el2,"class","pagination");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element5 = dom.childAt(fragment, [0, 1]);
        var morph0 = dom.createMorphAt(element5,0,1);
        var morph1 = dom.createMorphAt(element5,1,2);
        var morph2 = dom.createMorphAt(element5,2,3);
        block(env, morph0, context, "if", [get(env, context, "canStepBackward")], {}, child0, child1);
        block(env, morph1, context, "each", [get(env, context, "pageItems")], {"keyword": "item"}, child2, null);
        block(env, morph2, context, "if", [get(env, context, "canStepForward")], {}, child3, child4);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/components/zero-clipboard', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("a");
        var el2 = dom.createElement("span");
        dom.setAttribute(el2,"class","glyphicon glyphicon-copy");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        element(env, element0, context, "bind-attr", [], {"class": get(env, context, "innerClass"), "title": get(env, context, "label")});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/documents', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-plus");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" Create a new document\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 col-md-4 col-lg-2");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("Documents");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 col-md-8 col-lg-10");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [3, 1]),0,1);
        var morph1 = dom.createMorphAt(element1,4,5);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        inline(env, morph0, context, "select-2", [], {"content": get(env, context, "arrangedContent"), "value": get(env, context, "currentDocument"), "optionLabelPath": "name", "placeholder": "Select a document", "allowClear": true});
        block(env, morph1, context, "link-to", ["documents.new"], {"classNames": "btn btn-primary", "title": "Create a new document"}, child0, null);
        content(env, morph2, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/documents/-form', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        var el4 = dom.createTextNode("\n      Name\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        var el4 = dom.createTextNode("\n      Category\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"type","submit");
        dom.setAttribute(el2,"value","Save");
        dom.setAttribute(el2,"class","btn btn-success");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn btn-default");
        var el3 = dom.createTextNode("cancel");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [7]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1, 1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3, 1]),0,1);
        element(env, element0, context, "action", ["save"], {"on": "submit"});
        inline(env, morph0, context, "input", [], {"value": get(env, context, "model.name"), "classNames": "form-control document-form-name"});
        inline(env, morph1, context, "select-2", [], {"content": get(env, context, "categories"), "value": get(env, context, "model.category"), "optionLabelPath": "name", "placeholder": "Select a category", "allowClear": true});
        element(env, element1, context, "action", ["cancel"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/documents/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("Edit '");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("'");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,1);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        content(env, morph0, context, "model.name");
        inline(env, morph1, context, "partial", ["documents/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/documents/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","well");
        var el2 = dom.createTextNode("\n  Please select a document\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/documents/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("New document");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,1,2,contextualElement);
        inline(env, morph0, context, "partial", ["documents/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/documents/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("small");
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          content(env, morph0, context, "model.category.name");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-edit");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-plus");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        Drag/click to upload a file\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "view", ["attachments/show", get(env, context, "attachment")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","col-md-12");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h3");
          var el3 = dom.createTextNode("Attachments ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),0,-1);
          var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
          content(env, morph0, context, "model.attachments.length");
          block(env, morph1, context, "each", [get(env, context, "model.attachments")], {"keyword": "attachment"}, child0, null);
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "view", ["pictures/show", get(env, context, "picture")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","col-md-12");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h3");
          var el3 = dom.createTextNode("Pictures (");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(")");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,1);
          var morph1 = dom.createMorphAt(element0,2,3);
          content(env, morph0, context, "model.pictures.length");
          block(env, morph1, context, "each", [get(env, context, "model.pictures")], {"keyword": "picture"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col-md-12");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h1");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("          ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-4");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","btn-group");
        dom.setAttribute(el3,"role","group");
        dom.setAttribute(el3,"aria-label","...");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"href","#");
        dom.setAttribute(el4,"class","btn btn-danger");
        dom.setAttribute(el4,"title","Destroy this document");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","glyphicon glyphicon-trash");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [0]);
        var element3 = dom.childAt(element2, [1, 1, 1]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element2, [3]);
        if (this.cachedFragment) { dom.repairClonedNode(element5,[3]); }
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element6, [2]);
        var morph0 = dom.createMorphAt(element4,0,1);
        var morph1 = dom.createMorphAt(element4,1,-1);
        var morph2 = dom.createMorphAt(element3,2,3);
        var morph3 = dom.createMorphAt(element6,0,1);
        var morph4 = dom.createMorphAt(element6,3,4);
        var morph5 = dom.createMorphAt(element5,2,3);
        var morph6 = dom.createMorphAt(element5,3,4);
        block(env, morph0, context, "if", [get(env, context, "model.category")], {}, child0, null);
        content(env, morph1, context, "model.name");
        content(env, morph2, context, "outlet");
        block(env, morph3, context, "link-to", ["documents.edit", get(env, context, "model")], {"classNames": "btn btn-primary", "title": "Edit this document", "data-toggle": "tooltip", "data-placement": "top"}, child1, null);
        element(env, element7, context, "action", ["delete", get(env, context, "model")], {});
        block(env, morph4, context, "file-picker", [], {"accept": ".jpg,.jpeg,.gif,.png,.pdf,.doc,.docx,.pages", "fileLoaded": "fileLoaded", "readAs": "readAsDataURL", "progress": true, "preview": false, "classNames": "btn btn-default"}, child2, null);
        block(env, morph5, context, "if", [get(env, context, "model.attachments")], {}, child3, null);
        block(env, morph6, context, "if", [get(env, context, "model.pictures")], {}, child4, null);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/groups', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-plus");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" Create a new group\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 col-md-4 col-lg-2");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 col-md-8 col-lg-10");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        block(env, morph0, context, "link-to", ["groups.new"], {"classNames": "btn btn-primary", "title": "Create a new group"}, child0, null);
        content(env, morph1, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/groups/-form', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        var el4 = dom.createTextNode("\n      Name\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"type","submit");
        dom.setAttribute(el2,"value","Save");
        dom.setAttribute(el2,"class","btn btn-success");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn btn-default");
        var el3 = dom.createTextNode("cancel");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [5]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1, 1]),0,1);
        element(env, element0, context, "action", ["save"], {"on": "submit"});
        inline(env, morph0, context, "input", [], {"value": get(env, context, "model.name"), "classNames": "form-control"});
        element(env, element1, context, "action", ["cancel"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/groups/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("Edit group '");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("'");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,1);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        content(env, morph0, context, "model.name");
        inline(env, morph1, context, "partial", ["groups/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/groups/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","list-group-item");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
            inline(env, morph0, context, "link-to", [get(env, context, "group.name"), "groups.show", get(env, context, "group")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1,"class","list-group");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          block(env, morph0, context, "each", [get(env, context, "model")], {"keyword": "group"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n        No groups yet.\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          inline(env, morph0, context, "link-to", ["Go create one", "groups.new"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("\n      Groups\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 1]),2,3);
        block(env, morph0, context, "if", [get(env, context, "model")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/groups/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("New group");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,1,2,contextualElement);
        inline(env, morph0, context, "partial", ["groups/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/groups/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-edit");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("                ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("span");
              dom.setAttribute(el1,"class","glyphicon glyphicon-edit");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","list-group-item clearfix");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" (");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(")\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","btn-group pull-right");
            dom.setAttribute(el2,"role","group");
            dom.setAttribute(el2,"aria-label","...");
            var el3 = dom.createTextNode("\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("              ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("a");
            dom.setAttribute(el3,"href","#");
            dom.setAttribute(el3,"class","btn btn-danger btn-sm");
            dom.setAttribute(el3,"title","Destroy this membership");
            dom.setAttribute(el3,"data-toggle","tooltip");
            dom.setAttribute(el3,"data-placement","top");
            var el4 = dom.createTextNode("\n                ");
            dom.appendChild(el3, el4);
            var el4 = dom.createElement("span");
            dom.setAttribute(el4,"class","glyphicon glyphicon-trash");
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("\n              ");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n            ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content, block = hooks.block, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [3]);
            var element2 = dom.childAt(element1, [2]);
            var morph0 = dom.createMorphAt(element0,0,1);
            var morph1 = dom.createMorphAt(element0,1,2);
            var morph2 = dom.createMorphAt(element1,0,1);
            inline(env, morph0, context, "link-to", [get(env, context, "membership.user.name"), "users.show", get(env, context, "membership.user")], {});
            content(env, morph1, context, "membership.role");
            block(env, morph2, context, "link-to", ["memberships.edit", get(env, context, "membership")], {"classNames": "btn btn-primary btn-sm", "title": "Edit this membership", "data-toggle": "tooltip", "data-placement": "top"}, child0, null);
            element(env, element2, context, "action", ["deleteMembership", get(env, context, "membership")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h2");
          var el2 = dom.createTextNode("Group memberships");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1,"class","list-group");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),0,1);
          block(env, morph0, context, "each", [get(env, context, "model.memberships")], {"keyword": "membership"}, child0, null);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n        No memberships yet.\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("\n      Group '");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("'\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","btn-group");
        dom.setAttribute(el5,"role","group");
        dom.setAttribute(el5,"aria-label","...");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6,"href","#");
        dom.setAttribute(el6,"class","btn btn-danger");
        dom.setAttribute(el6,"title","Destroy this group");
        dom.setAttribute(el6,"data-toggle","tooltip");
        dom.setAttribute(el6,"data-placement","top");
        var el7 = dom.createTextNode("\n            ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("span");
        dom.setAttribute(el7,"class","glyphicon glyphicon-trash");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n          ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element3 = dom.childAt(fragment, [0, 1]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element4, [2, 1]);
        var element6 = dom.childAt(element5, [2]);
        var morph0 = dom.createMorphAt(element4,0,1);
        var morph1 = dom.createMorphAt(element5,0,1);
        var morph2 = dom.createMorphAt(element3,2,3);
        content(env, morph0, context, "model.name");
        block(env, morph1, context, "link-to", ["groups.edit", get(env, context, "model")], {"classNames": "btn btn-primary", "title": "Edit this group", "data-toggle": "tooltip", "data-placement": "top"}, child0, null);
        element(env, element6, context, "action", ["delete", get(env, context, "model")], {});
        block(env, morph2, context, "if", [get(env, context, "model.memberships")], {}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/login', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-xs-12 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4 col-lg-2 col-lg-offset-5");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        dom.setAttribute(el3,"id","title");
        var el4 = dom.createTextNode("Sign in");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        dom.setAttribute(el3,"role","form");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"class","btn btn-default");
        dom.setAttribute(el4,"type","submit");
        var el5 = dom.createTextNode("Login");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-xs-12 col-sm-6 col-sm-offset-3");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        dom.setAttribute(el3,"class","top");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createComment(" {{#link-to \"users.reset_password\"}}Did you forget your password?{{/link-to}} ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1, 3]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        element(env, element0, context, "action", ["authenticate"], {"on": "submit"});
        inline(env, morph0, context, "input", [], {"id": "identification", "type": "email", "class": "form-control", "placeholder": "Email", "value": get(env, context, "identification")});
        inline(env, morph1, context, "input", [], {"id": "password", "class": "form-control", "placeholder": "Password", "type": "password", "value": get(env, context, "password")});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/memberships/-form', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        var el4 = dom.createTextNode("\n      Role\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        var el4 = dom.createTextNode("\n      Group\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        var el4 = dom.createTextNode("\n      User\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"type","submit");
        dom.setAttribute(el2,"value","Save");
        dom.setAttribute(el2,"class","btn btn-success");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn btn-default");
        var el3 = dom.createTextNode("cancel");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [9]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1, 1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3, 1]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element0, [5, 1]),0,1);
        element(env, element0, context, "action", ["save"], {"on": "submit"});
        inline(env, morph0, context, "input", [], {"value": get(env, context, "model.role"), "classNames": "form-control document-form-role"});
        inline(env, morph1, context, "select-2", [], {"content": get(env, context, "groups"), "value": get(env, context, "model.group"), "optionLabelPath": "name", "placeholder": "Select a group", "allowClear": true});
        inline(env, morph2, context, "select-2", [], {"content": get(env, context, "users"), "value": get(env, context, "model.user"), "optionLabelPath": "name", "placeholder": "Select a user", "allowClear": true});
        element(env, element1, context, "action", ["cancel"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/memberships/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("Edit '");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("'");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,1);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        content(env, morph0, context, "model.name");
        inline(env, morph1, context, "partial", ["memberships/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/memberships/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","list-group-item");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" (");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(")\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(element0,0,1);
            var morph1 = dom.createMorphAt(element0,1,2);
            inline(env, morph0, context, "link-to", [get(env, context, "membership.user.name"), "users.show", get(env, context, "membership.user")], {});
            content(env, morph1, context, "membership.role");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1,"class","list-group");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          block(env, morph0, context, "each", [get(env, context, "model")], {"keyword": "membership"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n        No memberships yet.\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          inline(env, morph0, context, "link-to", ["Go create one", "memberships.new"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("\n      Memberships\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 1]),2,3);
        block(env, morph0, context, "if", [get(env, context, "model")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/memberships/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("New membership");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,1,2,contextualElement);
        inline(env, morph0, context, "partial", ["memberships/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/memberships/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("small");
          var el2 = dom.createTextNode("\n              ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("br");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          content(env, morph0, context, "model.category.name");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-edit");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-plus");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        Drag/click to upload a file\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("            ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "view", ["attachments/show", get(env, context, "attachment")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","col-md-12");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h3");
          var el3 = dom.createTextNode("Attachments ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("ul");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("        ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element1, [1]),0,-1);
          var morph1 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
          content(env, morph0, context, "model.attachments.length");
          block(env, morph1, context, "each", [get(env, context, "model.attachments")], {"keyword": "attachment"}, child0, null);
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            inline(env, morph0, context, "view", ["pictures/show", get(env, context, "picture")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","col-md-12");
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("h3");
          var el3 = dom.createTextNode("Pictures (");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(")");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,1);
          var morph1 = dom.createMorphAt(element0,2,3);
          content(env, morph0, context, "model.pictures.length");
          block(env, morph1, context, "each", [get(env, context, "model.pictures")], {"keyword": "picture"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col-md-12");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h1");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("          ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-4");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","btn-group");
        dom.setAttribute(el3,"role","group");
        dom.setAttribute(el3,"aria-label","...");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"href","#");
        dom.setAttribute(el4,"class","btn btn-danger");
        dom.setAttribute(el4,"title","Destroy this document");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","glyphicon glyphicon-trash");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [0]);
        var element3 = dom.childAt(element2, [1, 1, 1]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element2, [3]);
        if (this.cachedFragment) { dom.repairClonedNode(element5,[3]); }
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element6, [2]);
        var morph0 = dom.createMorphAt(element4,0,1);
        var morph1 = dom.createMorphAt(element4,1,-1);
        var morph2 = dom.createMorphAt(element3,2,3);
        var morph3 = dom.createMorphAt(element6,0,1);
        var morph4 = dom.createMorphAt(element6,3,4);
        var morph5 = dom.createMorphAt(element5,2,3);
        var morph6 = dom.createMorphAt(element5,3,4);
        block(env, morph0, context, "if", [get(env, context, "model.category")], {}, child0, null);
        content(env, morph1, context, "model.name");
        content(env, morph2, context, "outlet");
        block(env, morph3, context, "link-to", ["documents.edit", get(env, context, "model")], {"classNames": "btn btn-primary", "title": "Edit this document", "data-toggle": "tooltip", "data-placement": "top"}, child1, null);
        element(env, element7, context, "action", ["delete", get(env, context, "model")], {});
        block(env, morph4, context, "file-picker", [], {"accept": ".jpg,.jpeg,.gif,.png,.pdf,.doc,.docx,.pages", "fileLoaded": "fileLoaded", "readAs": "readAsDataURL", "progress": true, "preview": false, "classNames": "btn btn-default"}, child2, null);
        block(env, morph5, context, "if", [get(env, context, "model.attachments")], {}, child3, null);
        block(env, morph6, context, "if", [get(env, context, "model.pictures")], {}, child4, null);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/pictures/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("tr");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("a");
          var el4 = dom.createTextNode("\n              ");
          dom.appendChild(el3, el4);
          var el4 = dom.createTextNode("\n            ");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("x");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("td");
          var el3 = dom.createTextNode("\n            ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n          ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, element = hooks.element, content = hooks.content, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1, 1]);
          var element2 = dom.childAt(element0, [3]);
          var morph0 = dom.createMorphAt(element1,0,1);
          var morph1 = dom.createMorphAt(element2,0,1);
          var morph2 = dom.createMorphAt(element2,1,2);
          var morph3 = dom.createMorphAt(dom.childAt(element0, [5]),0,1);
          element(env, element1, context, "bind-attr", [], {"href": get(env, context, "thumb.url")});
          content(env, morph0, context, "thumb.name");
          content(env, morph1, context, "thumb.width");
          content(env, morph2, context, "thumb.height");
          inline(env, morph3, context, "zero-clipboard", [], {"text": get(env, context, "thumb.markdownTag"), "label": "Copy url"});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-4");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("img");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("a");
        dom.setAttribute(el3,"href","#");
        dom.setAttribute(el3,"class","btn btn-danger btn-sm");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("span");
        dom.setAttribute(el4,"class","glyphicon glyphicon-trash");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("table");
        dom.setAttribute(el3,"class","table table-striped");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, element = hooks.element, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element3 = dom.childAt(fragment, [0]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element4, [1]);
        var element6 = dom.childAt(element4, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element3, [3, 1]),0,1);
        element(env, element5, context, "bind-attr", [], {"src": get(env, context, "picture.thumbSmallUrl")});
        element(env, element6, context, "action", ["deletePicture", get(env, context, "picture")], {});
        block(env, morph0, context, "each", [get(env, context, "picture.thumbnails")], {"keyword": "thumb"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/users', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-plus");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" Create a new user\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 col-md-4 col-lg-2");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 col-md-8 col-lg-10");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        block(env, morph0, context, "link-to", ["users.new"], {"classNames": "btn btn-primary", "title": "Create a new user"}, child0, null);
        content(env, morph1, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/users/-form', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        var el4 = dom.createTextNode("\n      Name\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        var el4 = dom.createTextNode("\n      Email\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"type","submit");
        dom.setAttribute(el2,"value","Save");
        dom.setAttribute(el2,"class","btn btn-success");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn btn-default");
        var el3 = dom.createTextNode("cancel");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [7]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1, 1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3, 1]),0,1);
        element(env, element0, context, "action", ["save"], {"on": "submit"});
        inline(env, morph0, context, "input", [], {"value": get(env, context, "model.name"), "classNames": "form-control document-form-name"});
        inline(env, morph1, context, "input", [], {"value": get(env, context, "model.email"), "classNames": "form-control document-form-email"});
        element(env, element1, context, "action", ["cancel"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/users/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("Edit '");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("'");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,1);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        content(env, morph0, context, "model.name");
        inline(env, morph1, context, "partial", ["users/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/users/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("          ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","list-group-item");
            var el2 = dom.createTextNode("\n            ");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
            inline(env, morph0, context, "link-to", [get(env, context, "user.name"), "users.show", get(env, context, "user")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1,"class","list-group");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          block(env, morph0, context, "each", [get(env, context, "model")], {"keyword": "user"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("      ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("p");
          var el2 = dom.createTextNode("\n        No user yet.\n        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n      ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          inline(env, morph0, context, "link-to", ["Go create one", "users.new"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h1");
        var el4 = dom.createTextNode("\n      Users\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 1]),2,3);
        block(env, morph0, context, "if", [get(env, context, "model")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/users/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h1");
        var el2 = dom.createTextNode("New user");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(fragment,1,2,contextualElement);
        inline(env, morph0, context, "partial", ["users/form"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/users/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("          ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-edit");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode("              ");
              dom.appendChild(el0, el1);
              var el1 = dom.createElement("span");
              dom.setAttribute(el1,"class","glyphicon glyphicon-edit");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("\n");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("        ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            dom.setAttribute(el1,"class","list-group-item clearfix");
            var el2 = dom.createTextNode("\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" (");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(")\n          ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("div");
            dom.setAttribute(el2,"class","btn-group pull-right");
            dom.setAttribute(el2,"role","group");
            dom.setAttribute(el2,"aria-label","...");
            var el3 = dom.createTextNode("\n");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("            ");
            dom.appendChild(el2, el3);
            var el3 = dom.createElement("a");
            dom.setAttribute(el3,"href","#");
            dom.setAttribute(el3,"class","btn btn-danger btn-sm");
            dom.setAttribute(el3,"title","Destroy this membership");
            dom.setAttribute(el3,"data-toggle","tooltip");
            dom.setAttribute(el3,"data-placement","top");
            var el4 = dom.createTextNode("\n              ");
            dom.appendChild(el3, el4);
            var el4 = dom.createElement("span");
            dom.setAttribute(el4,"class","glyphicon glyphicon-trash");
            dom.appendChild(el3, el4);
            var el4 = dom.createTextNode("\n            ");
            dom.appendChild(el3, el4);
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode("\n          ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n        ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, inline = hooks.inline, content = hooks.content, block = hooks.block, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [3]);
            var element2 = dom.childAt(element1, [2]);
            var morph0 = dom.createMorphAt(element0,0,1);
            var morph1 = dom.createMorphAt(element0,1,2);
            var morph2 = dom.createMorphAt(element1,0,1);
            inline(env, morph0, context, "link-to", [get(env, context, "membership.group.name"), "groups.show", get(env, context, "membership.group")], {});
            content(env, morph1, context, "membership.role");
            block(env, morph2, context, "link-to", ["memberships.edit", get(env, context, "membership")], {"classNames": "btn btn-primary btn-sm", "title": "Edit this membership", "data-toggle": "tooltip", "data-placement": "top"}, child0, null);
            element(env, element2, context, "action", ["delete", get(env, context, "membership")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createTextNode("Group memberships (");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(")");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          dom.setAttribute(el1,"class","list-group");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),0,1);
          content(env, morph0, context, "model.memberships.length");
          block(env, morph1, context, "each", [get(env, context, "model.memberships")], {"keyword": "membership"}, child0, null);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","well");
          var el2 = dom.createTextNode("\n      No memberships\n    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col-md-12");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        var el3 = dom.createTextNode("\n    User '");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("'\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("small");
        var el4 = dom.createTextNode("\n      (");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(")\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","btn-group");
        dom.setAttribute(el4,"role","group");
        dom.setAttribute(el4,"aria-label","...");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"href","#");
        dom.setAttribute(el5,"class","btn btn-danger");
        dom.setAttribute(el5,"title","Destroy this user");
        dom.setAttribute(el5,"data-toggle","tooltip");
        dom.setAttribute(el5,"data-placement","top");
        var el6 = dom.createTextNode("\n          ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","glyphicon glyphicon-trash");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n        ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element3 = dom.childAt(fragment, [0]);
        var element4 = dom.childAt(element3, [1]);
        var element5 = dom.childAt(element4, [2]);
        var element6 = dom.childAt(element5, [2]);
        var element7 = dom.childAt(element6, [2]);
        var morph0 = dom.createMorphAt(element4,0,1);
        var morph1 = dom.createMorphAt(element5,0,1);
        var morph2 = dom.createMorphAt(element6,0,1);
        var morph3 = dom.createMorphAt(element3,2,-1);
        content(env, morph0, context, "model.name");
        content(env, morph1, context, "model.email");
        block(env, morph2, context, "link-to", ["users.edit", get(env, context, "model")], {"classNames": "btn btn-primary", "title": "Edit this user", "data-toggle": "tooltip", "data-placement": "top"}, child0, null);
        element(env, element7, context, "action", ["delete", get(env, context, "model")], {});
        block(env, morph3, context, "if", [get(env, context, "model.memberships")], {}, child1, child2);
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/versions', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-plus");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-plus");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        Import from Word file\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-4");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","btn-group");
        dom.setAttribute(el3,"role","group");
        dom.setAttribute(el3,"aria-label","...");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [3, 1]);
        if (this.cachedFragment) { dom.repairClonedNode(element1,[1]); }
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1, 1, 1]),0,1);
        var morph1 = dom.createMorphAt(element1,0,1);
        var morph2 = dom.createMorphAt(element1,1,2);
        var morph3 = dom.createMorphAt(element0,4,5);
        inline(env, morph0, context, "select-2", [], {"content": get(env, context, "arrangedContent"), "value": get(env, context, "currentVersion"), "optionLabelPath": "nameForSelectMenu", "placeholder": "Select a version"});
        block(env, morph1, context, "link-to", ["versions.new"], {"classNames": "btn btn-success", "title": "Create a new version for this document", "data-toggle": "tooltip", "data-placement": "top"}, child0, null);
        block(env, morph2, context, "file-picker", [], {"accept": ".docx,.doc", "fileLoaded": "createVersionFromWordFile", "readAs": "readAsDataURL", "progress": "true", "preview": false, "classNames": "btn btn-default"}, child1, null);
        content(env, morph3, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/versions/-form', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("input");
        dom.setAttribute(el2,"type","submit");
        dom.setAttribute(el2,"value","Save");
        dom.setAttribute(el2,"class","btn btn-success");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("button");
        dom.setAttribute(el2,"class","btn btn-default");
        var el3 = dom.createTextNode("cancel");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [7]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        element(env, element0, context, "action", ["save"], {"on": "submit"});
        inline(env, morph0, context, "input", [], {"value": get(env, context, "model.document.name"), "classNames": "form-control"});
        inline(env, morph1, context, "textarea", [], {"value": get(env, context, "model.contentMd"), "classNames": "form-control"});
        element(env, element1, context, "action", ["cancel"], {});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/versions/duplicate', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-12");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h3");
        var el4 = dom.createTextNode("\n      New version '");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("'\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("br");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("\n        created ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" – last updated ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-6");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-6 document-html");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element1, [4]);
        var morph0 = dom.createMorphAt(element1,0,1);
        var morph1 = dom.createMorphAt(element2,0,1);
        var morph2 = dom.createMorphAt(element2,1,2);
        var morph3 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        var morph4 = dom.createMorphAt(dom.childAt(element0, [5]),0,1);
        content(env, morph0, context, "model.name");
        inline(env, morph1, context, "formatted-date", [get(env, context, "model.createdAt"), "LL"], {});
        inline(env, morph2, context, "formatted-date", [get(env, context, "model.updatedAt"), "LL"], {});
        inline(env, morph3, context, "partial", ["versions/form"], {});
        inline(env, morph4, context, "markdown-to-html", [], {"markdown": get(env, context, "model.contentMd")});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/versions/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-12");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h3");
        var el4 = dom.createTextNode("\n      Version '");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("'\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("br");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("\n        created ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" – last updated ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-6");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-6 document-html");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element1, [4]);
        var morph0 = dom.createMorphAt(element1,0,1);
        var morph1 = dom.createMorphAt(element2,0,1);
        var morph2 = dom.createMorphAt(element2,1,2);
        var morph3 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        var morph4 = dom.createMorphAt(dom.childAt(element0, [5]),0,1);
        content(env, morph0, context, "model.name");
        inline(env, morph1, context, "formatted-date", [get(env, context, "model.createdAt"), "LL"], {});
        inline(env, morph2, context, "formatted-date", [get(env, context, "model.updatedAt"), "LL"], {});
        inline(env, morph3, context, "partial", ["versions/form"], {});
        inline(env, morph4, context, "markdown-to-html", [], {"markdown": get(env, context, "model.contentMd")});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/versions/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/versions/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-12");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h3");
        var el4 = dom.createTextNode("\n      Version '");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("'\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("br");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("small");
        var el5 = dom.createTextNode("\n        created ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" – last updated ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-6");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-6 document-html");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element1, [4]);
        var morph0 = dom.createMorphAt(element1,0,1);
        var morph1 = dom.createMorphAt(element2,0,1);
        var morph2 = dom.createMorphAt(element2,1,2);
        var morph3 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        var morph4 = dom.createMorphAt(dom.childAt(element0, [5]),0,1);
        content(env, morph0, context, "model.name");
        inline(env, morph1, context, "formatted-date", [get(env, context, "model.createdAt"), "LL"], {});
        inline(env, morph2, context, "formatted-date", [get(env, context, "model.updatedAt"), "LL"], {});
        inline(env, morph3, context, "partial", ["versions/form"], {});
        inline(env, morph4, context, "markdown-to-html", [], {"markdown": get(env, context, "model.contentMd")});
        return fragment;
      }
    };
  }()));

});
define('mylab/templates/versions/show', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-duplicate");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("span");
          dom.setAttribute(el1,"class","glyphicon glyphicon-edit");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col-md-12");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        dom.setAttribute(el2,"class","pull-left");
        var el3 = dom.createTextNode("\n    Version '");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("'\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("small");
        var el4 = dom.createTextNode("\n      created ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(" – last updated ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","pull-right");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","btn-group");
        dom.setAttribute(el3,"role","group");
        dom.setAttribute(el3,"aria-label","...");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"href","#");
        dom.setAttribute(el4,"class","btn btn-danger");
        dom.setAttribute(el4,"title","Destroy this version");
        dom.setAttribute(el4,"data-toggle","tooltip");
        dom.setAttribute(el4,"data-placement","top");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","glyphicon glyphicon-trash");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"class","btn btn-default");
        dom.setAttribute(el4,"title","Get a PDF of this version");
        dom.setAttribute(el4,"data-toggle","tooltip");
        dom.setAttribute(el4,"data-placement","top");
        dom.setAttribute(el4,"target","_blank");
        var el5 = dom.createTextNode("\n        ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col-md-12");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","document-html");
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline, block = hooks.block, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element1, [2]);
        var element3 = dom.childAt(element0, [3, 1]);
        if (this.cachedFragment) { dom.repairClonedNode(element3,[1]); }
        var element4 = dom.childAt(element3, [3]);
        var element5 = dom.childAt(element3, [5]);
        var morph0 = dom.createMorphAt(element1,0,1);
        var morph1 = dom.createMorphAt(element2,0,1);
        var morph2 = dom.createMorphAt(element2,1,2);
        var morph3 = dom.createMorphAt(element3,0,1);
        var morph4 = dom.createMorphAt(element3,1,2);
        var morph5 = dom.createMorphAt(element5,0,1);
        var morph6 = dom.createMorphAt(dom.childAt(fragment, [2, 1]),0,1);
        content(env, morph0, context, "model.name");
        inline(env, morph1, context, "formatted-date", [get(env, context, "model.createdAt"), "LL"], {});
        inline(env, morph2, context, "formatted-date", [get(env, context, "model.updatedAt"), "LL"], {});
        block(env, morph3, context, "link-to", ["versions.duplicate", get(env, context, "model.id")], {"classNames": "btn btn-success", "title": "Duplicate this version", "data-toggle": "tooltip", "data-placement": "top"}, child0, null);
        block(env, morph4, context, "link-to", ["versions.edit", get(env, context, "model")], {"classNames": "btn btn-primary", "title": "Edit this version", "data-toggle": "tooltip", "data-placement": "top"}, child1, null);
        element(env, element4, context, "action", ["delete", get(env, context, "model")], {});
        element(env, element5, context, "bind-attr", [], {"href": get(env, context, "model.pdfUrl")});
        inline(env, morph5, context, "fa-icon", ["file-pdf-o"], {});
        inline(env, morph6, context, "markdown-to-html", [], {"markdown": get(env, context, "model.contentMd")});
        return fragment;
      }
    };
  }()));

});
define('mylab/tests/acceptance/documents/new-test', ['ember', 'qunit', 'mylab/tests/helpers/start-app'], function (Ember, qunit, startApp) {

  'use strict';

  var application;

  qunit.module("Acceptance: DocumentsNew", {
    beforeEach: function beforeEach() {
      application = startApp['default']();
    },

    afterEach: function afterEach() {
      Ember['default'].$.post("api/v1/empty_db");
      Ember['default'].run(application, "destroy");
    }
  });

  qunit.test("visiting /documents/new", function (assert) {
    visit("/documents/new");

    andThen(function () {
      assert.equal(currentPath(), "documents.new");
    });

    fillIn("input.document-form-name", "a document");
    click("input[value=\"Save\"]");

    andThen(function () {
      assert.equal(find("div.alert:contains(Document saved!)").length, 1, "Displays success flash");
      assert.equal(currentPath(), "documents.show.versions.index");
      assert.equal(currentRouteName(), "versions.index", "Redirects to versions.index after create");
    });
  });

});
define('mylab/tests/acceptance/documents/new-test.jshint', function () {

  'use strict';

  module('JSHint - acceptance/documents');
  test('acceptance/documents/new-test.js should pass jshint', function() { 
    ok(true, 'acceptance/documents/new-test.js should pass jshint.'); 
  });

});
define('mylab/tests/acceptance/documents/show-test', ['ember', 'ember-data', 'pretender', 'qunit', 'mylab/tests/helpers/start-app'], function (Ember, DS, Pretender, qunit, startApp) {

  'use strict';

  var application, server;

  qunit.module("Acceptance: DocumentsShow", {
    beforeEach: function beforeEach() {
      application = startApp['default']();
      var documents = [{
        id: 1,
        name: "Bugs Bunny"
      }, {
        id: 2,
        name: "Wile E. Coyote"
      }, {
        id: 3,
        name: "Yosemite Sam"
      }];

      server = new Pretender['default'](function () {
        this.get("/api/v1/csrf", function (request) {
          return [200, { "Content-Type": "application/json" }, JSON.stringify({ authenticity_token: "an_authenticity_token" })];
        });

        this.get("/api/v1/documents", function (request) {
          return [200, { "Content-Type": "application/json" }, JSON.stringify({ documents: documents })];
        });

        this.get("/api/v1/documents/:id", function (request) {
          var speaker = documents.find(function (document) {
            if (document.id === parseInt(request.params.id, 10)) {
              return document;
            }
          });

          return [200, { "Content-Type": "application/json" }, JSON.stringify({ document: document })];
        });
      });
    },

    afterEach: function afterEach() {
      // Ember.$.post("api/v1/empty_db");
      Ember['default'].run(application, "destroy");
      server.shutdown();
    }
  });

  qunit.test("visiting /documents/show", function (assert) {
    visit("/documents/2");
    andThen(function () {
      assert.equal(currentRouteName(), "versions.index");
      assert.equal(currentPath(), "documents.show.versions.index");
      assert.equal(currentURL(), "/documents/2/versions");
    });
    // click('a[href="/documents"]');
  });

});
define('mylab/tests/acceptance/documents/show-test.jshint', function () {

  'use strict';

  module('JSHint - acceptance/documents');
  test('acceptance/documents/show-test.js should pass jshint', function() { 
    ok(true, 'acceptance/documents/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('mylab/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('mylab/tests/components/markdown-to-html.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/markdown-to-html.js should pass jshint', function() { 
    ok(false, 'components/markdown-to-html.js should pass jshint.\ncomponents/markdown-to-html.js: line 6, col 26, \'Showdown\' is not defined.\ncomponents/markdown-to-html.js: line 1, col 8, \'Ember\' is defined but never used.\n\n2 errors'); 
  });

});
define('mylab/tests/components/zero-clipboard.jshint', function () {

  'use strict';

  module('JSHint - components');
  test('components/zero-clipboard.js should pass jshint', function() { 
    ok(true, 'components/zero-clipboard.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/categories/base.jshint', function () {

  'use strict';

  module('JSHint - controllers/categories');
  test('controllers/categories/base.js should pass jshint', function() { 
    ok(true, 'controllers/categories/base.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/categories/edit.jshint', function () {

  'use strict';

  module('JSHint - controllers/categories');
  test('controllers/categories/edit.js should pass jshint', function() { 
    ok(true, 'controllers/categories/edit.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/categories/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/categories');
  test('controllers/categories/new.js should pass jshint', function() { 
    ok(true, 'controllers/categories/new.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/documents.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/documents.js should pass jshint', function() { 
    ok(true, 'controllers/documents.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/documents/base.jshint', function () {

  'use strict';

  module('JSHint - controllers/documents');
  test('controllers/documents/base.js should pass jshint', function() { 
    ok(true, 'controllers/documents/base.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/documents/edit.jshint', function () {

  'use strict';

  module('JSHint - controllers/documents');
  test('controllers/documents/edit.js should pass jshint', function() { 
    ok(true, 'controllers/documents/edit.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/documents/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/documents');
  test('controllers/documents/new.js should pass jshint', function() { 
    ok(true, 'controllers/documents/new.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/documents/show.jshint', function () {

  'use strict';

  module('JSHint - controllers/documents');
  test('controllers/documents/show.js should pass jshint', function() { 
    ok(false, 'controllers/documents/show.js should pass jshint.\ncontrollers/documents/show.js: line 14, col 8, Unnecessary semicolon.\ncontrollers/documents/show.js: line 23, col 8, Unnecessary semicolon.\ncontrollers/documents/show.js: line 33, col 8, Unnecessary semicolon.\ncontrollers/documents/show.js: line 38, col 8, Unnecessary semicolon.\ncontrollers/documents/show.js: line 41, col 50, Missing semicolon.\ncontrollers/documents/show.js: line 42, col 8, Unnecessary semicolon.\ncontrollers/documents/show.js: line 47, col 8, Unnecessary semicolon.\ncontrollers/documents/show.js: line 52, col 8, Unnecessary semicolon.\ncontrollers/documents/show.js: line 37, col 9, \'$\' is not defined.\ncontrollers/documents/show.js: line 46, col 16, \'$\' is not defined.\ncontrollers/documents/show.js: line 51, col 16, \'$\' is not defined.\ncontrollers/documents/show.js: line 35, col 31, \'pictureData\' is defined but never used.\n\n12 errors'); 
  });

});
define('mylab/tests/controllers/groups/base.jshint', function () {

  'use strict';

  module('JSHint - controllers/groups');
  test('controllers/groups/base.js should pass jshint', function() { 
    ok(true, 'controllers/groups/base.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/groups/edit.jshint', function () {

  'use strict';

  module('JSHint - controllers/groups');
  test('controllers/groups/edit.js should pass jshint', function() { 
    ok(true, 'controllers/groups/edit.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/groups/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/groups');
  test('controllers/groups/new.js should pass jshint', function() { 
    ok(true, 'controllers/groups/new.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/login.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/login.js should pass jshint', function() { 
    ok(true, 'controllers/login.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/memberships/base.jshint', function () {

  'use strict';

  module('JSHint - controllers/memberships');
  test('controllers/memberships/base.js should pass jshint', function() { 
    ok(true, 'controllers/memberships/base.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/memberships/edit.jshint', function () {

  'use strict';

  module('JSHint - controllers/memberships');
  test('controllers/memberships/edit.js should pass jshint', function() { 
    ok(true, 'controllers/memberships/edit.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/memberships/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/memberships');
  test('controllers/memberships/new.js should pass jshint', function() { 
    ok(true, 'controllers/memberships/new.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/memberships/show.jshint', function () {

  'use strict';

  module('JSHint - controllers/memberships');
  test('controllers/memberships/show.js should pass jshint', function() { 
    ok(false, 'controllers/memberships/show.js should pass jshint.\ncontrollers/memberships/show.js: line 14, col 8, Unnecessary semicolon.\ncontrollers/memberships/show.js: line 23, col 8, Unnecessary semicolon.\ncontrollers/memberships/show.js: line 33, col 8, Unnecessary semicolon.\ncontrollers/memberships/show.js: line 38, col 8, Unnecessary semicolon.\ncontrollers/memberships/show.js: line 41, col 50, Missing semicolon.\ncontrollers/memberships/show.js: line 42, col 8, Unnecessary semicolon.\ncontrollers/memberships/show.js: line 47, col 8, Unnecessary semicolon.\ncontrollers/memberships/show.js: line 52, col 8, Unnecessary semicolon.\ncontrollers/memberships/show.js: line 37, col 9, \'$\' is not defined.\ncontrollers/memberships/show.js: line 46, col 16, \'$\' is not defined.\ncontrollers/memberships/show.js: line 51, col 16, \'$\' is not defined.\ncontrollers/memberships/show.js: line 35, col 31, \'pictureData\' is defined but never used.\n\n12 errors'); 
  });

});
define('mylab/tests/controllers/users/base.jshint', function () {

  'use strict';

  module('JSHint - controllers/users');
  test('controllers/users/base.js should pass jshint', function() { 
    ok(false, 'controllers/users/base.js should pass jshint.\ncontrollers/users/base.js: line 9, col 47, \'user\' is not defined.\ncontrollers/users/base.js: line 7, col 46, \'group\' is defined but never used.\n\n2 errors'); 
  });

});
define('mylab/tests/controllers/users/edit.jshint', function () {

  'use strict';

  module('JSHint - controllers/users');
  test('controllers/users/edit.js should pass jshint', function() { 
    ok(true, 'controllers/users/edit.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/users/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/users');
  test('controllers/users/new.js should pass jshint', function() { 
    ok(true, 'controllers/users/new.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/versions.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/versions.js should pass jshint', function() { 
    ok(false, 'controllers/versions.js should pass jshint.\ncontrollers/versions.js: line 19, col 11, \'docu\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/controllers/versions/base.jshint', function () {

  'use strict';

  module('JSHint - controllers/versions');
  test('controllers/versions/base.js should pass jshint', function() { 
    ok(false, 'controllers/versions/base.js should pass jshint.\ncontrollers/versions/base.js: line 2, col 8, \'ajax\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/controllers/versions/duplicate.jshint', function () {

  'use strict';

  module('JSHint - controllers/versions');
  test('controllers/versions/duplicate.js should pass jshint', function() { 
    ok(true, 'controllers/versions/duplicate.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/versions/edit.jshint', function () {

  'use strict';

  module('JSHint - controllers/versions');
  test('controllers/versions/edit.js should pass jshint', function() { 
    ok(true, 'controllers/versions/edit.js should pass jshint.'); 
  });

});
define('mylab/tests/controllers/versions/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/versions');
  test('controllers/versions/new.js should pass jshint', function() { 
    ok(true, 'controllers/versions/new.js should pass jshint.'); 
  });

});
define('mylab/tests/helpers/formatted-date.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/formatted-date.js should pass jshint', function() { 
    ok(true, 'helpers/formatted-date.js should pass jshint.'); 
  });

});
define('mylab/tests/helpers/resolver', ['exports', 'ember/resolver', 'mylab/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('mylab/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('mylab/tests/helpers/start-app', ['exports', 'ember', 'mylab/app', 'mylab/router', 'mylab/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('mylab/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('mylab/tests/initializers/simple-auth-config.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/simple-auth-config.js should pass jshint', function() { 
    ok(false, 'initializers/simple-auth-config.js should pass jshint.\ninitializers/simple-auth-config.js: line 20, col 7, Missing semicolon.\ninitializers/simple-auth-config.js: line 27, col 10, Unnecessary semicolon.\ninitializers/simple-auth-config.js: line 10, col 35, \'application\' is defined but never used.\n\n3 errors'); 
  });

});
define('mylab/tests/initializers/tooltip.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/tooltip.js should pass jshint', function() { 
    ok(false, 'initializers/tooltip.js should pass jshint.\ninitializers/tooltip.js: line 8, col 5, \'$\' is not defined.\ninitializers/tooltip.js: line 9, col 7, \'$\' is not defined.\n\n2 errors'); 
  });

});
define('mylab/tests/models/attachment.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/attachment.js should pass jshint', function() { 
    ok(false, 'models/attachment.js should pass jshint.\nmodels/attachment.js: line 10, col 5, Forgotten \'debugger\' statement?\nmodels/attachment.js: line 10, col 13, Missing semicolon.\n\n2 errors'); 
  });

});
define('mylab/tests/models/category.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/category.js should pass jshint', function() { 
    ok(true, 'models/category.js should pass jshint.'); 
  });

});
define('mylab/tests/models/document.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/document.js should pass jshint', function() { 
    ok(false, 'models/document.js should pass jshint.\nmodels/document.js: line 2, col 8, \'Picturable\' is defined but never used.\nmodels/document.js: line 32, col 9, \'sortedVersions\' is defined but never used.\n\n2 errors'); 
  });

});
define('mylab/tests/models/docx.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/docx.js should pass jshint', function() { 
    ok(true, 'models/docx.js should pass jshint.'); 
  });

});
define('mylab/tests/models/group.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/group.js should pass jshint', function() { 
    ok(true, 'models/group.js should pass jshint.'); 
  });

});
define('mylab/tests/models/membership.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/membership.js should pass jshint', function() { 
    ok(true, 'models/membership.js should pass jshint.'); 
  });

});
define('mylab/tests/models/picturable.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/picturable.js should pass jshint', function() { 
    ok(true, 'models/picturable.js should pass jshint.'); 
  });

});
define('mylab/tests/models/picture.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/picture.js should pass jshint', function() { 
    ok(false, 'models/picture.js should pass jshint.\nmodels/picture.js: line 2, col 8, \'Ember\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/models/thumbnail.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/thumbnail.js should pass jshint', function() { 
    ok(false, 'models/thumbnail.js should pass jshint.\nmodels/thumbnail.js: line 11, col 105, Missing semicolon.\n\n1 error'); 
  });

});
define('mylab/tests/models/user.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/user.js should pass jshint', function() { 
    ok(true, 'models/user.js should pass jshint.'); 
  });

});
define('mylab/tests/models/version.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/version.js should pass jshint', function() { 
    ok(true, 'models/version.js should pass jshint.'); 
  });

});
define('mylab/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(false, 'routes/application.js should pass jshint.\nroutes/application.js: line 10, col 17, \'_this\' is not defined.\n\n1 error'); 
  });

});
define('mylab/tests/routes/categories.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/categories.js should pass jshint', function() { 
    ok(true, 'routes/categories.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/categories/edit.jshint', function () {

  'use strict';

  module('JSHint - routes/categories');
  test('routes/categories/edit.js should pass jshint', function() { 
    ok(true, 'routes/categories/edit.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/categories/index.jshint', function () {

  'use strict';

  module('JSHint - routes/categories');
  test('routes/categories/index.js should pass jshint', function() { 
    ok(false, 'routes/categories/index.js should pass jshint.\nroutes/categories/index.js: line 5, col 19, \'params\' is defined but never used.\nroutes/categories/index.js: line 9, col 31, \'transition\' is defined but never used.\n\n2 errors'); 
  });

});
define('mylab/tests/routes/categories/new.jshint', function () {

  'use strict';

  module('JSHint - routes/categories');
  test('routes/categories/new.js should pass jshint', function() { 
    ok(false, 'routes/categories/new.js should pass jshint.\nroutes/categories/new.js: line 4, col 19, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/categories/show.jshint', function () {

  'use strict';

  module('JSHint - routes/categories');
  test('routes/categories/show.js should pass jshint', function() { 
    ok(false, 'routes/categories/show.js should pass jshint.\nroutes/categories/show.js: line 8, col 48, \'v\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/documents.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/documents.js should pass jshint', function() { 
    ok(false, 'routes/documents.js should pass jshint.\nroutes/documents.js: line 17, col 19, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/documents/edit.jshint', function () {

  'use strict';

  module('JSHint - routes/documents');
  test('routes/documents/edit.js should pass jshint', function() { 
    ok(true, 'routes/documents/edit.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/documents/index.jshint', function () {

  'use strict';

  module('JSHint - routes/documents');
  test('routes/documents/index.js should pass jshint', function() { 
    ok(false, 'routes/documents/index.js should pass jshint.\nroutes/documents/index.js: line 5, col 19, \'params\' is defined but never used.\nroutes/documents/index.js: line 9, col 31, \'transition\' is defined but never used.\n\n2 errors'); 
  });

});
define('mylab/tests/routes/documents/new.jshint', function () {

  'use strict';

  module('JSHint - routes/documents');
  test('routes/documents/new.js should pass jshint', function() { 
    ok(true, 'routes/documents/new.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/documents/show.jshint', function () {

  'use strict';

  module('JSHint - routes/documents');
  test('routes/documents/show.js should pass jshint', function() { 
    ok(true, 'routes/documents/show.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/documents/show/index.jshint', function () {

  'use strict';

  module('JSHint - routes/documents/show');
  test('routes/documents/show/index.js should pass jshint', function() { 
    ok(false, 'routes/documents/show/index.js should pass jshint.\nroutes/documents/show/index.js: line 4, col 19, \'params\' is defined but never used.\nroutes/documents/show/index.js: line 7, col 30, \'transition\' is defined but never used.\nroutes/documents/show/index.js: line 7, col 23, \'model\' is defined but never used.\n\n3 errors'); 
  });

});
define('mylab/tests/routes/groups.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/groups.js should pass jshint', function() { 
    ok(false, 'routes/groups.js should pass jshint.\nroutes/groups.js: line 4, col 19, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/groups/new.jshint', function () {

  'use strict';

  module('JSHint - routes/groups');
  test('routes/groups/new.js should pass jshint', function() { 
    ok(false, 'routes/groups/new.js should pass jshint.\nroutes/groups/new.js: line 4, col 19, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/groups/show.jshint', function () {

  'use strict';

  module('JSHint - routes/groups');
  test('routes/groups/show.js should pass jshint', function() { 
    ok(false, 'routes/groups/show.js should pass jshint.\nroutes/groups/show.js: line 8, col 45, \'v\' is defined but never used.\nroutes/groups/show.js: line 17, col 50, \'v\' is defined but never used.\n\n2 errors'); 
  });

});
define('mylab/tests/routes/login.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/login.js should pass jshint', function() { 
    ok(false, 'routes/login.js should pass jshint.\nroutes/login.js: line 4, col 41, \'model\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/logout.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/logout.js should pass jshint', function() { 
    ok(true, 'routes/logout.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/memberships.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/memberships.js should pass jshint', function() { 
    ok(false, 'routes/memberships.js should pass jshint.\nroutes/memberships.js: line 7, col 19, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/memberships/edit.jshint', function () {

  'use strict';

  module('JSHint - routes/memberships');
  test('routes/memberships/edit.js should pass jshint', function() { 
    ok(true, 'routes/memberships/edit.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/memberships/index.jshint', function () {

  'use strict';

  module('JSHint - routes/memberships');
  test('routes/memberships/index.js should pass jshint', function() { 
    ok(false, 'routes/memberships/index.js should pass jshint.\nroutes/memberships/index.js: line 5, col 19, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/memberships/new.jshint', function () {

  'use strict';

  module('JSHint - routes/memberships');
  test('routes/memberships/new.js should pass jshint', function() { 
    ok(true, 'routes/memberships/new.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/memberships/show.jshint', function () {

  'use strict';

  module('JSHint - routes/memberships');
  test('routes/memberships/show.js should pass jshint', function() { 
    ok(true, 'routes/memberships/show.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/memberships/show/index.jshint', function () {

  'use strict';

  module('JSHint - routes/memberships/show');
  test('routes/memberships/show/index.js should pass jshint', function() { 
    ok(false, 'routes/memberships/show/index.js should pass jshint.\nroutes/memberships/show/index.js: line 4, col 19, \'params\' is defined but never used.\nroutes/memberships/show/index.js: line 7, col 30, \'transition\' is defined but never used.\nroutes/memberships/show/index.js: line 7, col 23, \'model\' is defined but never used.\n\n3 errors'); 
  });

});
define('mylab/tests/routes/picture.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/picture.js should pass jshint', function() { 
    ok(true, 'routes/picture.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/users.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/users.js should pass jshint', function() { 
    ok(false, 'routes/users.js should pass jshint.\nroutes/users.js: line 6, col 19, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/users/show.jshint', function () {

  'use strict';

  module('JSHint - routes/users');
  test('routes/users/show.js should pass jshint', function() { 
    ok(true, 'routes/users/show.js should pass jshint.'); 
  });

});
define('mylab/tests/routes/versions.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/versions.js should pass jshint', function() { 
    ok(false, 'routes/versions.js should pass jshint.\nroutes/versions.js: line 4, col 19, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/versions/duplicate.jshint', function () {

  'use strict';

  module('JSHint - routes/versions');
  test('routes/versions/duplicate.js should pass jshint', function() { 
    ok(false, 'routes/versions/duplicate.js should pass jshint.\nroutes/versions/duplicate.js: line 10, col 9, \'parentVersion\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/versions/edit.jshint', function () {

  'use strict';

  module('JSHint - routes/versions');
  test('routes/versions/edit.js should pass jshint', function() { 
    ok(false, 'routes/versions/edit.js should pass jshint.\nroutes/versions/edit.js: line 16, col 92, Missing semicolon.\n\n1 error'); 
  });

});
define('mylab/tests/routes/versions/index.jshint', function () {

  'use strict';

  module('JSHint - routes/versions');
  test('routes/versions/index.js should pass jshint', function() { 
    ok(false, 'routes/versions/index.js should pass jshint.\nroutes/versions/index.js: line 5, col 19, \'params\' is defined but never used.\nroutes/versions/index.js: line 9, col 29, \'transition\' is defined but never used.\n\n2 errors'); 
  });

});
define('mylab/tests/routes/versions/new.jshint', function () {

  'use strict';

  module('JSHint - routes/versions');
  test('routes/versions/new.js should pass jshint', function() { 
    ok(false, 'routes/versions/new.js should pass jshint.\nroutes/versions/new.js: line 4, col 19, \'params\' is defined but never used.\n\n1 error'); 
  });

});
define('mylab/tests/routes/versions/show.jshint', function () {

  'use strict';

  module('JSHint - routes/versions');
  test('routes/versions/show.js should pass jshint', function() { 
    ok(true, 'routes/versions/show.js should pass jshint.'); 
  });

});
define('mylab/tests/serializers/picture.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/picture.js should pass jshint', function() { 
    ok(true, 'serializers/picture.js should pass jshint.'); 
  });

});
define('mylab/tests/test-helper', ['mylab/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('mylab/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('mylab/tests/transforms/raw.jshint', function () {

  'use strict';

  module('JSHint - transforms');
  test('transforms/raw.js should pass jshint', function() { 
    ok(true, 'transforms/raw.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:application", "ApplicationAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('mylab/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/application-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/components/file-upload-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent("file-upload-component", {});

  ember_qunit.test("it renders", function (assert) {
    assert.expect(2);

    // creates the component instance
    var component = this.subject();
    assert.equal(component._state, "preRender");

    // renders the component to the page
    this.render();
    assert.equal(component._state, "inDOM");
  });

  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('mylab/tests/unit/components/file-upload-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/file-upload-test.js should pass jshint', function() { 
    ok(true, 'unit/components/file-upload-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/components/select-2-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent("select-2", {});

  ember_qunit.test("it renders", function (assert) {
    assert.expect(2);

    // creates the component instance
    var component = this.subject();
    assert.equal(component._state, "preRender");

    // renders the component to the page
    this.render();
    assert.equal(component._state, "inDOM");
  });

  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('mylab/tests/unit/components/select-2-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/select-2-test.js should pass jshint', function() { 
    ok(true, 'unit/components/select-2-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/components/zero-clipboard-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent("zero-clipboard", {});

  ember_qunit.test("it renders", function (assert) {
    assert.expect(2);

    // creates the component instance
    var component = this.subject();
    assert.equal(component._state, "preRender");

    // renders the component to the page
    this.render();
    assert.equal(component._state, "inDOM");
  });

  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('mylab/tests/unit/components/zero-clipboard-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/zero-clipboard-test.js should pass jshint', function() { 
    ok(true, 'unit/components/zero-clipboard-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:application", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/application-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/application-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/categories/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:categories/new", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/categories/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/categories');
  test('unit/controllers/categories/new-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/categories/new-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/documents-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:documents", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/documents-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/documents-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/documents-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/documents/base-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:documents/base", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/documents/base-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/documents');
  test('unit/controllers/documents/base-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/documents/base-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/documents/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:documents/edit", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/documents/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/documents');
  test('unit/controllers/documents/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/documents/edit-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/documents/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:documents/index", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/documents/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/documents');
  test('unit/controllers/documents/index-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/documents/index-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/documents/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:documents/new", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/documents/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/documents');
  test('unit/controllers/documents/new-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/documents/new-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/documents/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:documents/show", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/documents/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/documents');
  test('unit/controllers/documents/show-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/documents/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/versions-test', function () {

	'use strict';

	// import {
	//   moduleFor,
	//   test
	// } from 'ember-qunit';

	// moduleFor('controller:versions', {
	//   // Specify the other units that are required for this test.
	//   // needs: ['controller:foo']
	// });

	// // Replace this with your real tests.
	// test('it exists', function(assert) {
	//   var controller = this.subject();
	//   assert.ok(controller);
	// });

});
define('mylab/tests/unit/controllers/versions-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/versions-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/versions-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/versions/base-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:versions/base", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/versions/base-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/versions');
  test('unit/controllers/versions/base-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/versions/base-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/versions/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:versions/edit", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/versions/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/versions');
  test('unit/controllers/versions/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/versions/edit-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/versions/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:versions/new", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/versions/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/versions');
  test('unit/controllers/versions/new-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/versions/new-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/controllers/versions/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:versions/show", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/controllers/versions/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/versions');
  test('unit/controllers/versions/show-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/versions/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/helpers/formatted-date-test', ['mylab/helpers/formatted-date', 'qunit'], function (formatted_date, qunit) {

  'use strict';

  qunit.module("FormattedDateHelper");

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    var result = formatted_date.formattedDate(42);
    assert.ok(result);
  });

});
define('mylab/tests/unit/helpers/formatted-date-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/formatted-date-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/formatted-date-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/initializers/ember-flash-messages-test', ['ember', 'mylab/initializers/ember-flash-messages', 'qunit'], function (Ember, ember_flash_messages, qunit) {

  'use strict';

  var container, application;

  qunit.module("EmberFlashMessagesInitializer", {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    ember_flash_messages.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('mylab/tests/unit/initializers/ember-flash-messages-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/ember-flash-messages-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/ember-flash-messages-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/initializers/flash-message-test', ['ember', 'mylab/initializers/flash-message', 'qunit'], function (Ember, flash_message, qunit) {

  'use strict';

  var container, application;

  qunit.module("FlashMessageInitializer", {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    flash_message.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('mylab/tests/unit/initializers/flash-message-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/flash-message-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/flash-message-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/initializers/tooltip-test', ['ember', 'mylab/initializers/tooltip', 'qunit'], function (Ember, tooltip, qunit) {

  'use strict';

  var container, application;

  qunit.module("TooltipInitializer", {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    tooltip.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('mylab/tests/unit/initializers/tooltip-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/tooltip-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/tooltip-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/models/attachment-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("attachment", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mylab/tests/unit/models/attachment-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/attachment-test.js should pass jshint', function() { 
    ok(true, 'unit/models/attachment-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/models/category-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("category", {
    // Specify the other units that are required for this test.
    needs: ["model:document"]
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mylab/tests/unit/models/category-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/category-test.js should pass jshint', function() { 
    ok(true, 'unit/models/category-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/models/document-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("document", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mylab/tests/unit/models/document-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/document-test.js should pass jshint', function() { 
    ok(true, 'unit/models/document-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/models/group-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("group", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mylab/tests/unit/models/group-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/group-test.js should pass jshint', function() { 
    ok(true, 'unit/models/group-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/models/picture-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("api::v1::picture", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mylab/tests/unit/models/picture-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/picture-test.js should pass jshint', function() { 
    ok(true, 'unit/models/picture-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/models/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("user", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mylab/tests/unit/models/user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/user-test.js should pass jshint', function() { 
    ok(true, 'unit/models/user-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/models/version-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("version", {
    // Specify the other units that are required for this test.
    needs: ["model:document", "model:picture", "model:attachment", "model:thumbnail"],
    beforeEach: function beforeEach() {
      this.store = this.store();
      this.version = this.subject({ id: 74576484, name: "version_name", createdAt: "2015-02-01" });
    } });

  ember_qunit.test("its valid", function (assert) {
    assert.ok(this.version);
    assert.ok(this.version instanceof DS.Model);
    assert.equal(this.version.get("name"), "version_name");
    assert.equal(this.version.get("pdfUrl"), "http://mylab.dev/api/v1/versions/74576484.pdf");
    assert.equal(this.version.get("nameForSelectMenu"), "Version 'version_name' (created February 1, 2015)");
  });

  ember_qunit.test("it belongs to a document", function (assert) {
    var _this = this;
    Ember.run(function () {
      _this.version.set("document", _this.store.createRecord("document", { name: "document_name" }));
    });
    assert.ok(this.version.get("document"));
    assert.ok(this.version.get("document") instanceof DS.Model);
  });

});
define('mylab/tests/unit/models/version-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/version-test.js should pass jshint', function() { 
    ok(false, 'unit/models/version-test.js should pass jshint.\nunit/models/version-test.js: line 23, col 97, Missing semicolon.\nunit/models/version-test.js: line 22, col 3, \'Ember\' is not defined.\n\n2 errors'); 
  });

});
define('mylab/tests/unit/routes/api::v1::picture-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:api::v1::picture", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/api::v1::picture-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/api::v1::picture-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/api::v1::picture-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:application", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/application-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/application-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/categories-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:categories", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/categories-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/categories-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/categories-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/categories/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:categories/edit", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/categories/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/categories');
  test('unit/routes/categories/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/categories/edit-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/categories/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:categories/new", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/categories/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/categories');
  test('unit/routes/categories/new-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/categories/new-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/categories/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:categories/show", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/categories/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/categories');
  test('unit/routes/categories/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/categories/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/documents-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:documents", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/documents-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/documents-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/documents-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/documents/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:documents/edit", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/documents/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/documents');
  test('unit/routes/documents/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/documents/edit-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/documents/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:documents/index", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/documents/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/documents');
  test('unit/routes/documents/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/documents/index-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/documents/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:documents/new", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/documents/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/documents');
  test('unit/routes/documents/new-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/documents/new-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/documents/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:documents/show", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/documents/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/documents');
  test('unit/routes/documents/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/documents/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/documents/versions/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:documents/versions/edit", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/documents/versions/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/documents/versions');
  test('unit/routes/documents/versions/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/documents/versions/edit-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/documents/versions/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:documents/versions/index", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/documents/versions/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/documents/versions');
  test('unit/routes/documents/versions/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/documents/versions/index-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/documents/versions/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:documents/versions/new", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/documents/versions/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/documents/versions');
  test('unit/routes/documents/versions/new-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/documents/versions/new-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/documents/versions/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:documents/versions/show", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/documents/versions/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/documents/versions');
  test('unit/routes/documents/versions/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/documents/versions/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/groups-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:group", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/groups-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/groups-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/groups-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/groups/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:groups/new", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/groups/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/groups');
  test('unit/routes/groups/new-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/groups/new-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/groups/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:groups/show", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/groups/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/groups');
  test('unit/routes/groups/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/groups/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/users-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:users", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/users-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/users-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/users-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/users/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:users/show", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/users/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/users');
  test('unit/routes/users/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/users/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/versions-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:versions", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/versions-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/versions-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/versions-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/routes/versions/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:versions/show", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mylab/tests/unit/routes/versions/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/versions');
  test('unit/routes/versions/show-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/versions/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/serializers/picture-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("serializer:picture", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var serializer = this.subject();
    assert.ok(serializer);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('mylab/tests/unit/serializers/picture-test.jshint', function () {

  'use strict';

  module('JSHint - unit/serializers');
  test('unit/serializers/picture-test.js should pass jshint', function() { 
    ok(true, 'unit/serializers/picture-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/utils/date-helpers-test', ['mylab/utils/date-helpers', 'qunit'], function (dateHelpers, qunit) {

  'use strict';

  qunit.module("dateHelpers");

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    var result = dateHelpers['default']();
    assert.ok(result);
  });

});
define('mylab/tests/unit/utils/date-helpers-test.jshint', function () {

  'use strict';

  module('JSHint - unit/utils');
  test('unit/utils/date-helpers-test.js should pass jshint', function() { 
    ok(true, 'unit/utils/date-helpers-test.js should pass jshint.'); 
  });

});
define('mylab/tests/unit/views/pictures/show-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:pictures/show");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('mylab/tests/unit/views/pictures/show-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views/pictures');
  test('unit/views/pictures/show-test.js should pass jshint', function() { 
    ok(true, 'unit/views/pictures/show-test.js should pass jshint.'); 
  });

});
define('mylab/tests/utils/date-helpers.jshint', function () {

  'use strict';

  module('JSHint - utils');
  test('utils/date-helpers.js should pass jshint', function() { 
    ok(true, 'utils/date-helpers.js should pass jshint.'); 
  });

});
define('mylab/tests/views/attachments/show.jshint', function () {

  'use strict';

  module('JSHint - views/attachments');
  test('views/attachments/show.js should pass jshint', function() { 
    ok(true, 'views/attachments/show.js should pass jshint.'); 
  });

});
define('mylab/tests/views/pictures/show.jshint', function () {

  'use strict';

  module('JSHint - views/pictures');
  test('views/pictures/show.js should pass jshint', function() { 
    ok(true, 'views/pictures/show.js should pass jshint.'); 
  });

});
define('mylab/transforms/raw', ['exports', 'ember-data', 'ember'], function (exports, DS, Ember) {

  'use strict';

  // app/transforms/raw.js
  exports['default'] = DS['default'].Transform.extend({
    deserialize: function deserialize(serialized) {
      return Ember['default'].isNone(serialized) ? {} : serialized;
    },

    serialize: function serialize(deserialized) {
      return Ember['default'].isNone(deserialized) ? {} : deserialized;
    }
  });

});
define('mylab/utils/date-helpers', ['exports'], function (exports) {

  'use strict';

  exports.formatDate = formatDate;

  function formatDate(date, format) {
    return window.moment(date).format(format);
  }

});
define('mylab/views/attachments/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    templateName: "attachments/show"
  });

});
define('mylab/views/pictures/show', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    templateName: "pictures/show"
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('mylab/config/environment', ['ember'], function(Ember) {
  var prefix = 'mylab';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("mylab/tests/test-helper");
} else {
  require("mylab/app")["default"].create({"name":"mylab","version":"0.0.0.4fc464b3"});
}

/* jshint ignore:end */
//# sourceMappingURL=mylab.map