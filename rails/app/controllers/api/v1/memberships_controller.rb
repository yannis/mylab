class API::V1::MembershipsController < ApplicationController

  respond_to :json

  def index
    @memberships = Membership.all
    respond_with @memberships, each_serializer: API::V1::MembershipSerializer
  end

  def show
    @membership = Membership.find params[:id]
    respond_with @membership, serializer: API::V1::MembershipSerializer
  end

  def create
    @membership = Membership.new sanitizer
    if @membership.save
      render json: @membership, serializer: API::V1::MembershipSerializer, status: :created
    else
      render json: {errors: @membership.errors}, status: :unprocessable_entity
    end
  end

  def update
    @membership = Membership.find params[:id]
    @membership.update_attributes sanitizer
    respond_with @membership
  end

  def destroy
    @membership = Membership.find params[:id]
    respond_with @membership.destroy
  end


private

  def sanitizer
    params.require(:membership).permit(:role, :user_id, :group_id)
  end

end
