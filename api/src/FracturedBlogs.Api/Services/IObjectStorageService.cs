namespace FracturedBlogs.Api.Services;

public interface IObjectStorageService
{
    Task<string> UploadAsync(Stream stream, string contentType, string fileName, CancellationToken cancellationToken = default);
    Task<string> GetDownloadUrlAsync(string key, CancellationToken cancellationToken = default);
}
