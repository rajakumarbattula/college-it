FROM ghcr.io/astral-sh/uv:0.5-python3.12-alpine AS development

WORKDIR /app

COPY pyproject.toml ./
RUN uv sync --no-install-project

COPY . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM development AS production

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
