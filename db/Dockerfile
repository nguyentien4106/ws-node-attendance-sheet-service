# Use the official PostgreSQL image
FROM postgres

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=Ti100600@
ENV POSTGRES_DB=attdb

# Copy the initialization script and backup file into the container
COPY ./restore.sh /docker-entrypoint-initdb.d/restore.sh
COPY ./backup.sql /docker-entrypoint-initdb.d/backup.sql

# Make sure the script is executable
RUN chmod +x /docker-entrypoint-initdb.d/restore.sh

# Expose PostgreSQL port
EXPOSE 5432