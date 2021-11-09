# https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_user_pool
resource "aws_cognito_user_pool" "user_pool" {
  name = "${var.env}-user-pool"

  account_recovery_setting {
    # Allow the user to recover their account using their verified email
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  auto_verified_attributes = [
    "email"
  ]

  device_configuration {
    challenge_required_on_new_device      = false
    device_only_remembered_on_user_prompt = false
  }

  mfa_configuration = "OPTIONAL"

  password_policy {
    # The user's password must be at least 12 characters long.
    minimum_length                   = 12
    require_lowercase                = false
    require_numbers                  = false
    require_symbols                  = false
    require_uppercase                = false
    # When a user is added by an admin, the generated temporary password is
    # valid for 7 days only.
    temporary_password_validity_days = 7
  }

  # Country, custom attribute.
  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "country"
    required                 = false
    string_attribute_constraints {
      max_length = "256"
      min_length = "1"
    }
  }

  # Email attribute.
  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true
    string_attribute_constraints {
      max_length = "2048"
      min_length = "0"
    }
  }

  # Name attribute.
  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "name"
    required                 = true
    string_attribute_constraints {
      max_length = "2048"
      min_length = "0"
    }
  }

  software_token_mfa_configuration {
    enabled = true
  }

  # Use `email` as the username attribute.
  username_attributes = [
    "email"
  ]

  # usernames are case insensitive
  username_configuration {
    case_sensitive = false
  }
}

resource "aws_cognito_user_pool_client" "user_pool_web_client" {
  name = "${var.env}-web-client"

  user_pool_id = aws_cognito_user_pool.user_pool.id

  supported_identity_providers = ["COGNITO"]

  allowed_oauth_flows_user_pool_client = false

  access_token_validity  = 1
  id_token_validity      = 1
  refresh_token_validity = 30
  token_validity_units {
    access_token  = "days"
    id_token      = "days"
    refresh_token = "days"
  }

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_ADMIN_USER_PASSWORD_AUTH"
  ]

  generate_secret = false

  prevent_user_existence_errors = "ENABLED"

  read_attributes = [
    "custom:country",
    "email",
    "email_verified",
    "name",
  ]

  write_attributes = [
    "custom:country",
    "email",
    "name",
  ]
}
