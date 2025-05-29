FROM mcr.microsoft.com/devcontainers/python:1-3.11

# Install uv from GitHub releases (or build from source if preferred)
RUN curl -sSf https://astral.sh/uv/install.sh | sh

# Optionally add uv to PATH if it's not global
ENV PATH="/root/.cargo/bin:$PATH"
