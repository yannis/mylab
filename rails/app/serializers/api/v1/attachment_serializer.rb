class API::V1::AttachmentSerializer < ActiveModel::Serializer
  embed :ids

  attributes :id, :name, :attachable_id, :attachable_type, :url

  def url
    # byebug
    return object.file.url
  end

end
