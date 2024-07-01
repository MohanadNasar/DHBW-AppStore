# Use a Node.js base image with LTS version (adjust version as needed)
FROM node:16

# Set the working directory
WORKDIR /app/backend

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Command to run the application
CMD ["node", "app.js"]
