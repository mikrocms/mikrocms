FROM node:20.4

# Accept build arguments
ARG GITHUB_USER
ARG GITHUB_TOKEN

# Set working directory
WORKDIR /home/node/app

# Allow to install package
RUN apt update -y

# Configure git credential.helper to store credentials in a file
RUN git config --global credential.helper store

# Create a .git-credentials file with GitHub login details
RUN echo "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com" > /root/.git-credentials

# Install node package
COPY app/package.json /home/node/app/package.json

RUN npm install

# Copy application source codes
COPY app /home/node/app

# Run entrypoint
RUN chmod +x /home/node/app/entrypoint.sh

ENTRYPOINT [ "/home/node/app/entrypoint.sh" ]

EXPOSE 8000
