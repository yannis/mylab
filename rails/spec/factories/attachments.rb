FactoryGirl.define do
  factory :attachment do
    name {Faker::Name.name}
    file Rack::Test::UploadedFile.new(File.join(Rails.root, "spec/fixtures", "small.pdf"), 'application/pdf')
    association :attachable, factory: :document
  end
end
