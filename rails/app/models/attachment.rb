class Attachment < ActiveRecord::Base

  belongs_to :attachable, polymorphic: true

  mount_uploader :file, FileUploader

  validates_presence_of :name
end
