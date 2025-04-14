#!/bin/sh
set -e

# Create or update .env file with environment variables from CapRover
# This will ensure all environment variables are properly passed to the application

# Start with a clean .env file
echo "# Generated .env file from environment variables" > .env

# Add all environment variables to .env file
# Special handling for DB_* variables that CapRover may provide
if [ ! -z "$DB_HOST" ]; then
  echo "DB_HOST=$DB_HOST" >> .env
fi

if [ ! -z "$DB_PORT" ]; then
  echo "DB_PORT=$DB_PORT" >> .env
fi

if [ ! -z "$DB_NAME" ]; then
  echo "DB_NAME=$DB_NAME" >> .env
fi

if [ ! -z "$DB_USER" ]; then
  echo "DB_USER=$DB_USER" >> .env
fi

if [ ! -z "$DB_PASSWORD" ]; then
  echo "DB_PASSWORD=$DB_PASSWORD" >> .env
fi

# Add other important environment variables
if [ ! -z "$PORT" ]; then
  echo "PORT=$PORT" >> .env
fi

if [ ! -z "$JWT_SECRET" ]; then
  echo "JWT_SECRET=$JWT_SECRET" >> .env
fi

if [ ! -z "$JWT_EXPIRE" ]; then
  echo "JWT_EXPIRE=$JWT_EXPIRE" >> .env
fi

if [ ! -z "$UPLOAD_PATH" ]; then
  echo "UPLOAD_PATH=$UPLOAD_PATH" >> .env
fi

if [ ! -z "$MAX_FILE_SIZE" ]; then
  echo "MAX_FILE_SIZE=$MAX_FILE_SIZE" >> .env
fi

# Add NODE_ENV if not already set
if [ -z "$NODE_ENV" ]; then
  echo "NODE_ENV=production" >> .env
else
  echo "NODE_ENV=$NODE_ENV" >> .env
fi

# Add any other environment variables that start with APP_
for var in $(env | grep "^APP_" | cut -d= -f1); do
  value=$(eval echo \$$var)
  echo "$var=$value" >> .env
done

# Log that we've set up the environment (without revealing sensitive values)
echo "Environment variables loaded to .env file"

# Run the application
exec npm start