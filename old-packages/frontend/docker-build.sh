#!/bin/bash
set -e

# Build the Docker image
docker build -t bellyfed:latest .

echo "Docker build completed successfully!"
