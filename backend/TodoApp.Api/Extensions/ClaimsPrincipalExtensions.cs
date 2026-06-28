using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TodoApp.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (sub is null)
            throw new UnauthorizedAccessException();

        return int.Parse(sub);
    }
}
