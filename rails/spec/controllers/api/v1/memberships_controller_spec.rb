require 'rails_helper'

RSpec.describe API::V1::MembershipsController, type: :controller do
  context "Logged in" do

    let(:user) { create :user }
    let(:group) { create :group }
    before { sign_in(user) }

    context "with 3 membership in the database" do

      3.times do |i|
        let!("membership_#{i+1}".to_sym){create :membership, group: group}
      end

      describe "GET 'index'" do
        before { get 'index', format: :json}
        it { expect(response).to be_success }
        it {expect(assigns(:memberships).to_a).to match_array [membership_1, membership_2, membership_3]}
      end

      describe "GET 'create'" do
        before {
          xhr :get, 'create', format: :json, membership: {user_id: user.id, group_id: group.id, role: "basic"}
        }
        it "returns http success" do
          expect(response).to be_success
        end
        it {expect(assigns(:membership)).to be_valid}
        it {expect(assigns(:membership).group).to eql group}
        it {expect(assigns(:membership).user).to eql user}
      end

      describe "GET 'update'" do
        let(:another_user){create :user}
        before { get 'update', id: membership_1.id, membership: {user_id: another_user.id}, format: :json}
        it "returns http success" do
          expect(response).to be_success
        end
        it {expect(assigns(:membership).user).to eql another_user}
      end

      describe "DELETE 'destroy'" do
        it {
          expect{
            xhr :get, 'destroy', id: membership_1.id, format: :json
          }.to change{Membership.count}.by(-1)
        }
        it "returns http success" do
          get 'destroy', id: membership_1.id, format: :json
          expect(response.status).to eql 200
        end
      end
    end
  end
end
