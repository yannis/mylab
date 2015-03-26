require 'rails_helper'

RSpec.describe Version, type: :model do
  it {is_expected.to belong_to :document}
  it {is_expected.to validate_presence_of :content_md}
  it {is_expected.to validate_presence_of :name}
  it {is_expected.to validate_uniqueness_of :name}
  # it {is_expected.to validate_presence_of :content_html}
end
