class API::V1::UsersController < ApplicationController

  def index
    @users = User.all
    respond_with @users, each_serializer: API::V1::UserSerializer
  end

  def show
    @user = User.find params[:id]
    respond_to do |format|
      format.json {
        render json: @user, serializer: API::V1::UserSerializer
      }
    end
  end

  def create
    @user = User.new sanitizer
    if @user.save
      render json: @user, serializer: API::V1::UserSerializer, status: :created
    else
      render json: {errors: @user.errors}, status: :unprocessable_entity
    end
  end

  def update
    @user = User.find params[:id]
    if @user.update_attributes sanitizer
      render json: @user, serializer: API::V1::UserSerializer, status: :created
    else
      render json: {errors: @user.errors}, status: :unprocessable_entity
    end
  end

  def destroy
    @user = User.find params[:id]
    respond_with @user.destroy
  end
private

  def sanitizer
    params.require(:user).permit(:name, :email)
  end
end
