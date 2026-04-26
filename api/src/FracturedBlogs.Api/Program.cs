using FracturedBlogs.Api.Endpoints;
using FracturedBlogs.Api.Services;
using FracturedBlogs.Infrastructure;
using FracturedBlogs.Infrastructure.Data;
using FracturedBlogs.Parsers;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddParsers();

builder.Services.AddScoped<ISlugGenerator, SlugGenerator>();
builder.Services.AddScoped<IObjectStorageService, MinioObjectStorageService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(_ =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: "global",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 180,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddFixedWindowLimiter("uploads", limiterOptions =>
    {
        limiterOptions.PermitLimit = 10;
        limiterOptions.Window = TimeSpan.FromMinutes(10);
        limiterOptions.QueueLimit = 0;
    });
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 50 * 1024 * 1024;
});

var allowedCorsOrigins = builder.Configuration
    .GetValue<string>("Cors:AllowedOrigins")?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Where(origin => Uri.TryCreate(origin, UriKind.Absolute, out _))
    .ToArray()
    ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("web", policy =>
    {
        if (allowedCorsOrigins.Length == 0)
        {
            policy
                .WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod();
            return;
        }

        policy
            .WithOrigins(allowedCorsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(context =>
    {
        var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (exceptionFeature?.Error is not null)
        {
            app.Logger.LogError(exceptionFeature.Error, "Unhandled exception");
        }

        return Results.Problem(
            title: "An unexpected server error occurred.",
            statusCode: StatusCodes.Status500InternalServerError).ExecuteAsync(context);
    });
});

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseCors("web");
app.UseRateLimiter();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/health", () => Results.Ok(new { ok = true, service = "FracturedBlogs.Api" }));

var api = app.MapGroup("/api");
api.MapBlogEndpoints();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var hasMigrations = db.Database.GetMigrations().Any();
    if (hasMigrations)
    {
        await db.Database.MigrateAsync();
    }
    else
    {
        await db.Database.EnsureCreatedAsync();
    }
}

app.Run();
