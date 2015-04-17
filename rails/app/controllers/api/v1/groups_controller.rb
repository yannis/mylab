class API::V1::GroupsController < ApplicationController

  respond_to :json

  def index
    @groups = Group.all
    respond_with @groups, each_serializer: API::V1::GroupSerializer
  end

  def show
    @group = Group.find params[:id]
    respond_with @group, serializer: API::V1::GroupSerializer
  end

  def create
    @group = Group.new sanitizer
    if @group.save
      render json: @group, serializer: API::V1::GroupSerializer, status: :created
    else
      render json: {errors: @group.errors}, status: :unprocessable_entity
    end
  end

  def update
    @group = Group.find params[:id]
    @group.update_attributes sanitizer
    respond_with @group
  end

  def destroy
    @group = Group.find params[:id]
    respond_with @group.destroy
  end


private

  def sanitizer
    params.require(:group).permit(:name)
  end

end
