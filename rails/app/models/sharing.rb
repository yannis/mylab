class Sharing < ActiveRecord::Base
  belongs_to :sharable, polymorphic: true
  belongs_to :group, inverse_of: :sharings

  validates_presence_of :group
  validates_presence_of :sharable
  validates_uniqueness_of :group, scope: [:sharable_id, :sharable_type]
end
