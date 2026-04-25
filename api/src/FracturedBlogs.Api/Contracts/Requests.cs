using Microsoft.AspNetCore.Mvc;

namespace FracturedBlogs.Api.Contracts;

public sealed class UploadBlogRequest
{
    [FromForm(Name = "title")]
    public required string Title { get; init; }

    [FromForm(Name = "summary")]
    public string? Summary { get; init; }

    [FromForm(Name = "tags")]
    public string? Tags { get; init; }

    [FromForm(Name = "file")]
    public required IFormFile File { get; init; }

    [FromForm(Name = "publishNow")]
    public string? PublishNow { get; init; }
}

public sealed record TogglePublishRequest(bool Publish);
public sealed record RegisterRequest(string Username, string Email, string Password);
public sealed record LoginRequest(string UsernameOrEmail, string Password);
public sealed record RefreshRequest(string RefreshToken);
