class API::V1::DocxesController < ApplicationController
  def create
    docx = Docx.new(sanitizer)
    md = docx.markdown
    render json: {docx: {markdown: md}}
  end


protected

  def convert_to_upload(attachment)
      attachment_data = split_base64(attachment[:data])

      temp_img_file = Tempfile.new("data_uri-upload")
      temp_img_file.binmode
      temp_img_file << Base64.decode64(attachment_data[:data])
      temp_img_file.rewind

      ActionDispatch::Http::UploadedFile.new({
        filename: attachment[:filename],
        type: attachment[:type],
        tempfile: temp_img_file
      })
  end

  def split_base64(uri_str)
      if uri_str.match(%r{^data:(.*?);(.*?),(.*)$})
          uri = Hash.new
          uri[:type] = $1 # "attachment/gif"
          uri[:encoder] = $2 # "base64"
          uri[:data] = $3 # data string
          uri[:extension] = $1.split('/')[1] # "gif"
          return uri
      end
  end


private

  def sanitizer
    params[:docx][:doc] = convert_to_upload(params[:docx][:doc])
    params.require(:docx).permit(:doc)
  end
end
