require 'rails_helper'

RSpec.describe Sharing, type: :model do
  describe "validation" do
    subject { create :sharing }
    it {is_expected.to belong_to :sharable}
    it {is_expected.to belong_to :group}
    it {is_expected.to validate_presence_of :sharable}
    it {is_expected.to validate_presence_of :group}
    it {is_expected.to validate_uniqueness_of(:group).scoped_to(:sharable_id, :sharable_type)}
  end
end
