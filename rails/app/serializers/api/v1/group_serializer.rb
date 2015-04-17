class API::V1::GroupSerializer < ActiveModel::Serializer
  attributes :id, :name
  embed :ids
  has_many :memberships
end
