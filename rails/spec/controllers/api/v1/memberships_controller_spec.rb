require 'rails_helper'

RSpec.describe API::V1::MembershipsController, type: :controller do
  context "Logged in" do

    let(:user1) { create :user }
    let(:user2){create :user}
    let(:group1) { create :group }
    let(:group2) { create :group }
    let!(:membership1){create :membership, user: user1, group: group1, role: 'admin'}
    2.times do |i|
      let!("membership#{i+2}".to_sym){create :membership, user: user1}
    end
    let!(:membership4){create :membership, user: user2, group: group1, role: 'basic'}

    context "user signed in" do

      before { sign_in(user1) }

      context "with 3 membership in the database" do

        let!(:membership1){create :membership, user: user1, group: group1, role: 'admin'}
        2.times do |i|
          let!("membership#{i+2}".to_sym){create :membership, user: user1}
        end

        describe "GET 'index'" do
          before { xhr :get, 'index'}
          it { expect(response).to be_success }
          it {expect(assigns(:memberships).to_a).to match_array [membership1, membership2, membership3, membership4]}
        end

        describe "GET 'create'" do
          context "in a group1 administered by user1" do
            let(:user3){create :user}
            before {
              xhr :get, 'create', membership: {user_id: user3.id, group_id: group1.id, role: "basic"}
            }
            it "returns http success" do
              expect(response).to be_success
            end
            it {expect(assigns(:membership)).to be_valid}
            it {expect(assigns(:membership).group).to eql group1}
            it {expect(assigns(:membership).user).to eql user3}
          end
          context "in a group1 administered by user1" do
            before {
              xhr :get, 'create', membership: {user_id: user2.id, group_id: group2.id, role: "basic"}
            }
            it {expect(response).to be_forbidden}
            it {expect(assigns(:membership)).to_not be_persisted}
            it {expect(assigns(:membership).group).to eql group2}
            it {expect(assigns(:membership).user).to eql user2}
          end
        end

        describe "GET 'update'" do
          it {expect(membership4).to be_valid}
          before { xhr :put, 'update', id: membership4.id, membership: {role: 'admin'}}
          it {expect(response).to be_success}
          it {expect(assigns(:membership).user).to eql user2}
        end

        describe "DELETE 'destroy'" do
          it {
            expect{
              xhr :delete, 'destroy', id: membership4.id
            }.to change{Membership.count}.by(-1)
          }
          it "returns http success" do
            xhr :delete, 'destroy', id: membership4.id
            expect(response).to be_success
          end
        end
      end
    end
  end
end
