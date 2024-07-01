# Use an official Node.js image from the Docker Hub
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app/frontend

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build 

# Expose the port the app runs on
EXPOSE 80

# Install serve to serve the built application
RUN npm install -g serve

# Define the command to run the application
CMD ["serve", "-s", "dist", "-l", "80"]
