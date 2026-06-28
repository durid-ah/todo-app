namespace TodoApp.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Todo> Todos { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
