class API::V1::CsrfController < ApplicationController

  skip_before_filter :authenticate_api_v1_user!

  def index
    render json: { request_forgery_protection_token => form_authenticity_token }.to_json
  end
end
