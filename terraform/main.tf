module "cognito" {
  source         = "./modules/cognito"
  env            = var.env
  aws_region     = var.aws_region
  aws_account_id = var.aws_account_id
}
