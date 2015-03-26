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

Document.destroy_all
50.times do
  d = Document.create name: Faker::Company.catch_phrase
  3.times do
    created_at = rand_time
    d.versions.create content_md: Faker::Lorem.paragraph(3), content_html: Faker::Lorem.paragraph(3), created_at: created_at, updated_at: created_at+3.days
  end
end
