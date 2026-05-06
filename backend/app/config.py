from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    apify_token: str = ""
    apify_actor: str = "apidojo/tweet-scraper"

    operator_handle: str = "MTNNigeria"
    operator_name: str = "MTN Nigeria"

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    frontend_origin: str = "http://localhost:3000"
    database_url: str = "sqlite:///./orca.db"


settings = Settings()
