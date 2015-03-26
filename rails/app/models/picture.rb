class Picture < ActiveRecord::Base

  belongs_to :picturable, polymorphic: true

  mount_uploader :image, ImageUploader
end
