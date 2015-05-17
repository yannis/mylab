class API::V1::GroupsController < ApplicationController

  load_and_authorize_resource :group, param_method: :sanitizer

  def index
    respond_with @groups, each_serializer: API::V1::GroupSerializer
  end

  def show
    respond_with @group, serializer: API::V1::GroupSerializer
  end

  def create
    if @group.memberships.of_user(current_user).blank?
      @group.memberships << Membership.new(user: current_user, role: "admin")
    end
    if @group.save
      render json: @group, serializer: API::V1::GroupSerializer, status: :created
    else
      render json: {errors: @group.errors}, status: :unprocessable_entity
    end
  end

  def update
    @group.update_attributes sanitizer
    respond_with @group
  end

  def destroy
    respond_with @group.destroy
  end


private

  def sanitizer
    params.require(:group).permit(:name, {memberships_attributes: [:role, :user_id]})
  end

end
