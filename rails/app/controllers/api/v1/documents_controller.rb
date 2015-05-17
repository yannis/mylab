class API::V1::DocumentsController < ApplicationController

  load_and_authorize_resource :document, param_method: :sanitizer

  respond_to :json

  def index
    meta = {}
    if params[:search].present? && params[:search] != 'undefined'
      @documents = @documents.where("LOWER(documents.name) LIKE ?", "%#{params[:search].downcase}%")
    end
    if params[:page].present?
      page = (params[:page].presence || 1).to_i
      per_page = (params[:per_page].presence || 10).to_i
      @documents = @documents.page(page).per(per_page)
      meta[:total_pages] = @documents.total_pages
    end
    respond_with @documents, each_serializer: API::V1::DocumentSerializer, meta: meta
  end

  def show
    respond_with @document, serializer: API::V1::DocumentSerializer
  end

  def create
    if @document.save
      render json: @document, serializer: API::V1::DocumentSerializer, status: :created
    else
      render json: {errors: @document.errors}, status: :unprocessable_entity
    end
  end

  def update
    @document.update_attributes sanitizer
    respond_with @document
  end

  def destroy
    respond_with @document.destroy
  end


private

  def sanitizer
    params.require(:document).permit(:name, :category_id)
  end

end
