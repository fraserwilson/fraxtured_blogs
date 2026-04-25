namespace FracturedBlogs.Core.Entities;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public ICollection<BlogTag> BlogTags { get; set; } = [];
}
