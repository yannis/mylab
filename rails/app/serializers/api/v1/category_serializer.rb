class API::V1::CategorySerializer < ActiveModel::Serializer
  include GetModelPermissions
  get_model_permissions_and :id, :name, :document_ids

  embed :ids

  # has_many :documents

  def document_ids
    return object.documents.accessible_by(current_ability).pluck(:id)
  end
end
