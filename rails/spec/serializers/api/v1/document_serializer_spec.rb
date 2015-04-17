# see also http://eclips3.net/2015/01/24/testing-active-model-serializer-with-rspec/
require 'rails_helper'

RSpec.describe API::V1::DocumentSerializer, type: :serializer do

  context 'Individual Resource Representation' do

    let(:category) { create :category }
    let(:document) { create :document, name: "a document", versions: [build(:version, id: 121125)], category: category }
    let(:serializer) { API::V1::DocumentSerializer.new(document) }

    subject {
      JSON.parse(serializer.to_json)['document']
    }

    it { expect(subject['name']).to eql "a document" }
    it { expect(subject['id']).to eql(document.id) }
    it { expect(subject['category_id']).to eql category.id.to_s }
    it { expect(subject['version_ids']).to match_array [121125] }
  end
end
