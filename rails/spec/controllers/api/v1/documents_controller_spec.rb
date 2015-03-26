require 'rails_helper'


RSpec.describe API::V1::DocumentsController, type: :controller do

  context "with 3 documents in the database" do

    3.times do |i|
      let!("document_#{i+1}".to_sym){create :document}
    end

    describe "GET 'index'" do
      before { get 'index', format: :json}
      it { expect(response).to be_success }
      it {expect(assigns(:documents).to_a).to match_array [document_1, document_2, document_3]}
    end



    describe "GET 'create'" do
      before {
        xhr :get, 'create', format: :json, document: {name: "a new document"}
      }
      it "returns http success" do
        expect(response).to be_success
      end
      it {expect(assigns(:document).name).to eql "a new document"}
    end

    describe "GET 'update'" do
      before { get 'update', id: document_1.id, document: {name: "updated name"}, format: :json}
      it "returns http success" do
        expect(response).to be_success
      end
      it {expect(assigns(:document).name).to eql "updated name"}
    end

  end

end
