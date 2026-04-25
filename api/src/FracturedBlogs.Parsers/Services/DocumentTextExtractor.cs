using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using A = DocumentFormat.OpenXml.Drawing;
using FracturedBlogs.Parsers.Abstractions;
using System.Text.RegularExpressions;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace FracturedBlogs.Parsers.Services;

public sealed class DocumentTextExtractor : IDocumentTextExtractor
{
    private static readonly Regex SectionHeadingRegex = new(@"^\d+(\.\d+){0,3}\s+\S+", RegexOptions.Compiled);

    public Task<DocumentParseResult> ExtractAsync(Stream stream, string fileName, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();

        var result = extension switch
        {
            ".pdf" => ExtractPdf(stream),
            ".docx" => ExtractDocx(stream),
            _ => throw new InvalidOperationException("Only .pdf and .docx are supported.")
        };

        var wordCount = CountWords(result.Text);
        var readTimeMinutes = Math.Max(1, (int)Math.Ceiling(wordCount / 220d));

        return Task.FromResult(new DocumentParseResult(result.Text, wordCount, readTimeMinutes, result.Images));
    }

    private static (string Text, IReadOnlyList<ExtractedImage> Images) ExtractPdf(Stream stream)
    {
        stream.Position = 0;
        using var document = PdfDocument.Open(stream);
        var content = new List<string>();
        var images = new List<ExtractedImage>();
        var imageSequence = 1;

        foreach (var page in document.GetPages())
        {
            if (!string.IsNullOrWhiteSpace(page.Text))
            {
                content.AddRange(ApplyPdfStyleHeuristics(page.Text));
            }

            foreach (var image in page.GetImages())
            {
                var extracted = CreateExtractedPdfImage(image, imageSequence);
                if (extracted is null)
                {
                    continue;
                }

                images.Add(extracted);
                content.Add($"{{{{img:{imageSequence}}}}}");
                imageSequence++;
            }
        }

        return (string.Join(Environment.NewLine + Environment.NewLine, content), images);
    }

    private static (string Text, IReadOnlyList<ExtractedImage> Images) ExtractDocx(Stream stream)
    {
        stream.Position = 0;
        using var document = WordprocessingDocument.Open(stream, false);
        var body = document.MainDocumentPart?.Document?.Body;
        if (body is null)
        {
            return (string.Empty, []);
        }

        var content = new List<string>();
        var images = new List<ExtractedImage>();
        var imageSequence = 1;

        foreach (var paragraph in body.Elements<Paragraph>())
        {
            var text = paragraph.InnerText?.Trim();
            if (!string.IsNullOrWhiteSpace(text))
            {
                content.Add(FormatDocxParagraph(paragraph, text));
            }

            foreach (var drawing in paragraph.Descendants<Drawing>())
            {
                var blip = drawing.Descendants<A.Blip>().FirstOrDefault();
                var relationshipId = blip?.Embed?.Value;
                if (string.IsNullOrWhiteSpace(relationshipId))
                {
                    continue;
                }

                if (document.MainDocumentPart?.GetPartById(relationshipId) is not ImagePart imagePart)
                {
                    continue;
                }

                using var imageStream = imagePart.GetStream();
                using var memoryStream = new MemoryStream();
                imageStream.CopyTo(memoryStream);

                var ext = GetExtensionFromContentType(imagePart.ContentType);
                var fileName = $"docx-image-{imageSequence}{ext}";

                images.Add(new ExtractedImage(
                    Sequence: imageSequence,
                    Bytes: memoryStream.ToArray(),
                    ContentType: imagePart.ContentType,
                    FileName: fileName,
                    AltText: $"Document image {imageSequence}"));

                content.Add($"{{{{img:{imageSequence}}}}}");
                imageSequence++;
            }
        }

        return (string.Join(Environment.NewLine + Environment.NewLine, content), images);
    }

    private static int CountWords(string text)
    {
        return text.Split([' ', '\n', '\r', '\t'], StringSplitOptions.RemoveEmptyEntries).Length;
    }

    private static string GetExtensionFromContentType(string contentType)
    {
        return contentType.ToLowerInvariant() switch
        {
            "image/png" => ".png",
            "image/jpeg" => ".jpg",
            "image/jpg" => ".jpg",
            "image/gif" => ".gif",
            "image/webp" => ".webp",
            "image/svg+xml" => ".svg",
            "image/bmp" => ".bmp",
            _ => ".bin"
        };
    }

