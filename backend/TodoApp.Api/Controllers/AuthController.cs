using Microsoft.AspNetCore.Mvc;
using TodoApp.Api.Models;
using TodoApp.Api.Services;

namespace TodoApp.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        var result = await _authService.SignUpAsync(request.Email, request.Password);

        return result.Status switch
        {
            AuthResultStatus.Success => Created("/api/auth/signin", result.Response),
            AuthResultStatus.ValidationError => BadRequest(new { error = result.Error }),
            AuthResultStatus.DuplicateEmail => Conflict(new { error = result.Error }),
            _ => Problem(),
        };
    }

    [HttpPost("signin")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
    {
        var result = await _authService.SignInAsync(request.Email, request.Password);

        return result.Status switch
        {
            AuthResultStatus.Success => Ok(result.Response),
            AuthResultStatus.ValidationError => BadRequest(new { error = result.Error }),
            AuthResultStatus.InvalidCredentials => Unauthorized(),
            _ => Problem(),
        };
    }
}
