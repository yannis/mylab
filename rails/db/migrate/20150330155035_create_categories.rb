class CreateCategories < ActiveRecord::Migration
  def change
    create_table :categories do |t|
      t.string :name, index: true

      t.timestamps null: false
    end

    add_column :documents, :category_id, :string, index: true
  end
end
