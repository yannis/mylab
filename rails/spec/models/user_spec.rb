require 'rails_helper'

RSpec.describe User, type: :model do
  subject{create :user}
  it {is_expected.to be_valid_verbose}
  it {is_expected.to have_many(:memberships).dependent(:destroy)}
  it {is_expected.to have_many(:groups).through(:memberships)}
  # it {is_expected.to have_many(:orders).dependent(:destroy)}
  it {is_expected.to validate_length_of(:name).is_at_least(3).is_at_most(100)}
  it {is_expected.to validate_length_of(:email).is_at_least(6).is_at_most(100)}
  it { is_expected.to validate_presence_of :name }
  it { is_expected.to validate_presence_of :email }
  # it {is_expected.to validate_presence_of :laboratory_id}# , if: Proc.new {|user| !user.admin?}
  it { is_expected.to validate_uniqueness_of :email }
end
