using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApp.Api.Data;
using TodoApp.Api.Extensions;
using TodoApp.Api.Models;

namespace TodoApp.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/todos")]
public class TodosController : ControllerBase
{
    private readonly AppDbContext _db;

    public TodosController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();
        var todos = await _db.Todos
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
        return Ok(todos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.GetUserId();
        var todo = await _db.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        return todo is null ? NotFound() : Ok(todo);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTodoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Title is required." });

        var userId = User.GetUserId();
        var todo = new Todo
        {
            Title = request.Title.Trim(),
            CreatedAt = DateTime.UtcNow,
            UserId = userId,
        };

        _db.Todos.Add(todo);
        await _db.SaveChangesAsync();

        return Created($"/api/todos/{todo.Id}", todo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTodoRequest request)
    {
        var userId = User.GetUserId();
        var todo = await _db.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (todo is null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(new { error = "Title is required." });

        todo.Title = request.Title.Trim();
        todo.IsCompleted = request.IsCompleted;
        await _db.SaveChangesAsync();

        return Ok(todo);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        var todo = await _db.Todos.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
        if (todo is null)
            return NotFound();

        _db.Todos.Remove(todo);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
