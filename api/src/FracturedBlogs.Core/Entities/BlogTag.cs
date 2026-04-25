namespace FracturedBlogs.Core.Entities;

public class BlogTag
{
    public Guid BlogId { get; set; }
    public Blog Blog { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
