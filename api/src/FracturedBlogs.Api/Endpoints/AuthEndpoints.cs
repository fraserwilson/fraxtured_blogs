using FracturedBlogs.Api.Contracts;
using FracturedBlogs.Core.Entities;
using FracturedBlogs.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FracturedBlogs.Api.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/auth/register", Register);
        group.MapPost("/auth/login", Login);
        group.MapPost("/auth/refresh", Refresh);

        return group;
    }

    private static IResult Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest("Username, email and password are required.");
        }

        return Results.Ok(new
        {
            message = "Auth is scaffolded. Replace this with ASP.NET Identity persistence before production."
        });
    }

    private static async Task<IResult> Login(AppDbContext db, LoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest("Username/email and password are required.");
        }

        var refreshToken = new RefreshToken
        {
            Username = request.UsernameOrEmail,
            Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
        };

        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new AuthResponse(
            AccessToken: $"dev-token-{Guid.NewGuid():N}",
            RefreshToken: refreshToken.Token,
            ExpiresAt: DateTimeOffset.UtcNow.AddMinutes(15)));
    }

    private static async Task<IResult> Refresh(AppDbContext db, RefreshRequest request, CancellationToken cancellationToken)
    {
        var token = await db.RefreshTokens.FirstOrDefaultAsync(x => x.Token == request.RefreshToken, cancellationToken);

        if (token is null || !token.IsActive)
        {
            return Results.Unauthorized();
        }

        token.RevokedAt = DateTimeOffset.UtcNow;

        var replacement = new RefreshToken
        {
            Username = token.Username,
            Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
        };

        db.RefreshTokens.Add(replacement);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new AuthResponse(
            AccessToken: $"dev-token-{Guid.NewGuid():N}",
            RefreshToken: replacement.Token,
            ExpiresAt: DateTimeOffset.UtcNow.AddMinutes(15)));
    }
}
