using FracturedBlogs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FracturedBlogs.Infrastructure.Data.Configurations;

public class BlogTagConfiguration : IEntityTypeConfiguration<BlogTag>
{
    public void Configure(EntityTypeBuilder<BlogTag> builder)
    {
        builder.ToTable("blog_tags");

        builder.HasKey(x => new { x.BlogId, x.TagId });

        builder
            .HasOne(x => x.Blog)
            .WithMany(x => x.BlogTags)
            .HasForeignKey(x => x.BlogId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(x => x.Tag)
            .WithMany(x => x.BlogTags)
            .HasForeignKey(x => x.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
