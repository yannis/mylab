require 'rails_helper'

RSpec.describe API::V1::UsersController, type: :controller do
  context "Logged in" do

    let(:user) { create :user }
    before { sign_in(user) }

    describe "GET #index" do
      it "returns http success" do
        get :index, format: :json
        expect(response).to have_http_status(:success)
      end
    end

    describe "GET #show" do
      it "returns http success" do
        get :show, id: user.id, format: :json
        expect(response).to have_http_status(:success)
      end
    end

  end
end
