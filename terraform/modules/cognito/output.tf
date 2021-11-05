# The id of the created Cognito user pool
output "user_pool_id" {
  value = aws_cognito_user_pool.user_pool.id
}

# The web client id of the Cognito user pool
output "user_pool_web_client_id" {
  value = aws_cognito_user_pool_client.user_pool_web_client.id
}
