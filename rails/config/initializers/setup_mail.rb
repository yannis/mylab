ActionMailer::Base.smtp_settings = {
  :address => ENV["MAILER_SETTINGS_ADDRESS"],
  :port => 587,
  :enable_starttls_auto => true,
  :user_name => ENV["MAILER_SETTINGS_USER"],
  :password => ENV["MAILER_SETTINGS_PASSWORD"],
  :authentication => :login
}

ActionMailer::Base.default_url_options = { host: ENV['MAILER_HOST'] }
