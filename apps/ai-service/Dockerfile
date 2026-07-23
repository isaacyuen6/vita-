FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN useradd --create-home --uid 10001 vita
WORKDIR /app
COPY pyproject.toml ./
RUN pip install --no-cache-dir .
COPY src ./src
USER vita
ENV PYTHONPATH=/app/src
EXPOSE 8000
CMD ["uvicorn", "vita_ai_service.main:app", "--host", "0.0.0.0", "--port", "8000"]
