class AddCreatorIdAndUpdaterIdToVersions < ActiveRecord::Migration
  def change
    add_column :versions, :creator_id, :integer
    add_column :versions, :updater_id, :integer
    add_index :versions, :creator_id
    add_index :versions, :updater_id
  end
end
