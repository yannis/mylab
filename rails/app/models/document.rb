class Document < ActiveRecord::Base

  belongs_to :user, inverse_of: :documents
  belongs_to :category, inverse_of: :documents
  has_many :versions, inverse_of: :document, dependent: :destroy
  has_many :sharings, as: :sharable, dependent: :destroy
  has_many :groups, through: :sharings
  has_many :sharables, through: :sharings
  has_many :pictures, as: :picturable, dependent: :destroy
  has_many :attachments, as: :attachable, dependent: :destroy

  validates_presence_of :user
  validates_presence_of :name
  validates_presence_of :category
  validates_uniqueness_of :name

  # accepts_nested_attributes_for :pictures, allow_destroy: true
  # accepts_nested_attributes_for :attachments, allow_destroy: true

  def share_with(group)
    sharings.create(group: group)
  end

  def shared_with?(object)
    object.has_access_to? self
  end
end
