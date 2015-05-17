class API::V1::PicturesController < ApplicationController

  load_and_authorize_resource :picture, param_method: :sanitizer

  respond_to :json

  def index
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
    respond_with @picture, serializer: API::V1::PictureSerializer
  end

  def create
    @picture.save!
    render json: @picture, serializer: API::V1::PictureSerializer
    # if @picture.save
    #   render json: @picture, status: :created
    # else
    #   render json: {errors: @picture.errors}, status: :unprocessable_entity
    # end
  end

  def update
    @picture.update_attributes sanitizer
    respond_with @picture
  end

  def destroy
    respond_with @picture.destroy
  end

private

  def sanitizer
    params[:picture][:image] = Upload.new(params[:picture][:image]).convert
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
