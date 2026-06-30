using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TodoApp.Api.Configuration;
using TodoApp.Api.Data;
using TodoApp.Api.Models;
using TodoApp.Api.Services;

namespace TodoApp.Api.Tests.Services;

public class AuthServiceTests
{
    private static readonly JwtSettings TestJwtSettings = new()
    {
        Key = "TodoAppTestSecretKey_AtLeast32Characters!",
        Issuer = "TodoApp.Api.Tests",
        Audience = "TodoApp.Tests",
        ExpiresInMinutes = 60,
    };

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static AuthService CreateService(AppDbContext db) =>
        new(db, new TokenService(Options.Create(TestJwtSettings)));

    private static async Task SeedUserAsync(AppDbContext db, string email, string password)
    {
        db.Users.Add(new User
        {
            Email = email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task SignUpAsync_ReturnsValidationError_WhenEmailIsEmpty()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var result = await service.SignUpAsync("", "password123");

        Assert.Equal(AuthResultStatus.ValidationError, result.Status);
        Assert.Equal("Email is required.", result.Error);
        Assert.Empty(db.Users);
    }

    [Fact]
    public async Task SignUpAsync_ReturnsValidationError_WhenEmailIsInvalid()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var result = await service.SignUpAsync("not-an-email", "password123");

        Assert.Equal(AuthResultStatus.ValidationError, result.Status);
        Assert.Equal("Email format is invalid.", result.Error);
    }

    [Fact]
    public async Task SignUpAsync_ReturnsValidationError_WhenPasswordIsEmpty()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var result = await service.SignUpAsync("user@example.com", "   ");

        Assert.Equal(AuthResultStatus.ValidationError, result.Status);
        Assert.Equal("Password is required.", result.Error);
    }

    [Fact]
    public async Task SignUpAsync_ReturnsValidationError_WhenPasswordIsTooShort()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var result = await service.SignUpAsync("user@example.com", "short");

        Assert.Equal(AuthResultStatus.ValidationError, result.Status);
        Assert.Equal("Password must be at least 8 characters.", result.Error);
    }

    [Fact]
    public async Task SignUpAsync_ReturnsDuplicateEmail_WhenEmailAlreadyRegistered()
    {
        await using var db = CreateDbContext();
        await SeedUserAsync(db, "user@example.com", "password123");
        var service = CreateService(db);

        var result = await service.SignUpAsync("user@example.com", "password456");

        Assert.Equal(AuthResultStatus.DuplicateEmail, result.Status);
        Assert.Equal("Email is already registered.", result.Error);
        Assert.Single(db.Users);
    }

    [Fact]
    public async Task SignUpAsync_ReturnsSuccess_AndNormalizesEmail()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var result = await service.SignUpAsync("  User@Example.COM  ", "password123");

        Assert.Equal(AuthResultStatus.Success, result.Status);
        Assert.NotNull(result.Response);
        Assert.Equal("user@example.com", result.Response.Email);
        Assert.False(string.IsNullOrWhiteSpace(result.Response.Token));

        var user = await db.Users.SingleAsync();
        Assert.Equal("user@example.com", user.Email);
        Assert.True(BCrypt.Net.BCrypt.Verify("password123", user.PasswordHash));
    }

    [Fact]
    public async Task SignInAsync_ReturnsValidationError_WhenEmailIsInvalid()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var result = await service.SignInAsync("bad-email", "password123");

        Assert.Equal(AuthResultStatus.ValidationError, result.Status);
        Assert.Equal("Email format is invalid.", result.Error);
    }

    [Fact]
    public async Task SignInAsync_ReturnsInvalidCredentials_WhenUserNotFound()
    {
        await using var db = CreateDbContext();
        var service = CreateService(db);

        var result = await service.SignInAsync("user@example.com", "password123");

        Assert.Equal(AuthResultStatus.InvalidCredentials, result.Status);
        Assert.Equal("Invalid email or password.", result.Error);
    }

    [Fact]
    public async Task SignInAsync_ReturnsInvalidCredentials_WhenPasswordIsWrong()
    {
        await using var db = CreateDbContext();
        await SeedUserAsync(db, "user@example.com", "password123");
        var service = CreateService(db);

        var result = await service.SignInAsync("user@example.com", "wrongpassword");

        Assert.Equal(AuthResultStatus.InvalidCredentials, result.Status);
        Assert.Equal("Invalid email or password.", result.Error);
    }

    [Fact]
    public async Task SignInAsync_ReturnsSuccess_WithValidCredentials()
    {
        await using var db = CreateDbContext();
        await SeedUserAsync(db, "user@example.com", "password123");
        var service = CreateService(db);

        var result = await service.SignInAsync("  User@Example.COM  ", "password123");

        Assert.Equal(AuthResultStatus.Success, result.Status);
        Assert.NotNull(result.Response);
        Assert.Equal("user@example.com", result.Response.Email);
        Assert.False(string.IsNullOrWhiteSpace(result.Response.Token));
    }
}
