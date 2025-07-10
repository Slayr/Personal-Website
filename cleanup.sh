#!/bin/bash

# This script removes uploaded files and database files from the backend directory.
# WARNING: This will permanently delete the specified files and directories.
# Ensure you have backed up any important data before proceeding.

rm -rf backend/uploads backend/personal_website.db backend/personal_website.db-shm backend/personal_website.db-wal

echo "Cleanup complete: uploaded files and database removed."
