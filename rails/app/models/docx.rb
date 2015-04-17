class Docx

  attr_accessor :doc, :markdown

  def initialize(attributes={})
    attributes = attributes.symbolize_keys
    @doc = attributes.fetch(:doc)
    @markdown = WordToMarkdown.new(@doc.path).to_s
  end
end
