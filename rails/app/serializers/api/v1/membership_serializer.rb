class API::V1::MembershipSerializer < ActiveModel::Serializer
  include GetModelPermissions
  get_model_permissions_and :id, :role
  embed :ids
  has_one :group
  has_one :user
end
