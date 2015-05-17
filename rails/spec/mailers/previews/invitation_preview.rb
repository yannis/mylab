# Preview all emails at http://localhost:3000/rails/mailers/invitation
class InvitationPreview < ActionMailer::Preview

  # Preview this email at http://localhost:3000/rails/mailers/invitation/invite
  def invite
    Invitation.invite
  end

end
