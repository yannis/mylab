class Invitation < ActiveRecord::Base
  belongs_to :inviter, inverse_of: :invitations_as_inviter, class_name: "User", foreign_key: "inviter_id"
  belongs_to :invited, inverse_of: :invitations_as_invited, class_name: "User", foreign_key: "invited_id"
  belongs_to :group, inverse_of: :invitations

  INVITATION_STATE = ["accepted", "declined"]

  validates_presence_of :inviter
  validates_uniqueness_of :invited_id, scope: :group_id
  validates_presence_of :group
  validates_presence_of :email, if: Proc.new{|invitation| invitation.inviter_id.blank? }
  validates_inclusion_of :state, in: INVITATION_STATE, allow_nil: true

  validates_each :inviter_id do |record, attr, value|
    group = record.group
    inviter = record.inviter
    if group && inviter && !inviter.admin_of_group?(group)
      record.errors.add attr, ": not admin of group '#{group.name}'"
    end
  end

  validates_each :state do |record, attr, value|
    if record.previous_changes[:state]
      last_state = record.previous_changes[:state].last
      if (record.state_at_changed? || record.state_changed?) && last_state.present?
        record.errors.add :base, "This invitation has already been #{last_state}"
      end
    end
  end

  before_validation :set_invited_by_email
  before_save :set_token
  after_create :notify_invited

  def self.pending
    where(state: nil)
  end

  def self.accepted
    where(state: "accepted")
  end

  def self.declined
    where(state: "declined")
  end

  def pending?
    self.state.nil?
  end

  def accepted?
    self.state == "accepted"
  end

  def declined?
    self.state == "declined"
  end

  def accept!
    self.update_attributes state: "accepted", state_at: Time.now
    Membership.create! group: self.group, user: self.invited, role: 'basic'
  end

  def decline!
    self.update_attributes state: "declined", state_at: Time.now
  end

protected

  def generate_token
    SecureRandom.urlsafe_base64
  end

private

  def set_token
    if self.respond_to?(:token) and self.token.blank?
      self.token = self.generate_token
    end
  end

  def notify_invited
    if self.invited.present?
      InvitationMailer.invite_existing_user(self.id).deliver_later
    else
      InvitationMailer.invite_new_user(self.id).deliver_later
    end
  end

  def set_invited_by_email
    if self.invited.blank? && self.email.present?
      self.invited = User.where(email: self.email).first
    end
  end
end
