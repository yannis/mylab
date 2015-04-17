FactoryGirl.define do
  factory :picture do
    # data fixture_file_upload("#{fixture_path}/terrys-signature.jpg", 'image/jpg')
    image Rack::Test::UploadedFile.new(File.join(Rails.root, "spec/fixtures", "terrys-signature.jpg"), 'image/jpg')
    association :picturable, factory: :document
  end
end
