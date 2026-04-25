namespace FracturedBlogs.Parsers.Abstractions;

public interface IDocumentTextExtractor
{
    Task<DocumentParseResult> ExtractAsync(Stream stream, string fileName, CancellationToken cancellationToken = default);
}
