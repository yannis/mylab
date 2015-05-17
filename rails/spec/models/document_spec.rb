require 'rails_helper'

RSpec.describe Document, type: :model do
  it { is_expected.to belong_to :user }
  it { is_expected.to belong_to :category }

  it { is_expected.to have_many :versions }

  it { is_expected.to have_many(:pictures).dependent(:destroy) }
  it { is_expected.to have_many(:attachments).dependent(:destroy) }

  it { is_expected.to have_many(:sharings).dependent(:destroy) }
  it { is_expected.to have_many(:groups).through(:sharings) }

  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_uniqueness_of(:name) }
  it { is_expected.to validate_presence_of(:user) }

  context "A document" do
    let(:user) {create :user}
    let!(:user2) {create :user}
    let!(:user3) {create :user}
    let(:group) {create :group, memberships: [build(:membership, user: user, role: "basic"), build(:membership, user: user2, role: "basic")]}
    let(:document) { create :document, user: user }
    it {expect(document).to be_valid_verbose}
    it {expect(document).to_not be_shared_with(group)}
    it {expect(document).to be_shared_with(user)}
    it {expect{document.share_with(group)}.to change{Sharing.count}.by(+1)}

    context "shared with group" do
      before {
        document.share_with(group)
      }

      it {expect(document).to be_shared_with(group)}
    end
  end
end
