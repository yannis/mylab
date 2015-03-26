class API::V1::DocumentsController < ApplicationController

  respond_to :json

  def index
    @documents = Document.all
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
    @document = Document.find params[:id]
    respond_with @document, serializer: API::V1::DocumentSerializer
  end

  def create
    @document = Document.new sanitizer
    if @document.save
      render json: @document, serializer: API::V1::DocumentSerializer, status: :created
    else
      render json: {errors: @document.errors}, status: :unprocessable_entity
    end
  end

  def update
    @document = Document.find params[:id]
    @document.update_attributes sanitizer
    respond_with @document
  end

  def destroy
    @document = Document.find params[:id]
    respond_with @document.destroy
  end


private

  def sanitizer
    params.require(:document).permit(:name)
    # if current_user.present?
    #   if current_user.admin?
    #     params.require(:user).permit!
    #   elsif current_user.member?
    #     params.require(:user).permit(:id, :name, :description)
    #   end
    # end
  end

end
