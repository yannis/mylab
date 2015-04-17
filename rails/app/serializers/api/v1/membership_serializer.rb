class API::V1::MembershipSerializer < ActiveModel::Serializer
  attributes :id, :role
  embed :ids
  has_one :group
  has_one :user
end
