require 'rails_helper'

RSpec.describe API::V1::GroupsController, type: :controller do
  context "Logged in" do

    let(:user) { create :user }
    before { sign_in(user) }

    context "with 3 group in the database" do

      3.times do |i|
        let!("group_#{i+1}".to_sym){create :group}
      end

      describe "GET 'index'" do
        before { get 'index', format: :json}
        it { expect(response).to be_success }
        it {expect(assigns(:groups).to_a).to match_array [group_1, group_2, group_3]}
      end

      describe "GET 'create'" do
        before {
          xhr :get, 'create', format: :json, group: {name: "a new group"}
        }
        it "returns http success" do
          expect(response).to be_success
        end
        it {expect(assigns(:group).name).to eql "a new group"}
      end

      describe "GET 'update'" do
        before { get 'update', id: group_1.id, group: {name: "updated name"}, format: :json}
        it "returns http success" do
          expect(response).to be_success
        end
        it {expect(assigns(:group).name).to eql "updated name"}
      end

      describe "DELETE 'destroy'" do
        it {
          expect{
            xhr :get, 'destroy', id: group_1.id, format: :json
          }.to change{Group.count}.by(-1)
        }
        it "returns http success" do
          get 'destroy', id: group_1.id, format: :json
          expect(response).to be_success
        end
      end

    end

  end
end
