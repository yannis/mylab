module GetModelPermissions

  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def get_model_permissions_and(*atrrs)
      include InstanceMethods
      attributes(*(atrrs+[:readable, :updatable, :destroyable]))
    end
  end

  module InstanceMethods
    def readable
      Ability.new(scope).can? :read, object
    end

    def updatable
      Ability.new(scope).can? :update, object
    end

    def destroyable
      Ability.new(scope).can? :destroy, object
    end

  private

    def current_ability
      return Ability.new(scope)
    end
  end
end

ActiveModel::Serializer.send(:include, GetModelPermissions) if ActiveModel
