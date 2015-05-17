class API::V1::DocumentSerializer < ActiveModel::Serializer
  include GetModelPermissions
  get_model_permissions_and :id, :name, :created_at
  embed :ids
  has_one :user
  has_one :category
  has_many :versions
  has_many :pictures
  has_many :attachments
  has_many :sharings
end
