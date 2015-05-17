class ApplicationMailer < ActionMailer::Base
  default from: "\"myLab\" <#{ENV['MAILER_SENDER']}>"
  layout 'mailer'
end
