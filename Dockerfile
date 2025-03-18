# Step 1: Use the official Node.js image as the base image
FROM node:22 AS build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the app's source code to the container
COPY . .

# Step 6: Build the React app for production
RUN npm run build

# Step 7: Use a lightweight web server to serve the built app
FROM nginx:alpine

# Step 8: Copy the build folder from the previous step into the nginx folder
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose the default nginx port
EXPOSE 80

# Step 10: Run nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]

