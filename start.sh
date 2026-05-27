#!/bin/bash

# This script is used to deploy the application to the Kubernetes cluster using Helm.

# Check if the secret-values.yaml file exists
if [ ! -f "k8s/secret-values.yaml" ]; then
  echo "Missing k8s/secret-values.yaml. Please create the file and try again."
  exit 1
fi
