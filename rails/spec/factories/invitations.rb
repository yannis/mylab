FactoryGirl.define do
  factory :invitation do |i|
    group = Group.create(name: Faker::Company.name)
    i.inviter { create(:user, memberships: [create(:membership, group: group, role: 'admin')]) }
    i.group { group }
    i.association :invited, factory: :user
  end
end
