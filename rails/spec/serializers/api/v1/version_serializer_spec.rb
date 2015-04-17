# see also http://eclips3.net/2015/01/24/testing-active-model-serializer-with-rspec/
require 'rails_helper'

RSpec.describe API::V1::VersionSerializer, type: :serializer do

  context 'Individual Resource Representation' do

    let(:document) { create :document }
    let(:version) { create :version, name: "a version", document: document }
    let(:serializer) { API::V1::VersionSerializer.new(version) }

    subject {
      JSON.parse(serializer.to_json)['version']
    }

    it { expect(subject['name']).to eql "a version" }
    it { expect(subject['id']).to eql(version.id) }
    it { expect(subject['document_id']).to eql document.id }
  end
end
