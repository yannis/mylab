# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

require "faker"

def rand_time
  Time.at(0.0 + rand * (4.days.ago.to_f - 0.0.to_f))
end

User.delete_all
10.times do |i|
  c = User.create! name: Faker::Name.name, email: Faker::Internet.email, password: "123456789"
  p "User '#{c.name}' created"
end
User.first.update_attributes! name: 'yannis', email: 'yannis.jaquet@unige.ch', admin: false, password: "123456789"
p "User yannis created"

Group.delete_all
20.times do |i|
  c = Group.create! name: Faker::Company.name
  p "Group '#{c.name}' created"
end

Membership.delete_all
20.times do |i|
  c = Membership.new user_id: User.all.sample.id, group_id: Group.all.sample.id, role: ["basic", "admin"].sample
  if c.valid?
    c.save!
    p "Membership '#{c.id}' created"
  end
end

Category.delete_all
10.times do |i|
  c = Category.create! name: Faker::Company.name
  p "Category '#{c.name}' created"
end

Document.delete_all
50.times do |i|
  user = User.all.sample
  d = Document.create! name: Faker::Company.catch_phrase, category_id: Category.all.sample.id, user_id: user.id
  3.times do |j|
    created_at = rand_time
    d.versions.create! content_md: Faker::Lorem.paragraph(3), content_html: Faker::Lorem.paragraph(3), creator_id: user.id, updater_id: user.id, created_at: created_at, updated_at: created_at+3.days
    p "version #{i}-#{j} created"
  end
  begin
    d.sharings.create! group_id: user.groups.all.sample.id
  rescue
    p "no groups to share document with"
  end
  p "document #{i} created"
end

