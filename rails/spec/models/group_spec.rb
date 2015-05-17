require 'rails_helper'

RSpec.describe Group, type: :model do
  subject { build :group }
  it {is_expected.to have_many(:sharings).dependent(:destroy)}
  it {is_expected.to have_many(:documents).through(:sharings)}
  it {is_expected.to have_many(:memberships).dependent(:destroy)}
  it {is_expected.to have_many(:users).through(:memberships)}
  it {is_expected.to validate_presence_of :name}
  it {is_expected.to validate_uniqueness_of :name}
  it {is_expected.to accept_nested_attributes_for(:memberships).allow_destroy(true)}

  context "a group" do
    let(:group) { create :group }

    context "that has a document" do
      let(:user) {create :user}
      let(:document) {create :document, user: user, sharings: [build(:sharing, group: group)]}

      it {expect(group).to have_access_to document}
    end
  end
end
