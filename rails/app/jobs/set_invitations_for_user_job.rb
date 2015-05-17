class SetInvitationsForUserJob < ActiveJob::Base
  queue_as :default

  def perform(user_id)
    user = User.find user_id
    if user
      Invitation.where(email: user.email).each do |invitation|
        Rails.logger.info "INVITATION: #{invitation.id}"
        invitation.update_attributes!(invited: user)
      end
    end
    # Do something later
  end
end
