class Category < ActiveRecord::Base

  has_many :documents, inverse_of: :category, dependent: :nullify

  validates_presence_of :name
  validates_uniqueness_of :name

end
