namespace TodoApp.Api.Models;

public record SignUpRequest(string Email, string Password);

public record SignInRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);

public record AuthResponse(string Token, string RefreshToken, string Email);
