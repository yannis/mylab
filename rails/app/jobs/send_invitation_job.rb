class SendInvitationJob < ActiveJob::Base
  queue_as :default

  def perform(*args)
    # Do something later
    byebug
    invitation = Invitation.find args[:invitation_id]
  end
end
