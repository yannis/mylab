class API::V1::AttachmentSerializer < ActiveModel::Serializer
  include GetModelPermissions
  get_model_permissions_and :id, :name, :attachable_id, :attachable_type, :url
  embed :ids

  def url
    # byebug
    return object.file.url
  end

end
