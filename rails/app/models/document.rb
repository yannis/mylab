class Document < ActiveRecord::Base

  validates_presence_of :name
  validates_uniqueness_of :name

  belongs_to :category, inverse_of: :documents
  has_many :versions, dependent: :destroy
  has_many :pictures, as: :picturable, dependent: :destroy
  has_many :attachments, as: :attachable, dependent: :destroy

  # accepts_nested_attributes_for :pictures, allow_destroy: true
  # accepts_nested_attributes_for :attachments, allow_destroy: true

end
