class API::V1::InvitationSerializer < ActiveModel::Serializer
  include GetModelPermissions
  get_model_permissions_and :id, :email, :group_name, :inviter_name, :state, :state_at
  embed :ids
  has_one :inviter
  has_one :invited
  has_one :group

  def group_name
    object.group.name
  end
  def inviter_name
    object.inviter.name
  end
end
