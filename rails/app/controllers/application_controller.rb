class ApplicationController < ActionController::Base

  include CanCan::ControllerAdditions

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :null_session#, only: Proc.new { |c| c.request.format.json? }

  before_action :authenticate_user_from_token!, unless: :devise_controller?

  # Enter the normal Devise authentication path,
  # using the token authenticated user if available
  # before_action :authenticate_api_v1_user!, unless: :devise_controller?

  respond_to :json

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  rescue_from CanCan::AccessDenied do |exception|
    render json: {errors: exception.message}, status: 403
  end

  def current_user
    current_api_v1_user
  end

  def empty_db
    if Rails.env.test?
      Category.destroy_all
      Document.destroy_all
      Version.destroy_all
      render text: "nothing"
    end
  end

private

  def authenticate_user_from_token!
    authenticate_with_http_token do |token, options|
      Rails.logger.debug "options: #{options}"
      user_email = options[:user_email].presence
      user       = user_email && User.find_by_email(user_email)

      if user && Devise.secure_compare(user.authentication_token, token)
        sign_in user, store: false
      end
    end
  end

  def render_not_found(exception)
    render json: {errors: exception.message}, status: 404
  end
end
