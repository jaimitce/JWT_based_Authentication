JWT_based_Authentication

For authentication we have different methods like Session ID, JWT, OpenID and OAuth.

In this project I have demonstrated code for JWT based Authentication in node js.

Concept will remain same irrespective of language.

If can prefer JWT over Session ID when we have more than one server and we do not want to send id/password again and again to different RESR endpoints.

In order to avoid Man In the Middle attach to steal your JWT token and calling API impersonate, we have to use SSL so that token will be encrypted.

If still somehow hacker has taken your JWT token, so in order to prevent that access, we have to use expiry time to invalidate that JWT token.
