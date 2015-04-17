class CreateMemberships < ActiveRecord::Migration
  def change
    create_table :memberships do |t|
      t.belongs_to :user, null: false
      t.belongs_to :group, null: false
      t.string :role, null: false, default: 'basic'

      t.timestamps null: false
    end
    add_index :memberships, :user_id
    add_index :memberships, :group_id
    add_index :memberships, :role
  end
end
