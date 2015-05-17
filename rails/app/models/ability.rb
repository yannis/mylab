class Ability
  include CanCan::Ability

  def initialize(user)
    # Define abilities for the passed in user here. For example:
    #
    #   user ||= User.new # guest user (not logged in)
    #   if user.admin?
    #     can :manage, :all
    #   else
    #     can :read, :all
    #   end

    user ||= User.new # guest user (not logged in)

    group_ids = user.groups.pluck(:id)
    admin_group_ids = user.admin_groups.pluck(:id)

    if user.admin?
        can :manage, :all
    else
      # categories
      can :read, Category
      can :create, Category
      # can :update, Category
      can :destroy, Category, {documents: {category_id: nil}}

      # documents
      can :read, Document, {user_id: user.id}
      can :read, Document, {groups: {id: group_ids}}
      can :create, Document, {user_id: user.id}

      can :update, Document, {user_id: user.id}
      can :update, Document, {groups: {id: admin_group_ids}}

      can :destroy, Document, {user_id: user.id}

      # groups
      # can :read, Group, {id: group_ids}
      can :read, Group, {id: group_ids}
      can :create, Group
      can :update, Group, {id: admin_group_ids}
      can :destroy, Group, {id: admin_group_ids}

      # invitations
      can [:read, :create, :destroy], Invitation, {inviter_id: user.id}
      can [:read, :destroy], Invitation, {group_id: admin_group_ids}
      can [:read], Invitation, {invited_id: user.id}
      can [:update], Invitation, {invited_id: user.id, state: nil}

      # memberships
      can :read, Membership, {group_id: group_ids}
      can :create, Membership, {group_id: admin_group_ids}
      can :update, Membership, {group_id: admin_group_ids}
      can :destroy, Membership, {group_id: admin_group_ids}

      # sharings
      can :read, Sharing, sharable: {user_id: user.id}
      can :read, Sharing, group: {memberships: {user_id: user.id}}
      can :create, Sharing
      can :destroy, Sharing, sharable: {user_id: user.id}

      # users
      can :read, User, id: user.id
      # can :create, User
      can :read, User, {memberships: {group_id: group_ids}}
      can :update, User, id: user.id

      # versions
      can :read, Version, {document: {user_id: user.id}}
      can :read, Version, {document: {groups: {id: group_ids}}}

      can :create, Version, {document: {user_id: user.id}}
      can :create, Version, {document: {groups: {id: admin_group_ids}}}

      can :update, Version, {document: {user_id: user.id}}
      can :update, Version, {document: {groups: {id: admin_group_ids}}}

      can :destroy, Version, {document: {user_id: user.id}}
      can :destroy, Version, {document: {groups: {id: admin_group_ids}}}
    end

    #
    # The first argument to `can` is the action you are giving the user
    # permission to do.
    # If you pass :manage it will apply to every action. Other common actions
    # here are :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on.
    # If you pass :all it will apply to every resource. Otherwise pass a Ruby
    # class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the
    # objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details:
    # https://github.com/CanCanCommunity/cancancan/wiki/Defining-Abilities
  end
end
