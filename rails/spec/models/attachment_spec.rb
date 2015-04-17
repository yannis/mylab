require 'rails_helper'

RSpec.describe Attachment, type: :model do
  describe "validation" do
    subject { create :attachment }
    it {is_expected.to belong_to :attachable}
  end
end
