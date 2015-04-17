FactoryGirl.define do
  factory :version do
    name {Faker::Company.catch_phrase}
    content_md {Faker::Lorem.paragraph(3)}
    content_html {Faker::Lorem.paragraph(3)}
    association :document
  end
end
