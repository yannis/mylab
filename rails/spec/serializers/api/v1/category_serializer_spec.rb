# see also http://eclips3.net/2015/01/24/testing-active-model-serializer-with-rspec/
require 'rails_helper'

RSpec.describe API::V1::CategorySerializer, type: :serializer do

  context 'Individual Resource Representation' do
    let!(:resource) { build :category }
    let!(:serializer) { API::V1::CategorySerializer.new(resource) }
    # let(:serialization) { ActiveModel::Serializer::Adapter.create(serializer) }

    subject {
      JSON.parse(serializer.to_json)['category']
    }

    it { expect(subject['name']).to eql(resource.name)}
    it { expect(subject['id']).to eql(resource.id)}
  end
end
