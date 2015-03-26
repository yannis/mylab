class Version < ActiveRecord::Base
  belongs_to :document

  validates_presence_of :content_md
  validates_presence_of :name
  validates_uniqueness_of :name, scope: :document_id

  before_save :set_html
  before_validation :set_name

private

  def set_html
    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML, autolink: true, tables: true)
    self.content_html = markdown.render(self.content_md)
  end

  def set_name
    if self.name.blank?
      max = self.document.versions.map{|v| v.name.to_i}.max.presence || 0
      self.name = (max+1).to_s
    end
  end
end
