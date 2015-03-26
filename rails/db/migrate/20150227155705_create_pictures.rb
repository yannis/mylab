class CreatePictures < ActiveRecord::Migration
  def change
    create_table :pictures do |t|
      t.string :picturable_type, null: false
      t.integer :picturable_id, null: false
      t.string :image, null: false

      t.timestamps null: false
    end

    add_index :pictures, [:picturable_type, :picturable_id]

  end
end

