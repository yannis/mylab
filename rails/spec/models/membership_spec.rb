require 'rails_helper'

RSpec.describe Membership, type: :model do
  subject(:membership) { create :membership }
  it {is_expected.to belong_to :user}
  it {is_expected.to belong_to :group}
  it {is_expected.to validate_uniqueness_of(:user).scoped_to(:group_id)}
  it {is_expected.to validate_presence_of(:role)}
  it {is_expected.to validate_inclusion_of(:role).in_array ['basic', 'admin']}
  it {is_expected.to be_valid_verbose}

  context "4 memberships of a group" do
    let(:user1) {create :user}
    let(:user2) {create :user}
    let(:group1) {create :group}
    let(:group2) {create :group}
    let!(:group1_admin_membership) {create :membership, user: user1, group: group1, role: "admin"}
    let!(:group1_basic_membership) {create :membership, user: user2, group: group1, role: "basic"}
    let!(:group2_admin_membership) {create :membership, user: user1, group: group2, role: "admin"}
    let!(:group2_basic_membership) {create :membership, user: user2, group: group2, role: "basic"}

    it {expect(group1_basic_membership).to be_basic}
    it {expect(group1_basic_membership).to_not be_admin}
    it {expect(group1_admin_membership).to be_admin}
    it {expect(group1_admin_membership).to_not be_basic}

    it {expect(Membership.admin).to match_array [group1_admin_membership, group2_admin_membership]}
    it {expect(Membership.of_group(group1)).to match_array [group1_basic_membership, group1_admin_membership]}
    it {expect(Membership.of_group(group1)).to match_array group1.memberships}

    it {expect(Membership.of_user(user1)).to match_array [group1_admin_membership, group2_admin_membership]}
    it {expect(Membership.of_user(user2)).to match_array [group1_basic_membership, group2_basic_membership]}

    it { expect{group1_basic_membership.destroy}.to_not raise_error}
    it { expect{group1_admin_membership.destroy}.to raise_error "Cannot destroy the last membership of a group"}

  end
end
