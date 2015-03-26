FactoryGirl.define do
  factory :version do
    content_md {Faker::Lorem.paragraph(3)}
    content_html {Faker::Lorem.paragraph(3)}
  end
end
