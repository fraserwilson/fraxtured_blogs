namespace FracturedBlogs.Api.Contracts;

public sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

public sealed record BlogSummaryResponse(
    Guid Id,
    string Title,
    string Slug,
    string? Summary,
    string AuthorName,
    IReadOnlyList<string> Tags,
    DateTimeOffset CreatedAt,
    int ReadTimeMinutes);

public sealed record BlogDetailResponse(
    Guid Id,
    string Title,
    string Slug,
    string? Summary,
    string AuthorName,
    IReadOnlyList<string> Tags,
    string ContentText,
    DateTimeOffset CreatedAt,
    int ReadTimeMinutes,
    string Status);

public sealed record UploadBlogResponse(Guid Id, string Slug, string Status);
public sealed record SearchResponse(IReadOnlyList<BlogSummaryResponse> Items);
public sealed record AuthResponse(string AccessToken, string RefreshToken, DateTimeOffset ExpiresAt);
public sealed record TagResponse(string Name, string Slug, int PostCount);
