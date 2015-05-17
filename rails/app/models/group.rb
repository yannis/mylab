class Group < ActiveRecord::Base
  has_many :memberships, inverse_of: :group, dependent: :destroy
  has_many :users, through: :memberships
  has_many :sharings, inverse_of: :group, dependent: :destroy
  has_many :documents, through: :sharings, source: :sharable, source_type: 'Document'
  has_many :invitations, inverse_of: :group, dependent: :destroy

  validates_presence_of :name
  validates_uniqueness_of :name

  accepts_nested_attributes_for :memberships, allow_destroy: true

  def has_access_to?(document)
    self.documents.includes document
  end
end
