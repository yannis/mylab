class API::V1::VersionSerializer < ActiveModel::Serializer
  include GetModelPermissions
  get_model_permissions_and :id, :name, :content_md, :content_html, :created_at, :updated_at, :pdf_url
  embed :ids
  has_one :document
  has_one :creator
  has_one :updater

  def pdf_url
    show_pdf_api_v1_version_url object, format: :pdf
  end
end
