FactoryGirl.define do
  factory :sharing do
    association :sharable, factory: :document
    association :group
  end
end
