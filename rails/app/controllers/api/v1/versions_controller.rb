class API::V1::VersionsController < ApplicationController

  skip_before_filter :authenticate_user_from_token!, only: [:show_pdf]
  skip_before_filter :authenticate_api_v1_user!, only: [:show_pdf]
  before_filter :authenticate_user, only: [:show_pdf]
  load_and_authorize_resource :version, param_method: :sanitizer, except: [:show_pdf]

  respond_to :json

  def index
    respond_with @versions
  end

  def show
    respond_to do |format|
      format.json {
        render json: @version, serializer: API::V1::VersionSerializer
      }
    end
  end

  def show_pdf
    @version = Version.accessible_by(current_ability, :read).find(params[:id])
    respond_to do |format|
      format.pdf {
        render  pdf: "#{@version.document.id}_#{@version.id}"
      }
    end
  end

  def create
    @version.creator = current_user
    if @version.save
      render json: @version, serializer: API::V1::VersionSerializer, status: :created
    else
      render json: {errors: @version.errors}, status: :unprocessable_entity
    end
  end

  def update
    @version.updater = current_user
    if @version.update_attributes sanitizer
      render json: @version, serializer: API::V1::VersionSerializer, status: :created
    else
      render json: {errors: @version.errors}, status: :unprocessable_entity
    end
  end

  def destroy
    respond_with @version.destroy
  end

private

  def sanitizer
    params.require(:version).permit(:content_md, :content_html, :document_id)
  end

  def authenticate_user
    token = params[:token].presence
    user_email = params[:user_email].presence
    user = user_email && User.find_by_email(user_email)
    if user && Devise.secure_compare(user.authentication_token, token)
      sign_in user, store: false
    end
  end
end
