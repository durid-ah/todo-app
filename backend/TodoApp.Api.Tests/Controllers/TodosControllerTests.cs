using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.Api.Controllers;
using TodoApp.Api.Data;
using TodoApp.Api.Models;

namespace TodoApp.Api.Tests.Controllers;

public class TodosControllerTests
{
    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static TodosController CreateController(AppDbContext db, int userId)
    {
        var controller = new TodosController(db);
        var identity = new ClaimsIdentity(
            [new Claim(JwtRegisteredClaimNames.Sub, userId.ToString())],
            authenticationType: "Test");
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) },
        };
        return controller;
    }

    private static async Task SeedAsync(AppDbContext db, params Todo[] todos)
    {
        db.Todos.AddRange(todos);
        await db.SaveChangesAsync();
    }

    [Fact]
    public async Task GetAll_ReturnsOnlyCurrentUserTodos()
    {
        await using var db = CreateDbContext();
        await SeedAsync(db,
            new Todo { Id = 1, Title = "Mine", UserId = 1, CreatedAt = DateTime.UtcNow },
            new Todo { Id = 2, Title = "Theirs", UserId = 2, CreatedAt = DateTime.UtcNow });

        var controller = CreateController(db, userId: 1);
        var result = await controller.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result);
        var todos = Assert.IsAssignableFrom<IEnumerable<Todo>>(ok.Value).ToList();
        Assert.Single(todos);
        Assert.Equal("Mine", todos[0].Title);
    }

    [Fact]
    public async Task GetById_ReturnsTodo_WhenOwnedByCurrentUser()
    {
        await using var db = CreateDbContext();
        await SeedAsync(db,
            new Todo { Id = 1, Title = "Mine", UserId = 1, CreatedAt = DateTime.UtcNow });

        var controller = CreateController(db, userId: 1);
        var result = await controller.GetById(1);

        var ok = Assert.IsType<OkObjectResult>(result);
        var todo = Assert.IsType<Todo>(ok.Value);
        Assert.Equal("Mine", todo.Title);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenOwnedByAnotherUser()
    {
        await using var db = CreateDbContext();
        await SeedAsync(db,
            new Todo { Id = 1, Title = "Theirs", UserId = 2, CreatedAt = DateTime.UtcNow });

        var controller = CreateController(db, userId: 1);
        var result = await controller.GetById(1);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenTitleIsEmpty()
    {
        await using var db = CreateDbContext();
        var controller = CreateController(db, userId: 1);

        var result = await controller.Create(new CreateTodoRequest("   "));

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Create_ReturnsCreated_WithUserIdSet()
    {
        await using var db = CreateDbContext();
        var controller = CreateController(db, userId: 1);

        var result = await controller.Create(new CreateTodoRequest("  New todo  "));

        var created = Assert.IsType<CreatedResult>(result);
        var todo = Assert.IsType<Todo>(created.Value);
        Assert.Equal("New todo", todo.Title);
        Assert.Equal(1, todo.UserId);
        Assert.Equal($"/api/todos/{todo.Id}", created.Location);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenOwnedByAnotherUser()
    {
        await using var db = CreateDbContext();
        await SeedAsync(db,
            new Todo { Id = 1, Title = "Theirs", UserId = 2, CreatedAt = DateTime.UtcNow });

        var controller = CreateController(db, userId: 1);
        var result = await controller.Update(1, new UpdateTodoRequest("Updated", true));

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Update_ReturnsBadRequest_WhenTitleIsEmpty()
    {
        await using var db = CreateDbContext();
        await SeedAsync(db,
            new Todo { Id = 1, Title = "Mine", UserId = 1, CreatedAt = DateTime.UtcNow });

        var controller = CreateController(db, userId: 1);
        var result = await controller.Update(1, new UpdateTodoRequest("   ", false));

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task Update_ReturnsOk_WhenOwnedByCurrentUser()
    {
        await using var db = CreateDbContext();
        await SeedAsync(db,
            new Todo { Id = 1, Title = "Mine", UserId = 1, CreatedAt = DateTime.UtcNow });

        var controller = CreateController(db, userId: 1);
        var result = await controller.Update(1, new UpdateTodoRequest("  Updated  ", true));

        var ok = Assert.IsType<OkObjectResult>(result);
        var todo = Assert.IsType<Todo>(ok.Value);
        Assert.Equal("Updated", todo.Title);
        Assert.True(todo.IsCompleted);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenOwnedByAnotherUser()
    {
        await using var db = CreateDbContext();
        await SeedAsync(db,
            new Todo { Id = 1, Title = "Theirs", UserId = 2, CreatedAt = DateTime.UtcNow });

        var controller = CreateController(db, userId: 1);
        var result = await controller.Delete(1);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenOwnedByCurrentUser()
    {
        await using var db = CreateDbContext();
        await SeedAsync(db,
            new Todo { Id = 1, Title = "Mine", UserId = 1, CreatedAt = DateTime.UtcNow });

        var controller = CreateController(db, userId: 1);
        var result = await controller.Delete(1);

        Assert.IsType<NoContentResult>(result);
        Assert.Empty(db.Todos);
    }
}
