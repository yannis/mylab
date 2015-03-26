class API::V1::VersionsController < ApplicationController

  respond_to :json

  def index
    @versions = Version.all
    respond_with @versions
  end

  def show
    @version = Version.find params[:id]
    respond_to do |format|
      format.json {
        render json: @version, serializer: API::V1::VersionSerializer
      }
      format.html
      format.pdf {
        render  pdf: "#{@version.document.id}_#{@version.id}"
        # # html = render_to_string(action: :show, template: '/app/pdfs/versions/show.pdf.haml')
        # pdf = WickedPdf.new.pdf_from_string(@version.content_html)
        # send_data(pdf,
        #   filename: "#{@version.document.id}_#{@version.id}",
        #   disposition: 'attachment'
        # )
      }
    end
  end

  def create
    @version = Version.new sanitizer
    if @version.save
      render json: @version, serializer: API::V1::VersionSerializer, status: :created
    else
      render json: {errors: @version.errors}, status: :unprocessable_entity
    end
  end

  def update
    @version = Version.find params[:id]
    if @version.update_attributes sanitizer
      render json: @version, serializer: API::V1::VersionSerializer, status: :created
    else
      render json: {errors: @version.errors}, status: :unprocessable_entity
    end
  end

  def destroy
    @version = Version.find params[:id]
    respond_with @version.destroy
  end

private

  def sanitizer
    params.require(:version).permit(:content_md, :content_html, :document_id)
    # if current_user.present?
    #   if current_user.admin?
    #     params.require(:user).permit!
    #   elsif current_user.member?
    #     params.require(:user).permit(:id, :name, :description)
    #   end
    # end
  end
end
