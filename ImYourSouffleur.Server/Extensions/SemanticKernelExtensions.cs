using ImYourSouffleur.Server.Options;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;

namespace ImYourSouffleur.Server.Extensions
{
    internal static class SemanticKernelExtensions
    {
        internal static IServiceCollection AddSemanticKernelServices(this IServiceCollection services)
        {
            services.AddScoped<Kernel>(sp =>
            {
                IKernelBuilder builder = Kernel.CreateBuilder();
                builder.Services.AddLogging(c => c.AddConsole().SetMinimumLevel(LogLevel.Information));
                builder.WithCompletionBackend(sp.GetRequiredService<IOptions<AIServiceOptions>>().Value);
                builder.Services.AddHttpClient();

                Kernel kernel = builder.Build();
                
                return kernel;
            });


            return services;
        }

        private static IKernelBuilder WithCompletionBackend(this IKernelBuilder kernelBuilder, AIServiceOptions options)
        {
           
                return options.Type switch
                {
                    AIServiceOptions.AIServiceType.AzureOpenAI
                        => kernelBuilder.AddAzureOpenAIChatCompletion(
                            deploymentName: options.Models.ChatDeploymentName,
                            endpoint: options.Endpoint,
                            serviceId: "AzureOpenAIChat",
                            apiKey: options.Key),
                    AIServiceOptions.AIServiceType.Local
                        => kernelBuilder.AddOpenAIChatCompletion(
                            modelId: options.Models.ChatDeploymentName,
                            apiKey: null,
                            endpoint: new Uri(options.Endpoint)
                            ),
                    _
                        => throw new ArgumentException($"Invalid {nameof(options.Type)} value in '{AIServiceOptions.PropertyName}' settings."),
                };
            
            
        }
    }
}
