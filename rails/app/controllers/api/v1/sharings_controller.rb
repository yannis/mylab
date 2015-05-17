class API::V1::SharingsController < ApplicationController

  load_and_authorize_resource :group
  load_and_authorize_resource :sharing, through: [:group], shallow: true, param_method: :sanitizer

  respond_to :json

  def index
    respond_with @sharings, each_serializer: API::V1::SharingSerializer
  end

  def show
    respond_with @sharing, serializer: API::V1::SharingSerializer
  end

  def create
    @sharing.save!
    render json: @sharing, serializer: API::V1::SharingSerializer
  end

  def update
    @sharing.update_attributes sanitizer
    respond_with @sharing
  end

  def destroy
    respond_with @sharing.destroy
  end

private

  def sanitizer
    params.require(:sharing).permit(:group_id, :sharable_id, :sharable_type)
  end

end
