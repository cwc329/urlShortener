# Stage 1: Build stage
FROM python:3.13-slim AS builder

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  gcc \
  libpq-dev \
  curl \
  pkg-config \
  python3-dev \
  default-libmysqlclient-dev \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 - \
  && mv /root/.local/bin/poetry /usr/local/bin/

# Copy Poetry files
COPY pyproject.toml poetry.lock ./

# Configure Poetry to avoid creating a virtual environment
RUN poetry config virtualenvs.create false \
  && poetry install --only main --no-interaction --no-ansi

# Stage 2: Production stage
FROM python:3.13-slim

# Set the working directory
WORKDIR /app

# Install system dependencies (minimal)
RUN apt-get update && apt-get install -y --no-install-recommends \
  libpq-dev \
  pkg-config \
  python3-dev \
  default-libmysqlclient-dev \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Copy application files
COPY . .

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create a non-root user for security
RUN useradd -m myuser
USER myuser

# Expose port
EXPOSE 8000
