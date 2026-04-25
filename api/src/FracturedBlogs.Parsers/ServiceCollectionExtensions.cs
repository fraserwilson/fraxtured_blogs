using FracturedBlogs.Parsers.Abstractions;
using FracturedBlogs.Parsers.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FracturedBlogs.Parsers;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddParsers(this IServiceCollection services)
    {
        services.AddScoped<IDocumentTextExtractor, DocumentTextExtractor>();
        return services;
    }
}
