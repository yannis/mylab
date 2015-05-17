import DS from 'ember-data';

export default {
  readable: DS.attr('boolean'),
  updatable: DS.attr('boolean'),
  destroyable: DS.attr('boolean')
}
