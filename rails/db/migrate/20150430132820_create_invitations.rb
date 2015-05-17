class CreateInvitations < ActiveRecord::Migration
  def change
    create_table :invitations do |t|
      t.integer :inviter_id, index: true, null: false
      t.integer :invited_id, index: true
      t.belongs_to :group, index: true
      t.string :email
      t.string :state
      t.datetime :state_at
      t.string :token

      t.timestamps null: false
    end
  end
end
