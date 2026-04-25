using FracturedBlogs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FracturedBlogs.Infrastructure.Data.Configurations;

public class BlogConfiguration : IEntityTypeConfiguration<Blog>
{
    public void Configure(EntityTypeBuilder<Blog> builder)
    {
        builder.ToTable("blogs");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).HasMaxLength(200).IsRequired();
        builder.Property(x => x.Slug).HasMaxLength(240).IsRequired();
        builder.HasIndex(x => x.Slug).IsUnique();

        builder.Property(x => x.Summary).HasMaxLength(500);
        builder.Property(x => x.FileKey).HasMaxLength(512).IsRequired();
        builder.Property(x => x.AuthorName).HasMaxLength(120).IsRequired();
        builder.Property(x => x.ContentText).HasColumnType("text");

        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedAt);
    }
}
