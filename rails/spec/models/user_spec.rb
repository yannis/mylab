require 'rails_helper'

RSpec.describe User, type: :model do
  subject{create :user}
  it {is_expected.to be_valid_verbose}
  it {is_expected.to have_many(:documents).dependent(:delete_all)}
  it {is_expected.to have_many(:memberships).dependent(:delete_all)}
  it {is_expected.to have_many(:groups).through(:memberships)}
  it {is_expected.to have_many(:admin_memberships).dependent(:delete_all)}
  it {is_expected.to have_many(:admin_groups).through(:admin_memberships)}
  it {is_expected.to have_many(:invitations_as_inviter).dependent(:destroy)}
  it {is_expected.to have_many(:invitations_as_invited).dependent(:destroy)}
  it {is_expected.to validate_length_of(:name).is_at_least(3).is_at_most(100)}
  # it {is_expected.to validate_length_of(:email).is_at_least(6).is_at_most(100)} # validated by Devise
  it { is_expected.to validate_presence_of :name }
  it { is_expected.to validate_presence_of :email }
  it { is_expected.to validate_uniqueness_of :email }

  describe "Group interaction" do
    context "2 groups of a same user" do
      let(:group1) { create :group }
      let(:group2) { create :group }
      let!(:user) { create :user, memberships: [create(:membership, group: group1, role: 'basic'), create(:membership, group: group2, role: 'admin')]}
      it {expect(user.groups).to match_array [group1, group2]}
      it {expect(user.admin_groups).to match_array [group2]}
      it {expect(user).to be_admin_of_group(group2)}
    end
  end

  describe "User interaction" do
    context "2 users of a same group and a third of another group" do
      let(:group) { create :group }
      let!(:user1) { create :user, memberships: [create(:membership, group: group)]}
      let!(:user2) { create :user, memberships: [create(:membership, group: group)]}
      let!(:user3) { create :user, memberships: [create(:membership)]}

      it {expect(User.interacting_with(user2)).to match_array [user1]}

      it {expect(user1).to be_interacting_with(user2)}
      it {expect(user1).to_not be_interacting_with(user3)}
    end
  end

  describe "Document interaction" do
    context "2 users of a same group and a third of another group" do
      let(:group) { create :group }
      let!(:user) { create :user, memberships: [create(:membership, group: group)]}
      let!(:document1) { create :document, sharings: [create(:sharing, group: group)]}
      let!(:document2) { create :document, sharings: [create(:sharing)]}

      it {expect(user).to have_access_to document1}
      it {expect(user).to_not have_access_to document2}
    end
  end

  describe "Invitation interaction" do
    context "2 invitations" do
      let!(:user1) { create :user}
      let!(:user2) { create :user}
      let(:group1) { create :group }
      let(:group2) { create :group }
      let!(:membership1) { create :membership, user: user1, group: group1, role: 'admin' }
      let!(:membership2) { create :membership, user: user2, group: group2, role: 'admin' }
      let!(:invitation1) { create :invitation, inviter: user1, invited: user2, group: group1}
      let!(:invitation2) { create :invitation, inviter: user2, invited: user1, group: group2}

      it {expect(user1.invitations_as_inviter).to match_array [invitation1]}
      it {expect(user1.invitations_as_invited).to match_array [invitation2]}
      it {expect(user1.invitations).to match_array [invitation1, invitation2]}

      describe "user 1 accept invitation2" do
        before {user1.accept!(invitation2)}

        it {expect(user1.reload.invitations.accepted).to match_array [invitation2]}
      end
    end
  end

end
