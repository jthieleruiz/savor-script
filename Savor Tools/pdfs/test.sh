#!/bin/bash

# Define the path to your CSV file
CSV_PATH="../output.csv"

# Skip the header row if your CSV has one by using `tail -n +2`
tail -n +2 "$CSV_PATH" | while IFS=, read -r _ _ dirName url _ 
do
  # Create a directory if it doesn't exist
  mkdir -p "$dirName"

  cd "$dirName" || exit

  # Use curl to download the PDF into the created directory
  # -O keeps the original file name
  echo "URL: $url"
  curl -b  "../../cookies.txt" -J -L -O "$url"
  cd "../"
done
