require 'rails_helper'

RSpec.describe API::V1::InvitationsController, type: :controller do

  context "with 2 invitations in the DB" do

    let(:user1) { create :user }
    let(:user2) { create :user }
    let(:group1) { create :group, memberships: [build(:membership, user: user1, role: 'admin')] }
    let(:group2) { create :group, memberships: [build(:membership, user: user1, role: 'basic')] }
    let(:group3) { create :group, memberships: [build(:membership, user: user2, role: 'admin')] }
    let!(:invitation1) { create :invitation, inviter: user1, invited: user2, group: group1}
    let!(:invitation2) { create :invitation, inviter: user2, invited: user1, group: group3}

    context "user1 signed in" do

      before { sign_in(user1) }

      describe "GET 'index'" do
        before {
          xhr :get, 'index'
        }
        it { expect(response).to be_success }
        it {expect(assigns(:invitations).to_a).to match_array [invitation1, invitation2]}
      end

      describe "GET 'show' id" do
        before {
          xhr :get, 'show', id: invitation1.id
        }
        it { expect(response).to be_success }
        it {expect(assigns(:invitation)).to eql invitation1}
      end

      describe "GET 'create' with valid attribute" do
        before {
          @invitation_count = Invitation.count
          xhr :post, 'create', invitation: {invited_id: create(:user).id, group_id: group1.id}
        }
        it { expect(response).to be_success }
        it { expect(assigns(:invitation).inviter).to eql user1 }
        it { expect(assigns(:invitation)).to be_valid_verbose }
        it { expect(assigns(:invitation)).to be_persisted }
        it { expect(Invitation.count-@invitation_count).to eql 1}
      end

      describe "GET 'create' with invalid attribute" do
        before {
          @invitation_count = Invitation.count
          xhr :post, 'create', invitation: {invited_id: create(:user).id, group_id: group2.id}
        }
        it { expect(response.status).to eql 422 }
        it { expect(response).to be_unprocessable }
        it { expect(assigns(:invitation)).to_not be_valid_verbose }
        it { expect(Invitation.count-@invitation_count).to eql 0 }
      end

      describe "PUT 'accept'" do
        context "for a invitation administered by user" do
          before {
            xhr :put, 'accept', id: invitation1.id
          }
          it {expect(response.status).to eql 403}
          it {expect(response).to be_forbidden}
        end

        context "for a invitation not administered by user" do
          before {
            xhr :put, 'accept', id: invitation2.id
          }
          it {expect(response.status).to eql 204}
          it {expect(response).to be_success}
          it {expect(assigns(:invitation)).to be_accepted}
        end
      end

      describe "PUT 'decline'" do
        context "for a invitation administered by user" do
          before {
            xhr :put, 'decline', id: invitation1.id
          }
          it {expect(response.status).to eql 403}
          it {expect(response).to be_forbidden}
        end

        context "for a invitation not administered by user" do
          before {
            xhr :put, 'decline', id: invitation2.id
          }
          it {expect(response.status).to eql 204}
          it {expect(response).to be_success}
          it {expect(assigns(:invitation)).to be_declined}
        end
      end

      describe "DELETE 'destroy'" do
        context "for a invitation administered by user" do

          it {
            expect{
              xhr :delete, 'destroy', id: invitation1.id
            }.to change{Invitation.count}.by(-1)
          }
          it "returns http success" do
            xhr :delete, 'destroy', id: invitation1.id
            expect(response).to be_success
          end
        end
      end

    end

  end
end
