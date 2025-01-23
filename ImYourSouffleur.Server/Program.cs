using ImYourSouffleur.Server.Extensions;
using ImYourSouffleur.Server.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddSingleton<ILogger>(sp => sp.GetRequiredService<ILogger<Program>>()) // some services require an un-templated ILogger
    .AddOptions(builder.Configuration)
    .AddServices()
    .AddSemanticKernelServices();

builder.Services.AddSignalR(options => options.MaximumParallelInvocationsPerClient = 10);

builder.Services.AddCorsPolicy();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

app.MapHub<MessageRelayHub>("/messageRelayHub");

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
