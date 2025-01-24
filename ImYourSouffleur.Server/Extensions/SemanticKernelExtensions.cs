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
            foreach (var service in options.Services)
            {
                var serviceConfig = service.Value;
                switch (serviceConfig.Type)
                {
                    case AIServiceOptions.AIServiceType.AzureOpenAI:
                        kernelBuilder.AddAzureOpenAIChatCompletion(
                            deploymentName: serviceConfig.Models.ChatDeploymentName,
                            endpoint: serviceConfig.Endpoint,
                            apiKey: serviceConfig.Key,
                            serviceId: serviceConfig.ServiceId);
                        break;
                    case AIServiceOptions.AIServiceType.Local:
                        kernelBuilder.AddOpenAIChatCompletion(
                            modelId: serviceConfig.Models.ChatDeploymentName,
                            apiKey: null,
                            endpoint: new Uri(serviceConfig.Endpoint),
                            serviceId: serviceConfig.ServiceId);
                        break;
                    default:
                        throw new ArgumentException($"Invalid {nameof(serviceConfig.Type)} value in '{AIServiceOptions.PropertyName}' settings.");
                }
            }

            return kernelBuilder;
        }
    }
}
