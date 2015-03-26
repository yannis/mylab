class API::V1::AttachmentsController < ApplicationController

  respond_to :json

  def index
    @attachments = Attachment.all
    meta = {}
    if params[:search].present? && params[:search] != 'undefined'
      @attachments = @attachments.where("LOWER(attachments.name) LIKE ?", "%#{params[:search].downcase}%")
    end
    if params[:page].present?
      page = (params[:page].presence || 1).to_i
      per_page = (params[:per_page].presence || 10).to_i
      @attachments = @attachments.page(page).per(per_page)
      meta[:total_pages] = @attachments.total_pages
    end
    respond_with @attachments, each_serializer: API::V1::AttachmentSerializer, meta: meta
  end

  def show
    @attachment = Attachment.find params[:id]
    respond_with @attachment, serializer: API::V1::AttachmentSerializer
  end

  def create
    # @attachment = Attachment.new(sanitizer)
    @attachment = Attachment.new sanitizer
    @attachment.save!
    render json: @attachment, serializer: API::V1::AttachmentSerializer
    # if @attachment.save
    #   render json: @attachment, status: :created
    # else
    #   render json: {errors: @attachment.errors}, status: :unprocessable_entity
    # end
  end

  def update
    @attachment = Attachment.find params[:id]
    @attachment.update_attributes sanitizer
    respond_with @attachment
  end

  def destroy
    @attachment = Attachment.find params[:id]
    respond_with @attachment.destroy
  end

protected

  def convert_to_upload(attachment)
      attachment_data = split_base64(attachment[:data])

      temp_img_file = Tempfile.new("data_uri-upload")
      temp_img_file.binmode
      temp_img_file << Base64.decode64(attachment_data[:data])
      temp_img_file.rewind

      ActionDispatch::Http::UploadedFile.new({
        filename: attachment[:filename],
        type: attachment[:type],
        tempfile: temp_img_file
      })
  end

  def split_base64(uri_str)
      if uri_str.match(%r{^data:(.*?);(.*?),(.*)$})
          uri = Hash.new
          uri[:type] = $1 # "attachment/gif"
          uri[:encoder] = $2 # "base64"
          uri[:data] = $3 # data string
          uri[:extension] = $1.split('/')[1] # "gif"
          return uri
      end
  end


private

  def sanitizer

    params[:attachment][:file] = convert_to_upload(params[:attachment][:file])
    params.require(:attachment).permit(:file, :attachable_id, :attachable_type, :name)
    # params[:attachment][:attachment] = convert_to_upload(params[:attachment][:attachment])
    # params.require(:attachment).permit(:file, :attachable_id, :attachable_type, :name)
    # if current_user.present?
    #   if current_user.admin?
    #     params.require(:user).permit!
    #   elsif current_user.member?
    #     params.require(:user).permit(:id, :name, :description)
    #   end
    # end
  end

end
