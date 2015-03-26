class API::V1::VersionSerializer < ActiveModel::Serializer
  attributes :id, :name, :content_md, :content_html, :document_id, :created_at, :updated_at
end
