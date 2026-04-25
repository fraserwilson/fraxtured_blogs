using FracturedBlogs.Infrastructure.Data;
using FracturedBlogs.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace FracturedBlogs.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = ResolvePostgresConnectionString(configuration);

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.Configure<MinioOptions>(configuration.GetSection(MinioOptions.SectionName));
        services.Configure<RedisOptions>(configuration.GetSection(RedisOptions.SectionName));

        return services;
    }

    private static string ResolvePostgresConnectionString(IConfiguration configuration)
    {
        var configured =
            configuration.GetConnectionString("DefaultConnection") ??
            configuration["ConnectionStrings__DefaultConnection"] ??
            configuration["DATABASE_URL"];

        if (string.IsNullOrWhiteSpace(configured))
        {
            throw new InvalidOperationException(
                "PostgreSQL connection string is missing. Set ConnectionStrings__DefaultConnection or DATABASE_URL.");
        }

        var value = configured.Trim();
        if (value.StartsWith('<'))
        {
            throw new InvalidOperationException(
                "ConnectionStrings__DefaultConnection appears to be a placeholder value. Replace it with a real PostgreSQL connection string.");
        }

        // Railway commonly provides postgres:// style URLs.
        if (value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            if (!Uri.TryCreate(value, UriKind.Absolute, out var uri))
            {
                throw new InvalidOperationException("DATABASE_URL/connection string is not a valid PostgreSQL URI.");
            }

            var userInfoParts = uri.UserInfo.Split(':', 2);
            var username = userInfoParts.Length > 0 ? Uri.UnescapeDataString(userInfoParts[0]) : string.Empty;
            var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : string.Empty;
            var database = uri.AbsolutePath.Trim('/'); // /dbname

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.IsDefaultPort ? 5432 : uri.Port,
                Username = username,
                Password = password,
                Database = database
            };

            // Respect sslmode=require style flags when provided in URI query.
            var query = uri.Query.TrimStart('?');
            if (!string.IsNullOrWhiteSpace(query))
            {
                foreach (var pair in query.Split('&', StringSplitOptions.RemoveEmptyEntries))
                {
                    var kv = pair.Split('=', 2);
                    if (kv.Length != 2)
                    {
                        continue;
                    }

                    var key = Uri.UnescapeDataString(kv[0]).ToLowerInvariant();
                    var val = Uri.UnescapeDataString(kv[1]);
                    if (key == "sslmode" && Enum.TryParse<SslMode>(val, true, out var sslMode))
                    {
                        builder.SslMode = sslMode;
                    }
                }
            }

            return builder.ConnectionString;
        }

        return value;
    }
}
