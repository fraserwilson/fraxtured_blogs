using System.Text;
using System.Text.RegularExpressions;

namespace FracturedBlogs.Api.Services;

public sealed class SlugGenerator : ISlugGenerator
{
    public string Generate(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return Guid.NewGuid().ToString("n");
        }

        var lowered = title.Trim().ToLowerInvariant();
        var builder = new StringBuilder();

        foreach (var ch in lowered)
        {
            builder.Append(char.IsLetterOrDigit(ch) ? ch : '-');
        }

        var slug = Regex.Replace(builder.ToString(), "-+", "-").Trim('-');
        return string.IsNullOrWhiteSpace(slug) ? Guid.NewGuid().ToString("n") : slug;
    }
}
