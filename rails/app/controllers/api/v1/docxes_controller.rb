class API::V1::DocxesController < ApplicationController
  def create
    docx = Docx.new(sanitizer)
    md = docx.markdown
    render json: {docx: {markdown: md}}
  end

private

  def sanitizer
    params[:docx][:doc] = Upload.new(params[:docx][:doc]).convert
    params.require(:docx).permit(:doc)
  end
end
