# Follow the instructions to set up an S3 backend for Terraform
# here https://www.terraform.io/docs/language/settings/backends/s3.html
terraform {
  backend "s3" {
    bucket  = "demo-react-cognito"
    key     = "tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
