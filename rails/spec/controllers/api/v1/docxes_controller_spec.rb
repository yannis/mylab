require 'rails_helper'

RSpec.describe API::V1::DocxesController, type: :controller do

  describe "GET #create" do
    it "returns http success" do
      docx_path = fixture_path+"/word_test.docx"
      test_docx = Rack::Test::UploadedFile.new(docx_path, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      post :create, docx: {file: {file_name: "word_test.docx", data: test_docx}}
      expect(response).to have_http_status(:success)
    end
  end

end
