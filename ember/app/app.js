import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import { setCsrfUrl } from 'rails-csrf/config';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver
});

setCsrfUrl(config.apiHost+'/csrf');

loadInitializers(App, config.modulePrefix);

loadInitializers(App, 'rails-csrf');

export default App;


Ember.LinkView.reopen({
  attributeBindings: ['data-toggle', 'data-placement']
});

Ember.TextField.reopen({
  attributeBindings: ['data-error']
});
