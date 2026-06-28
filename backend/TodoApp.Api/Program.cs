using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TodoApp.Api.Configuration;
using TodoApp.Api.Data;
using TodoApp.Api.Models;
using TodoApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT settings are not configured.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/auth/signup", async (SignUpRequest request, AuthService authService) =>
{
    var result = await authService.SignUpAsync(request.Email, request.Password);

    return result.Status switch
    {
        AuthResultStatus.Success => Results.Created("/api/auth/signin", result.Response),
        AuthResultStatus.ValidationError => Results.BadRequest(new { error = result.Error }),
        AuthResultStatus.DuplicateEmail => Results.Conflict(new { error = result.Error }),
        _ => Results.Problem(),
    };
});

app.MapPost("/api/auth/signin", async (SignInRequest request, AuthService authService) =>
{
    var result = await authService.SignInAsync(request.Email, request.Password);

    return result.Status switch
    {
        AuthResultStatus.Success => Results.Ok(result.Response),
        AuthResultStatus.ValidationError => Results.BadRequest(new { error = result.Error }),
        AuthResultStatus.InvalidCredentials => Results.Unauthorized(),
        _ => Results.Problem(),
    };
});

app.MapGet("/api/todos", async (AppDbContext db) =>
    Results.Ok(await db.Todos.OrderByDescending(t => t.CreatedAt).ToListAsync()));

app.MapGet("/api/todos/{id}", async (int id, AppDbContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    return todo is null ? Results.NotFound() : Results.Ok(todo);
});

app.MapPost("/api/todos", async (CreateTodoRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
        return Results.BadRequest(new { error = "Title is required." });

    var todo = new Todo
    {
        Title = request.Title.Trim(),
        CreatedAt = DateTime.UtcNow
    };

    db.Todos.Add(todo);
    await db.SaveChangesAsync();

    return Results.Created($"/api/todos/{todo.Id}", todo);
});

app.MapPut("/api/todos/{id}", async (int id, UpdateTodoRequest request, AppDbContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null)
        return Results.NotFound();

    if (string.IsNullOrWhiteSpace(request.Title))
        return Results.BadRequest(new { error = "Title is required." });

    todo.Title = request.Title.Trim();
    todo.IsCompleted = request.IsCompleted;
    await db.SaveChangesAsync();

    return Results.Ok(todo);
});

app.MapDelete("/api/todos/{id}", async (int id, AppDbContext db) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo is null)
        return Results.NotFound();

    db.Todos.Remove(todo);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();
