class Docx

  attr_accessor :doc, :markdown


  def initialize(attributes={})
    @doc = attributes.fetch('doc')
    @markdown = WordToMarkdown.new(@doc.path).to_s
  end
end
