RSpec.configure do |config|
  config.include Devise::TestHelpers, :type => :controller


  # def sign_in_user
  #   @request.env["devise.mapping"] = Devise.mappings[:user]
  #   sign_out :user
  #   @admin = FactoryGirl.create :user, :role => "admin", :name => 'user'
  #   sign_in @admin
  # end

  # def sign_in_basic_user(user=nil)
  #   @request.env["devise.mapping"] = Devise.mappings[:user]
  #   sign_out :user
  #   @basic = user.presence || FactoryGirl.create(:user, :name => 'basic_user', :role => 'basic')
  #   sign_in @basic
  # end

  # def sign_in_admin_user(user=nil)
  #   @request.env["devise.mapping"] = Devise.mappings[:user]
  #   sign_out :user
  #   @admin = user.presence || FactoryGirl.create(:user, :name => 'admin_user', :role => 'admin')
  #   sign_in @admin
  # end

  # def sign_in_labadmin_user(user=nil)
  #   @request.env["devise.mapping"] = Devise.mappings[:user]
  #   sign_out :user
  #   @labadmin = user.presence || FactoryGirl.create(:user, :name => 'labadmin_user', :role => 'labadmin')
  #   sign_in @labadmin
  # end

  # def sign_in_labuser
  #   @request.env["devise.mapping"] = Devise.mappings[:user]
  #   sign_out :user
  #   @labadmin = FactoryGirl.create(:user, :name => 'labuser', :role => 'labadmin')
  #   sign_in @labadmin
  # end

end
