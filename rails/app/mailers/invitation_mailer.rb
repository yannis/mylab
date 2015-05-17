class InvitationMailer < ApplicationMailer

  def invite_existing_user(invitation_id)
    @invitation = Invitation.find(invitation_id)
    if @invitation
      @inviter = @invitation.inviter
      @invited = @invitation.invited
      @group = @invitation.group
      mail( to:       @invited.email,
            subject:  "#{@inviter.name} invited you to group myLab group '#{@group.name}'",
            reply_to: @inviter.email) do |format|
        format.text
        format.html
      end
    end
  end

  def invite_new_user(invitation_id)
    @invitation = Invitation.find invitation_id
    if @invitation
      @inviter = @invitation.inviter
      @invited_email = @invitation.email
      @group = @invitation.group
      mail( to: @invited_email,
            subject:  "#{@inviter.name} invited you to use myLab, a document sharing application",
            reply_to: @inviter.email) do |format|
        format.text
        format.html
      end
    end
  end
end
