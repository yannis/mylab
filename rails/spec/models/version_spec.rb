require 'rails_helper'

RSpec.describe Version, type: :model do

  it {is_expected.to belong_to :document}
  it {is_expected.to belong_to :creator}
  it {is_expected.to belong_to :updater}


  describe "validation" do
    subject { create :version }
    it {is_expected.to belong_to :document}
    it {is_expected.to validate_presence_of :content_md}
    # it {is_expected.to validate_presence_of :name} # untestable sinc name is set in before validation callback
    it {is_expected.to validate_uniqueness_of(:name).scoped_to :document_id}
  end

  describe "name is set before validation" do
    subject { create :version, name: nil }
    it {expect(subject.name).to eql "1"}
  end

  describe "content_html is set before validation" do
    subject { create :version, content_md: "This is some content" }
    it {expect(subject.content_html).to eql "<p>This is some content</p>\n"}
  end
end
