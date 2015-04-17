class Group < ActiveRecord::Base
  has_many :memberships, inverse_of: :group, dependent: :destroy
  has_many :users, through: :memberships

  validates_presence_of :name
  validates_uniqueness_of :name
end
