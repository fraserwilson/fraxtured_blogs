using FracturedBlogs.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FracturedBlogs.Infrastructure.Data.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Username).HasMaxLength(120).IsRequired();
        builder.Property(x => x.Token).HasMaxLength(500).IsRequired();

        builder.HasIndex(x => x.Token).IsUnique();
        builder.HasIndex(x => x.Username);
    }
}
