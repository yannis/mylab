class API::V1::UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email
  embed :ids
  has_many :memberships
end
