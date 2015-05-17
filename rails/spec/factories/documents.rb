FactoryGirl.define do
  factory :document do
    name {Faker::Company.catch_phrase}
    association :category
    association :user
  end
end
