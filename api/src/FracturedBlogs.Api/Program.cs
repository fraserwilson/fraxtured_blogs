using FracturedBlogs.Api.Endpoints;
using FracturedBlogs.Api.Services;
using FracturedBlogs.Infrastructure;
using FracturedBlogs.Infrastructure.Data;
using FracturedBlogs.Parsers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddParsers();

builder.Services.AddScoped<ISlugGenerator, SlugGenerator>();
builder.Services.AddScoped<IObjectStorageService, MinioObjectStorageService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("web", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("web");
app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/health", () => Results.Ok(new { ok = true, service = "FracturedBlogs.Api" }));

var api = app.MapGroup("/api");
api.MapBlogEndpoints();
api.MapAuthEndpoints();

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
