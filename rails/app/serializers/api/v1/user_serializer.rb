class API::V1::UserSerializer < ActiveModel::Serializer
  include GetModelPermissions
  get_model_permissions_and :id, :name, :email, :can_create_category, :can_create_document, :can_create_group, :can_create_membership, :can_create_sharing, :can_create_user, :can_create_version

  embed :ids
  has_many :memberships
  has_many :documents
  has_many :invitations_as_inviter
  has_many :invitations_as_invited

  # def memberships
  #   return object.memberships.accessible_by current_ability, :read
  # end

  def can_create_category
    current_ability.can? :create, Category
  end

  def can_create_document
    current_ability.can? :create, Document
  end

  def can_create_group
    current_ability.can? :create, Group
  end

  def can_create_membership
    current_ability.can? :create, Membership
  end

  def can_create_sharing
    current_ability.can? :create, Sharing
  end

  def can_create_user
    current_ability.can? :create, User
  end

  def can_create_version
    current_ability.can? :create, Version
  end
end
