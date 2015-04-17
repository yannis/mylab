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

User.destroy_all
10.times do |i|
  c = User.create id: i+1, name: Faker::Name.name, email: Faker::Internet.email, password: '123456789'
  p "User '#{c.name}' created"
end
User.first.update_attributes! name: 'yannis', email: 'yannis.jaquet@unige.ch'
p "User yannis created"

Group.destroy_all
10.times do |i|
  c = Group.create id: i+1, name: Faker::Company.name
  p "Group '#{c.name}' created"
end

Membership.destroy_all
20.times do |i|
  c = Membership.new id: i+1, user_id: rand(1..10), group_id: rand(1..10), role: ["basic", "admin"].sample
  if c.valid?
    c.save!
    p "Membership '#{c.id}' created"
  end
end

Category.destroy_all
10.times do |i|
  c = Category.create id: i+1, name: Faker::Company.name
  p "Category '#{c.name}' created"
end

Document.destroy_all
50.times do |i|
  d = Document.create id: i+1, name: Faker::Company.catch_phrase, category_id: rand(1..10)
  3.times do |j|
    created_at = rand_time
    d.versions.create id: "#{i+1}#{j+1}".to_i, content_md: Faker::Lorem.paragraph(3), content_html: Faker::Lorem.paragraph(3), created_at: created_at, updated_at: created_at+3.days
    p "version #{i}-#{j} created"
  end
  p "document #{i} created"
end

