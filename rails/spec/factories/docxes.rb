FactoryGirl.define do
  factory :docx do
    file {File.new("#{Rails.root}/spec/support/files/word_test.docx")}
  end
end
