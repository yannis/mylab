class API::V1::CategorySerializer < ActiveModel::Serializer
  embed :ids

  attributes :id, :name

  has_many :documents
end
