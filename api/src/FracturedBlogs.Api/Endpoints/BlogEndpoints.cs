using FracturedBlogs.Api.Contracts;
using FracturedBlogs.Api.Services;
using FracturedBlogs.Core.Entities;
using FracturedBlogs.Core.Enums;
using FracturedBlogs.Infrastructure.Data;
using FracturedBlogs.Parsers.Abstractions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace FracturedBlogs.Api.Endpoints;

public static class BlogEndpoints
{
    private static readonly Regex ImageKeyMarkerRegex = new(@"\{\{imgkey:(?<key>[^}]+)\}\}", RegexOptions.Compiled);

    public static RouteGroupBuilder MapBlogEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/blogs", GetBlogs);
        group.MapGet("/blogs/{slug}", GetBlogBySlug);
        group.MapPost("/blogs/upload", UploadBlog).DisableAntiforgery();
        group.MapPatch("/blogs/{id:guid}/publish", TogglePublish);
        group.MapDelete("/blogs/{id:guid}", SoftDelete);
        group.MapGet("/blogs/search", SearchBlogs);
        group.MapGet("/tags", GetTags);

        return group;
    }

    private static async Task<IResult> GetBlogs(
        [FromServices] AppDbContext db,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? tag = null,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.Blogs
            .AsNoTracking()
            .Include(b => b.BlogTags)
            .ThenInclude(bt => bt.Tag)
            .Where(b => b.DeletedAt == null && b.Status == BlogStatus.Published);

        if (!string.IsNullOrWhiteSpace(tag))
        {
            var normalizedTag = tag.Trim().ToLowerInvariant();
            query = query.Where(b => b.BlogTags.Any(bt => bt.Tag.Slug == normalizedTag));
        }

        var total = await query.CountAsync(cancellationToken);
        var blogs = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = blogs
            .Select(b => new BlogSummaryResponse(
                b.Id,
                b.Title,
                b.Slug,
                b.Summary,
                b.AuthorName,
                b.BlogTags.Select(x => x.Tag.Name).ToList(),
                b.CreatedAt,
                b.ReadTimeMinutes))
            .ToList();

        return Results.Ok(new PagedResponse<BlogSummaryResponse>(items, page, pageSize, total));
    }

    private static async Task<IResult> GetBlogBySlug(
        [FromServices] AppDbContext db,
        [FromServices] IObjectStorageService objectStorage,
        string slug,
        CancellationToken cancellationToken)
    {
        var post = await db.Blogs
            .AsNoTracking()
            .Include(b => b.BlogTags)
            .ThenInclude(bt => bt.Tag)
            .FirstOrDefaultAsync(b => b.Slug == slug && b.DeletedAt == null, cancellationToken);

        if (post is null)
        {
            return Results.NotFound();
        }

        var hydratedContent = await HydrateImageUrlsAsync(post.ContentText, objectStorage, cancellationToken);

        return Results.Ok(new BlogDetailResponse(
            post.Id,
            post.Title,
            post.Slug,
            post.Summary,
            post.AuthorName,
            post.BlogTags.Select(x => x.Tag.Name).ToList(),
            hydratedContent,
            post.CreatedAt,
            post.ReadTimeMinutes,
            post.Status.ToString().ToLowerInvariant()));
    }

    private static async Task<IResult> UploadBlog(
        [FromServices] AppDbContext db,
        [FromServices] IDocumentTextExtractor textExtractor,
        [FromServices] IObjectStorageService objectStorage,
        [FromServices] ISlugGenerator slugGenerator,
        [FromForm] UploadBlogRequest request,
        CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        if (extension is not ".pdf" and not ".docx")
        {
            return Results.BadRequest("Only .pdf and .docx files are supported.");
        }

        await using var stream = request.File.OpenReadStream();
        var parseResult = await textExtractor.ExtractAsync(stream, request.File.FileName, cancellationToken);
        stream.Position = 0;

        var fileKey = await objectStorage.UploadAsync(stream, request.File.ContentType, request.File.FileName, cancellationToken);

        var slug = slugGenerator.Generate(request.Title);
        var uniqueSlug = await EnsureUniqueSlugAsync(db, slug, cancellationToken);
        var publishNow = ShouldPublishNow(request.PublishNow);
        var contentWithImageKeys = await PersistExtractedImagesAsync(
            parseResult.Text,
            parseResult.Images,
            objectStorage,
            cancellationToken);

        var blog = new Blog
        {
            Title = request.Title.Trim(),
            Slug = uniqueSlug,
            Summary = string.IsNullOrWhiteSpace(request.Summary) ? null : request.Summary.Trim(),
            ContentText = contentWithImageKeys,
            FileKey = fileKey,
            WordCount = parseResult.WordCount,
            ReadTimeMinutes = parseResult.ReadTimeMinutes,
            Status = publishNow ? BlogStatus.Published : BlogStatus.Draft,
            AuthorName = "Fraser Wilson"
        };

        var tags = ParseTags(request.Tags);
        foreach (var tagName in tags)
        {
            var tagSlug = slugGenerator.Generate(tagName);
            var tag = await db.Tags.FirstOrDefaultAsync(t => t.Slug == tagSlug, cancellationToken);
            if (tag is null)
            {
                tag = new Tag { Name = tagName, Slug = tagSlug };
                db.Tags.Add(tag);
            }

            blog.BlogTags.Add(new BlogTag
            {
                Blog = blog,
                Tag = tag
            });
        }

        db.Blogs.Add(blog);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new UploadBlogResponse(blog.Id, blog.Slug, blog.Status.ToString().ToLowerInvariant()));
    }

    private static async Task<IResult> TogglePublish(
        [FromServices] AppDbContext db,
        Guid id,
        TogglePublishRequest request,
        CancellationToken cancellationToken)
    {
        var blog = await db.Blogs.FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null, cancellationToken);
        if (blog is null)
        {
            return Results.NotFound();
        }

        blog.Status = request.Publish ? BlogStatus.Published : BlogStatus.Draft;
        blog.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new { blog.Id, status = blog.Status.ToString().ToLowerInvariant() });
    }

    private static async Task<IResult> SoftDelete(
        [FromServices] AppDbContext db,
        Guid id,
        CancellationToken cancellationToken)
    {
        var blog = await db.Blogs.FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null, cancellationToken);
        if (blog is null)
        {
            return Results.NotFound();
        }

        blog.DeletedAt = DateTimeOffset.UtcNow;
        blog.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> SearchBlogs(
        [FromServices] AppDbContext db,
        [FromQuery] string q,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return Results.Ok(new SearchResponse([]));
        }

        var normalized = q.Trim().ToLowerInvariant();
        var blogs = await db.Blogs
            .AsNoTracking()
            .Include(b => b.BlogTags)
            .ThenInclude(bt => bt.Tag)
            .Where(b => b.DeletedAt == null && b.Status == BlogStatus.Published)
            .Where(b =>
                EF.Functions.ILike(b.Title, $"%{normalized}%") ||
                EF.Functions.ILike(b.ContentText, $"%{normalized}%"))
            .OrderByDescending(b => b.CreatedAt)
            .Take(20)
            .ToListAsync(cancellationToken);

        var items = blogs
            .Select(b => new BlogSummaryResponse(
                b.Id,
                b.Title,
                b.Slug,
                b.Summary,
                b.AuthorName,
                b.BlogTags.Select(x => x.Tag.Name).ToList(),
                b.CreatedAt,
                b.ReadTimeMinutes))
            .ToList();

        return Results.Ok(new SearchResponse(items));
    }

    private static async Task<IResult> GetTags([FromServices] AppDbContext db, CancellationToken cancellationToken)
    {
        var tags = await db.Tags
            .AsNoTracking()
            .OrderBy(t => t.Name)
            .Select(t => new TagResponse(
                t.Name,
                t.Slug,
                t.BlogTags.Count(bt => bt.Blog.DeletedAt == null && bt.Blog.Status == BlogStatus.Published)))
            .ToListAsync(cancellationToken);

        return Results.Ok(tags);
    }

    private static async Task<string> EnsureUniqueSlugAsync(AppDbContext db, string slug, CancellationToken cancellationToken)
    {
        var uniqueSlug = slug;
        var suffix = 2;

        while (await db.Blogs.AnyAsync(x => x.Slug == uniqueSlug, cancellationToken))
        {
            uniqueSlug = $"{slug}-{suffix++}";
        }

        return uniqueSlug;
    }

    private static IReadOnlyList<string> ParseTags(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return [];
        }

        return raw
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(x => x.Trim())
            .Where(x => x.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static bool ShouldPublishNow(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return true;
        }

        return raw.Trim().ToLowerInvariant() switch
        {
            "true" => true,
            "1" => true,
            "on" => true,
            "yes" => true,
            "y" => true,
            _ => false
        };
    }

    private static async Task<string> PersistExtractedImagesAsync(
        string content,
        IReadOnlyList<ExtractedImage> images,
        IObjectStorageService objectStorage,
        CancellationToken cancellationToken)
    {
        if (images.Count == 0)
        {
            return content;
        }

        var updatedContent = content;
        foreach (var image in images.OrderBy(x => x.Sequence))
        {
            await using var imageStream = new MemoryStream(image.Bytes);
            var key = await objectStorage.UploadAsync(imageStream, image.ContentType, image.FileName, cancellationToken);
            updatedContent = updatedContent.Replace($"{{{{img:{image.Sequence}}}}}", $"{{{{imgkey:{key}}}}}");
        }

        return updatedContent;
    }

    private static async Task<string> HydrateImageUrlsAsync(
        string content,
        IObjectStorageService objectStorage,
        CancellationToken cancellationToken)
    {
        var matches = ImageKeyMarkerRegex.Matches(content);
        if (matches.Count == 0)
        {
            return content;
        }

        var keys = matches
            .Select(x => x.Groups["key"].Value)
            .Distinct(StringComparer.Ordinal)
            .ToList();

        var urlsByKey = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var key in keys)
        {
            urlsByKey[key] = await objectStorage.GetDownloadUrlAsync(key, cancellationToken);
        }

        return ImageKeyMarkerRegex.Replace(content, m =>
        {
            var key = m.Groups["key"].Value;
            return urlsByKey.TryGetValue(key, out var url) ? $"{{{{imgurl:{url}}}}}" : string.Empty;
        });
    }
}
