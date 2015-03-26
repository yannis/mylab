class API::V1::DocumentSerializer < ActiveModel::Serializer
  attributes :id, :name
  embed :ids
  has_many :versions
  has_many :pictures
  has_many :attachments

end