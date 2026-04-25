using FracturedBlogs.Core.Enums;

namespace FracturedBlogs.Core.Entities;

public class Blog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string ContentText { get; set; } = string.Empty;
    public string FileKey { get; set; } = string.Empty;
    public string AuthorName { get; set; } = "Fraser Wilson";
    public int WordCount { get; set; }
    public int ReadTimeMinutes { get; set; }
    public BlogStatus Status { get; set; } = BlogStatus.Draft;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? DeletedAt { get; set; }

    public ICollection<BlogTag> BlogTags { get; set; } = [];
}
