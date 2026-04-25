using FracturedBlogs.Infrastructure.Options;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace FracturedBlogs.Api.Services;

public sealed class MinioObjectStorageService(IOptions<MinioOptions> options) : IObjectStorageService
{
    private readonly MinioOptions _options = options.Value;

    public async Task<string> UploadAsync(Stream stream, string contentType, string fileName, CancellationToken cancellationToken = default)
    {
        var objectKey = $"{DateTimeOffset.UtcNow:yyyy/MM}/{Guid.NewGuid():N}-{fileName}";
        var client = CreateClient();

        await EnsureBucketExistsAsync(client, cancellationToken);

        stream.Position = 0;
        await client.PutObjectAsync(new PutObjectArgs()
            .WithBucket(_options.BucketName)
            .WithObject(objectKey)
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithContentType(contentType), cancellationToken);

        return objectKey;
    }

    public async Task<string> GetDownloadUrlAsync(string key, CancellationToken cancellationToken = default)
    {
        var internalClient = CreateClient();
        await EnsureBucketExistsAsync(internalClient, cancellationToken);
        var presignClient = CreatePresignClient();

        return await presignClient.PresignedGetObjectAsync(new PresignedGetObjectArgs()
            .WithBucket(_options.BucketName)
            .WithObject(key)
            .WithExpiry(15 * 60));
    }

    private IMinioClient CreateClient() => new MinioClient()
        .WithEndpoint(_options.Endpoint)
        .WithCredentials(_options.AccessKey, _options.SecretKey)
        .WithSSL(_options.UseSsl)
        .Build();

    private async Task EnsureBucketExistsAsync(IMinioClient client, CancellationToken cancellationToken)
    {
        var exists = await client.BucketExistsAsync(new BucketExistsArgs().WithBucket(_options.BucketName), cancellationToken);
        if (!exists)
        {
            await client.MakeBucketAsync(new MakeBucketArgs().WithBucket(_options.BucketName), cancellationToken);
        }
    }

    private IMinioClient CreatePresignClient()
    {
        if (!Uri.TryCreate(_options.PublicBaseUrl, UriKind.Absolute, out var publicUri))
        {
            return CreateClient();
        }

        var endpoint = publicUri.IsDefaultPort ? publicUri.Host : $"{publicUri.Host}:{publicUri.Port}";
        return new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(_options.AccessKey, _options.SecretKey)
            .WithSSL(publicUri.Scheme.Equals("https", StringComparison.OrdinalIgnoreCase))
            .Build();
    }
}
