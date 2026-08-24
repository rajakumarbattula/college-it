FROM ghcr.io/astral-sh/uv:0.5-python3.12-alpine AS development

WORKDIR /app
ENV UV_PROJECT_ENVIRONMENT=/opt/venv

COPY pyproject.toml ./
RUN uv sync --no-install-project

COPY . .
RUN chmod +x /app/scripts/start.sh

EXPOSE 8000

CMD ["/app/scripts/start.sh"]

FROM development AS production

CMD ["/app/scripts/start.sh"]
