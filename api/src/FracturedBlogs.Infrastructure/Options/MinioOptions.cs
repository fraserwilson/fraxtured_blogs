namespace FracturedBlogs.Infrastructure.Options;

public class MinioOptions
{
    public const string SectionName = "Minio";

    public string Endpoint { get; set; } = "localhost:9000";
    public string AccessKey { get; set; } = "minioadmin";
    public string SecretKey { get; set; } = "minioadmin";
    public bool UseSsl { get; set; }
    public string BucketName { get; set; } = "blogs";
    public string PublicBaseUrl { get; set; } = "http://localhost:9000";
}
