require 'rails_helper'

RSpec.describe API::V1::GroupsController, type: :controller do
  context "Logged in" do

    let(:user) { create :user }
    before { sign_in(user) }

    context "with 3 user's group in the database, and 3 others" do

      3.times do |i|
        let!("group_#{i+1}".to_sym){create :group, name: "group_#{i+1}", memberships: [build(:membership, role: 'admin')]}
      end

      3.times do |i|
        let!("user_group_#{i+1}".to_sym){create :group, name: "user_group_#{i+1}", memberships: [build(:membership, user_id: user.id, role: 'admin'), build(:membership, role: 'admin')]}
      end

      describe "GET 'index'" do
        before { get 'index', format: :json}
        it { expect(response).to be_success }
        it {expect(assigns(:groups).to_a).to match_array [user_group_1, user_group_2, user_group_3]}
      end

      describe "GET 'create'" do
        before {
          @membership_count = Membership.count
          xhr :get, 'create', format: :json, group: {name: "a new group"}
        }
        it { expect(response).to be_success}
        it {expect(assigns(:group).name).to eql "a new group"}
        it {expect(Membership.count-@membership_count).to eql 1}
        it {expect(assigns(:group).reload.memberships.of_user(user).count).to eql 1}
        it {expect(assigns(:group).memberships.of_user(user).map(&:role)).to match_array ["admin"]}
      end

      describe "GET 'create' with memberships nested attributes" do
        let(:user2) {create :user}
        before {
          @membership_count = Membership.count
          xhr :get, 'create', format: :json, group: {name: "a new group", memberships_attributes: {"1" => {user_id: user2.id, role: "basic"}} }
        }
        it {expect(assigns(:group)).to be_valid_verbose}
        it {expect(Membership.count-@membership_count).to eql 2}
        it {expect(assigns(:group).reload.memberships.of_user(user).count).to eql 1}
        it {expect(assigns(:group).memberships.of_user(user).map(&:role)).to match_array ["admin"]}
        it {expect(assigns(:group).reload.memberships.of_user(user2).count).to eql 1}
        it {expect(assigns(:group).memberships.of_user(user2).map(&:role)).to match_array ["basic"]}
      end

      describe "PUT 'update'" do
        context "for a group admininstered by user" do
          before {
            xhr :put, 'update', id: user_group_1.id, group: {name: "updated name"}, format: :json
          }
          it {expect(response).to be_success}
          it {expect(assigns(:group).name).to eql "updated name"}
        end

        context "for a group not admininstered by user" do
          before {
            xhr :put, 'update', id: group_1.id, group: {name: "updated name"}, format: :json
          }
          it {expect(response.status).to eql 403}
          it {expect(response).to be_forbidden}
          it {expect(assigns(:group).name).to eql "group_1"}
        end
      end

      describe "DELETE 'destroy'" do
        context "for a group admininstered by user" do

          it {expect(user_group_1.memberships.count).to eq(2)}

          it {
            expect{
              xhr :delete, 'destroy', id: user_group_1.id, format: :json
            }.to change{Group.count}.by(-1)
          }
          it "returns http success" do
            xhr :delete, 'destroy', id: user_group_1.id, format: :json
            expect(response).to be_success
          end
        end
      end

    end

  end
end
