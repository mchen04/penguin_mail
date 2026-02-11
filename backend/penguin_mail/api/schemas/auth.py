from ninja import Schema


class LoginIn(Schema):
    email: str
    password: str


class TokenOut(Schema):
    access_token: str
    refresh_token: str
    expires_in: int
    token_type: str = "Bearer"


class RefreshIn(Schema):
    refresh_token: str


class RefreshOut(Schema):
    access_token: str
    expires_in: int
    token_type: str = "Bearer"


class SuccessOut(Schema):
    success: bool = True
