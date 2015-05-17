require 'sidekiq/web'
Rails.application.routes.draw do

  namespace :api do
    namespace :v1 do
      devise_for :users, controllers: {
        sessions: 'api/v1/sessions',
        passwords: 'api/v1/passwords'
      }

      # mount_devise_token_auth_for 'User', at: 'users', skip: [:omniauth_callbacks], controllers: {
      #   sessions: 'api/v1/sessions',
      # }

      get :csrf, to: 'csrf#index'
      post :empty_db, to: 'documents#empty_db'
      resources :attachments, only: [:index, :show, :create, :destroy]
      resources :categories, only: [:index, :show, :create, :update, :destroy]
      resources :documents, only: [:index, :show, :create, :update, :destroy]
      resources :docxes, only: [:create]
      resources :groups, only: [:index, :show, :create, :update, :destroy]
      resources :invitations, only: [:index, :show, :create, :destroy] do
        member do
          put :accept
          put :decline
          post :create_user
        end
      end
      resources :memberships, only: [:index, :show, :create, :update, :destroy]
      resources :pictures, only: [:index, :show, :create, :destroy]
      resources :sharings, only: [:index, :show, :create, :destroy]
      resources :users, only: [:index, :show, :create, :update, :destroy]
      resources :versions, only: [:index, :show, :create, :update, :destroy] do
        member do
          get :show_pdf
        end
      end
    end
  end

  if Rails.env.production?
    Sidekiq::Web.use Rack::Auth::Basic do |username, password|
      username == ENV["SIDEKIQ_USERNAME"] && password == ENV["SIDEKIQ_PASSWORD"]
    end
  end
  mount Sidekiq::Web, at: "/sidekiq"
end

 #   constraints :subdomain => "api" do
 #        api_version(:module => "V1", :path => {:value => "v1"}, :defaults => {:format => :json} ) do
 #            mount_devise_token_auth_for 'User', at: 'auth', skip: [:omniauth_callbacks]
 #            resources :users, only: [:index, :show] do
 #                resources :circles, only: [:index, :show, :create, :update, :destroy], shallow: true
 #            end
 #        end
 #    end

 # constraints :subdomain => "api" do
 #       mount_devise_token_auth_for 'User', at: 'v1/auth', skip: [:omniauth_callbacks]
 #        api_version(:module => "V1", :path => {:value => "v1"}, :defaults => {:format => :json} ) do
 #            resources :users, only: [:index, :show] do
 #                resources :circles, only: [:index, :show, :create, :update, :destroy], shallow: true
 #            end
 #        end
 #    end
