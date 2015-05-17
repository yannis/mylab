class API::V1::GroupSerializer < ActiveModel::Serializer
  include GetModelPermissions
  get_model_permissions_and :id, :name
  embed :ids
  has_many :memberships
  has_many :sharings
  has_many :invitations
end
