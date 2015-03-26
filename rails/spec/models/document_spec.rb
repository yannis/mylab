require 'rails_helper'

RSpec.describe Document, type: :model do
  it { is_expected.to have_many :versions }

  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_uniqueness_of(:name) }
end
