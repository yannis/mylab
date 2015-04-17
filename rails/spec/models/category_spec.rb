require 'rails_helper'

RSpec.describe Category, type: :model do
  describe 'validation' do
    subject(:category) { build :category }
    it {is_expected.to have_many :documents}
    it {is_expected.to validate_presence_of :name}
    it {is_expected.to validate_uniqueness_of :name}
  end
end
