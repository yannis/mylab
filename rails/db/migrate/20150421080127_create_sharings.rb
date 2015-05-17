class CreateSharings < ActiveRecord::Migration
  def change
    create_table :sharings do |t|
      t.belongs_to :sharable, polymorphic: true, index: true
      t.belongs_to :group, index: true

      t.timestamps null: false
    end
  end
end
