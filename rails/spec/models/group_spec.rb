require 'rails_helper'

RSpec.describe Group, type: :model do
  subject { build :group }
  it {is_expected.to have_many(:memberships).dependent(:destroy)}
  it {is_expected.to have_many(:users).through(:memberships)}
  it {is_expected.to validate_presence_of :name}
  it {is_expected.to validate_uniqueness_of :name}
end
