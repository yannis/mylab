require 'rails_helper'

RSpec.describe Picture, type: :model do
  describe "validation" do
    subject { create :picture }
    it {is_expected.to belong_to :picturable}
  end
end