    private static ExtractedImage? CreateExtractedPdfImage(IPdfImage image, int sequence)
    {
        if (image.TryGetPng(out var pngBytes) && pngBytes is { Length: > 0 })
        {
            return new ExtractedImage(
                Sequence: sequence,
                Bytes: pngBytes,
                ContentType: "image/png",
                FileName: $"pdf-image-{sequence}.png",
                AltText: $"PDF image {sequence}");
        }

        var raw = image.RawBytes?.ToArray();
        if (raw is not { Length: > 0 })
        {
            return null;
        }

        var isJpeg = raw.Length > 3 && raw[0] == 0xFF && raw[1] == 0xD8 && raw[2] == 0xFF;
        if (!isJpeg)
        {
            return null;
        }

        return new ExtractedImage(
            Sequence: sequence,
            Bytes: raw,
            ContentType: "image/jpeg",
            FileName: $"pdf-image-{sequence}.jpg",
            AltText: $"PDF image {sequence}");
    }

    private static string FormatDocxParagraph(Paragraph paragraph, string text)
    {
        var styleId = paragraph.ParagraphProperties?.ParagraphStyleId?.Val?.Value;
        if (string.IsNullOrWhiteSpace(styleId))
        {
            return text;
        }

        var normalized = styleId.Trim().ToLowerInvariant();

        if (normalized is "title")
        {
            return $"{{{{h1:{text}}}}}";
        }

        if (normalized is "subtitle")
        {
            return $"{{{{h2:{text}}}}}";
        }

        if (normalized.Contains("quote"))
        {
            return $"{{{{quote:{text}}}}}";
        }

        if (normalized.StartsWith("heading"))
        {
            var digits = new string(normalized.Where(char.IsDigit).ToArray());
            if (int.TryParse(digits, out var level))
            {
                var clamped = Math.Clamp(level, 1, 6);
                return $"{{{{h{clamped}:{text}}}}}";
            }

            return $"{{{{h2:{text}}}}}";
        }

        return text;
    }

    private static IEnumerable<string> ApplyPdfStyleHeuristics(string pageText)
    {
        var lines = pageText
            .Split('\n', StringSplitOptions.None)
            .Select(x => x.Trim())
            .Where(x => x.Length > 0)
            .ToList();

        foreach (var line in lines)
        {
            if (TryMapPdfHeading(line, out var headingMarker))
            {
                yield return headingMarker;
                continue;
            }

            if (TryMapPdfQuote(line, out var quoteMarker))
            {
                yield return quoteMarker;
                continue;
            }

            yield return line;
        }
    }

    private static bool TryMapPdfHeading(string line, out string marker)
    {
        marker = string.Empty;

        if (line.Length > 110)
        {
            return false;
        }

        if (SectionHeadingRegex.IsMatch(line))
        {
            var depth = line.TakeWhile(c => c != ' ').Count(c => c == '.');
            var level = Math.Clamp(depth + 2, 2, 5);
            marker = $"{{{{h{level}:{line}}}}}";
            return true;
        }

        var wordCount = CountWords(line);
        if (wordCount is 0 or > 12)
        {
            return false;
        }

        var looksLikeSentence = line.EndsWith('.') || line.EndsWith('!') || line.EndsWith('?');
        if (looksLikeSentence)
        {
            return false;
        }

        var upperRatio = line.Count(char.IsUpper) / (double)Math.Max(1, line.Count(char.IsLetter));
        if (upperRatio >= 0.7 && wordCount <= 8)
        {
            marker = $"{{{{h2:{line}}}}}";
            return true;
        }

        var titleCaseWords = line
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Count(w => w.Length > 1 && char.IsUpper(w[0]));
        var titleRatio = titleCaseWords / (double)Math.Max(1, wordCount);
        if (titleRatio >= 0.75 && wordCount <= 10)
        {
            marker = $"{{{{h3:{line}}}}}";
            return true;
        }

        return false;
    }

    private static bool TryMapPdfQuote(string line, out string marker)
    {
        marker = string.Empty;

        if (line.StartsWith("> "))
        {
            marker = $"{{{{quote:{line[2..].Trim()}}}}}";
            return true;
        }

        var isQuoted = (line.StartsWith('"') && line.EndsWith('"')) || (line.StartsWith('“') && line.EndsWith('”'));
        if (isQuoted && line.Length <= 320)
        {
            marker = $"{{{{quote:{line.Trim('\"', '“', '”')}}}}}";
            return true;
        }

        return false;
    }
}
