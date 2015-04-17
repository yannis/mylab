class User < ActiveRecord::Base

  has_many :memberships, inverse_of: :user, dependent: :destroy
  has_many :groups, through: :memberships

  # Include default devise modules.
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable, :lockable, lock_strategy: :none, unlock_strategy: :none

  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  # devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable, :lockable, lock_strategy: :none, unlock_strategy: :none

  before_save :ensure_authentication_token

  validates :name, presence:  true, length:  {within:  3..100}
  validates :email, presence:  true, uniqueness:  true, length:  {within:  6..100}

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

  def email=(value)
    write_attribute :email, (value ? value.downcase : nil)
  end

private

  def generate_authentication_token
    loop do
      token = Devise.friendly_token
      break token unless User.where(authentication_token: token).first
    end
  end
end
