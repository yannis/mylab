Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get :csrf, to: 'csrf#index'
      resources :documents
      resources :docxes, only: [:create]
      resources :pictures, only: [:index, :show, :create, :destroy]
      resources :attachments, only: [:index, :show, :create, :destroy]
      resources :versions
    end
  end
end
