class API::V1::PicturesController < ApplicationController

  respond_to :json

  def index
    @pictures = Picture.all
    meta = {}
    if params[:page].present?
      page = (params[:page].presence || 1).to_i
      per_page = (params[:per_page].presence || 10).to_i
      @pictures = @pictures.page(page).per(per_page)
      meta[:total_pages] = @pictures.total_pages
    end
    respond_with @pictures, each_serializer: API::V1::PictureSerializer, meta: meta
  end

  def show
    @picture = Picture.find params[:id]
    respond_with @picture, serializer: API::V1::PictureSerializer
  end

  def create
    # @picture = Picture.new(sanitizer)
    @picture = Picture.new sanitizer
    @picture.save!
    render json: @picture, serializer: API::V1::PictureSerializer
    # if @picture.save
    #   render json: @picture, status: :created
    # else
    #   render json: {errors: @picture.errors}, status: :unprocessable_entity
    # end
  end

  def update
    @picture = Picture.find params[:id]
    @picture.update_attributes sanitizer
    respond_with @picture
  end

  def destroy
    @picture = Picture.find params[:id]
    respond_with @picture.destroy
  end

protected

  def convert_to_upload(image)
      image_data = split_base64(image[:data])

      temp_img_file = Tempfile.new("data_uri-upload")
      temp_img_file.binmode
      temp_img_file << Base64.decode64(image_data[:data])
      temp_img_file.rewind

      ActionDispatch::Http::UploadedFile.new({
        filename: image[:filename],
        type: image[:type],
        tempfile: temp_img_file
      })
  end

  def split_base64(uri_str)
      if uri_str.match(%r{^data:(.*?);(.*?),(.*)$})
          uri = Hash.new
          uri[:type] = $1 # "image/gif"
          uri[:encoder] = $2 # "base64"
          uri[:data] = $3 # data string
          uri[:extension] = $1.split('/')[1] # "gif"
          return uri
      end
  end


private

  def sanitizer
    params[:picture][:image] = convert_to_upload(params[:picture][:image])
    params.require(:picture).permit(:image, :picturable_id, :picturable_type)
    # if current_user.present?
    #   if current_user.admin?
    #     params.require(:user).permit!
    #   elsif current_user.member?
    #     params.require(:user).permit(:id, :name, :description)
    #   end
    # end
  end

end
