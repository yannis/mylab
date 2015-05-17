class User < ActiveRecord::Base

  has_many :documents, inverse_of: :user, dependent: :delete_all
  has_many :memberships, inverse_of: :user, dependent: :delete_all
  has_many :groups, through: :memberships
  has_many :admin_memberships, ->{ where(role: 'admin') }, inverse_of: :user, class_name: "Membership", dependent: :delete_all
  has_many :admin_groups, through: :admin_memberships, source: :group
  has_many :invitations_as_inviter, class_name: "Invitation", foreign_key: "inviter_id", dependent: :destroy, inverse_of: :inviter
  has_many :invitations_as_invited, class_name: "Invitation", foreign_key: "invited_id", dependent: :destroy, inverse_of: :invited

  # Include default devise modules.
  devise :database_authenticatable, :recoverable, :rememberable, :trackable, :validatable, :lockable, lock_strategy: :none, unlock_strategy: :none#, :registerable

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  # devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable, :lockable, lock_strategy: :none, unlock_strategy: :none

  # before_validation :set_password
  before_create :ensure_authentication_token
  after_create :set_invitations

  validates :name, presence:  true, length:  {within:  3..100}
  # validates :email, length:  {within:  6..100} #validation made by Devise

  def ensure_authentication_token
    if self.authentication_token.blank?
      self.authentication_token = generate_authentication_token
    end
  end

  def self.active(activ)
    if activ == true
      where("users.locked_at IS NULL OR users.locked_at >= ?", Time.current)
    elsif activ == false
      where("users.locked_at < ?", Time.current)
    end
  end

  def self.interacting_with(user)
    joins(:memberships).where.not(id: user.id).where(memberships: {group_id: user.groups.map(&:id)})
  end

  def invitations
    # return self.invitations_as_inviter.merge(self.invitations_as_invited)
    return Invitation.where("inviter_id = ? OR invited_id = ?", self.id, self.id)
  end

  def accept!(invitation)
    invitation.accept!
  end

  def decline!(invitation)
    invitation.decline!
  end

  def admin_of_group?(group)
    self.memberships.admin.of_group(group).present?
  end

  def has_access_to?(document)
    (self.groups&document.groups).present?
  end

  def email=(value)
    write_attribute :email, (value ? value.downcase : nil)
  end

  def interacting_with?(user)
    User.interacting_with(self).include? user
  end

private

  def generate_authentication_token
    loop do
      token = Devise.friendly_token
      break token unless User.where(authentication_token: token).first
    end
  end

  # def set_password
  #   if self.password.blank?
  #     self.password = Devise.friendly_token
  #   end
  # end

  def set_invitations
    SetInvitationsForUserJob.perform_later(self.id)
  end
end
