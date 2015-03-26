class API::V1::PictureSerializer < ActiveModel::Serializer

  include CarrierWave::RMagick

  embed :ids

  attributes :id, :picturable_id, :picturable_type, :thumbnails, :thumb_small_url, :filename

  # has_one :picturable

  def url
    return object.image.url
  end

  def thumb_xs_url
    return object.image.url(:thumb_xs)
  end
  def thumb_small_url
    return object.image.url(:thumb_s)
  end
  def thumb_url
    return object.image.url(:thumb)
  end
  def medium_url
    return object.image.url(:medium)
  end

  def filename
    return object.image.file.filename
  end

  def thumbnails
    thumbnails = []
    object.image.versions.each do |key, value|
      img = ::Magick::Image::read(value.file.file).first
      # model.width = img.columns
      # model.height = img.rows

      version = {name: key}
      version[:picture_id] = object.id
      version[:id] = img.object_id
      version[:width] = img.columns
      version[:height] = img.rows
      version[:url] = value.url
      thumbnails << version
    end
    return thumbnails
  end
end
