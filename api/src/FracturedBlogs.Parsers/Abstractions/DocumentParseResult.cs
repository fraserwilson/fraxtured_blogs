namespace FracturedBlogs.Parsers.Abstractions;

public sealed record ExtractedImage(
    int Sequence,
    byte[] Bytes,
    string ContentType,
    string FileName,
    string AltText);

public sealed record DocumentParseResult(
    string Text,
    int WordCount,
    int ReadTimeMinutes,
    IReadOnlyList<ExtractedImage> Images);
