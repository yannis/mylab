FactoryGirl.define do
  factory :membership do
    role 'basic'
    association :group
    association :user
  end
end
