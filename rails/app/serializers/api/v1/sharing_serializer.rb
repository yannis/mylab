class API::V1::SharingSerializer < ActiveModel::Serializer
  include GetModelPermissions
  get_model_permissions_and :id
  embed :ids
  has_one :group
  has_one :sharable, polymorphic: true
end
