namespace TodoApp.Api.Models;

public record SignUpRequest(string Email, string Password);

public record SignInRequest(string Email, string Password);

public record AuthResponse(string Token, string Email);
