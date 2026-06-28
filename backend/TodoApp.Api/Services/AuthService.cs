using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using TodoApp.Api.Data;
using TodoApp.Api.Models;

namespace TodoApp.Api.Services;

public enum AuthResultStatus
{
    Success,
    ValidationError,
    DuplicateEmail,
    InvalidCredentials,
}

public record AuthResult(AuthResultStatus Status, AuthResponse? Response = null, string? Error = null);

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;

    public AuthService(AppDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<AuthResult> SignUpAsync(string email, string password)
    {
        var validationError = ValidateCredentials(email, password);
        if (validationError is not null)
            return new AuthResult(AuthResultStatus.ValidationError, Error: validationError);

        var normalizedEmail = NormalizeEmail(email);

        var exists = await _db.Users.AnyAsync(u => u.Email == normalizedEmail);
        if (exists)
            return new AuthResult(AuthResultStatus.DuplicateEmail, Error: "Email is already registered.");

        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt = DateTime.UtcNow,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResult(AuthResultStatus.Success, _tokenService.CreateToken(user));
    }

    public async Task<AuthResult> SignInAsync(string email, string password)
    {
        var validationError = ValidateCredentials(email, password);
        if (validationError is not null)
            return new AuthResult(AuthResultStatus.ValidationError, Error: validationError);

        var normalizedEmail = NormalizeEmail(email);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return new AuthResult(AuthResultStatus.InvalidCredentials, Error: "Invalid email or password.");

        return new AuthResult(AuthResultStatus.Success, _tokenService.CreateToken(user));
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static string? ValidateCredentials(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email))
            return "Email is required.";

        if (!MailAddress.TryCreate(email.Trim(), out _))
            return "Email format is invalid.";

        if (string.IsNullOrWhiteSpace(password))
            return "Password is required.";

        if (password.Length < 8)
            return "Password must be at least 8 characters.";

        return null;
    }
}
