class API::V1::InvitationsController < ApplicationController

  load_and_authorize_resource :invitation, param_method: :sanitizer, except: [:accept, :decline, :create_user]


  respond_to :json

  def index
    if params[:token]
      @invitations = Invitation.where(token: params[:token])
    else
      authorize! :read, Invitation
      @invitations = Invitation.accessible_by(Ability.new(current_user), :read)
    end
    if params[:id]
      @invitations = @invitations.where(id: params[:id])
    end
    respond_with @invitations, each_serializer: API::V1::InvitationSerializer
  end
  # def index
  #   if params[:token]
  #     @invitations = Invitation.where(token: params[:token])
  #   else
  #     authorize! :read, Invitation
  #     @invitations = Invitation.accessible_by(Ability.new(current_user), :read)
  #   end
  #   if params[:id]
  #     @invitations = @invitations.where(id: params[:id])
  #   end
  #   respond_with @invitations, each_serializer: API::V1::InvitationSerializer
  # end

  def show
    respond_with @invitation, serializer: API::V1::InvitationSerializer
  end

  def create
    if @invitation.inviter.nil?
      @invitation.inviter = current_user
    end
    if @invitation.save
      render json: @invitation, serializer: API::V1::InvitationSerializer, status: :created
    else
      render json: {errors: @invitation.errors}, status: :unprocessable_entity
    end
  end

  # def update
  #   @invitation.update_attributes sanitizer
  #   respond_with @invitation
  # end

  def destroy
    respond_with @invitation.destroy
  end

  def accept
    @invitation = Invitation.find(params[:id])
    authorize! :update, @invitation
    if @invitation.accept!
      respond_with nil, status: :accepted
    else
      render json: {errors: @invitation.errors}, status: :unprocessable_entity
    end
  end

  def decline
    @invitation = Invitation.find(params[:id])
    authorize! :update, @invitation
    if @invitation.decline!
      respond_with nil, status: :accepted
    else
      render json: {errors: @invitation.errors}, status: :unprocessable_entity
    end
  end

  # def create_user
  #   invitation = Invitation.find(params[:id])
  #   user = User.new(user_sanitizer)
  #   if user.email == invitation.email && user.save
  #     render json: user, serializer: API::V1::UserSerializer, status: :created
  #   else
  #     render json: {errors: user.errors}, status: :unprocessable_entity
  #   end
  # end

private

  def sanitizer
    params.require(:invitation).permit(:email, :inviter_id, :invited_id, :group_id)
  end
  # def user_sanitizer
  #   params.require(:user).permit(:name, :email, :password)
  # end
end
