require 'rails_helper'

RSpec.describe API::V1::CategoriesController, type: :controller do
  context "Logged in" do

    let(:user) { create :user }
    before { sign_in(user) }

    let(:category) {create :category}


    describe "GET #index" do
      it "returns http success" do
        get :index, format: :json
        expect(response).to have_http_status(:success)
      end
    end

    describe "GET #show" do
      it "returns http success" do
        get :show, id: category.id, format: :json
        expect(response).to have_http_status(:success)
      end
    end

    describe "GET #create" do
      it "returns http success" do
        get :create, format: :json, category: {name: "A new category"}
        expect(response).to have_http_status(:success)
      end
    end

    describe "GET #update" do
      it "returns http success" do
        get :update, id: category.id, format: :json, category: {name: "An other category"}
        expect(response).to have_http_status(:success)
      end
    end

    describe "GET #destroy" do
      it "returns http success" do
        get :destroy, id: category.id, format: :json
        expect(response).to have_http_status(:success)
      end
    end

  end
end
