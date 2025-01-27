using ImYourSouffleur.Server.Models;
using ImYourSouffleur.Server.Options;
using ImYourSouffleur.Server.Services;
using ImYourSouffleur.Server.Voice;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.CognitiveServices.Speech;
using System.Reflection;



namespace ImYourSouffleur.Server.Extensions
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddOptions(this IServiceCollection services, ConfigurationManager configuration)
        {

            AddOptions<SpeechOptions>(SpeechOptions.PropertyName);
            AddOptions<AIServiceOptions>(AIServiceOptions.PropertyName);


            return services;

            void AddOptions<TOptions>(string propertyName)
                where TOptions : class
            {
                services.AddOptions<TOptions>(configuration.GetSection(propertyName));
            }
        }

        internal static void AddOptions<TOptions>(this IServiceCollection services, IConfigurationSection section)
           where TOptions : class
        {
            services.AddOptions<TOptions>()
                .Bind(section)
                .ValidateDataAnnotations()
                .ValidateOnStart();
            //.PostConfigure(TrimStringProperties);
        }

        //private static void TrimStringProperties<T>(T options) where T : class
        //{
        //    Queue<object> targets = new();
        //    targets.Enqueue(options);

        //    while (targets.Count > 0)
        //    {
        //        object target = targets.Dequeue();
        //        Type targetType = target.GetType();
        //        foreach (PropertyInfo property in targetType.GetProperties())
        //        {
        //            // Skip enumerations
        //            if (property.PropertyType.IsEnum)
        //            {
        //                continue;
        //            }

        //            // Property is a built-in type, readable, and writable.
        //            if (property.PropertyType.Namespace == "System" &&
        //                property.CanRead &&
        //                property.CanWrite)
        //            {
        //                // Property is a non-null string.
        //                if (property.PropertyType == typeof(string) &&
        //                    property.GetValue(target) != null)
        //                {
        //                    property.SetValue(target, property.GetValue(target)!.ToString()!.Trim());
        //                }
        //            }
        //            else
        //            {
        //                // Property is a non-built-in and non-enum type - queue it for processing.
        //                if (property.GetValue(target) != null)
        //                {
        //                    targets.Enqueue(property.GetValue(target)!);
        //                }
        //            }
        //        }
        //    }
        //}

        internal static IServiceCollection AddCorsPolicy(this IServiceCollection services)
        {
            IConfiguration configuration = services.BuildServiceProvider().GetRequiredService<IConfiguration>();
            string[] allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
            if (allowedOrigins.Length > 0)
            {
                services.AddCors(options =>
                {
                    options.AddDefaultPolicy(
                        policy =>
                        {
                            policy.WithOrigins(allowedOrigins)
                                .WithMethods("GET", "POST", "DELETE")
                                .AllowAnyHeader()
                                .AllowCredentials();
                        });
                });
            }

            return services;
        }

        internal static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddScoped<SLMResponseService>();
            services.AddScoped<AppointmentService>();
            services.AddScoped<CustomerService>();
            services.AddScoped<AgentService>();
            services.AddScoped<ChatService>();

            return services;
        }

        public static IServiceCollection AddSTT(this IServiceCollection services, ConfigurationManager configuration)
        {
            //Create list and asssingleton of

            List<Speeches> recognizers = new List<Speeches>();

            //var env = services.BuildServiceProvider().GetService<IWebHostEnvironment>();

            string lang = "fr-FR";
            //Settings.SpeechRecognitionLocale = lang;
            //Settings.SpeechSynthesisLocale = lang;
            Settings.EmbeddedSpeechRecognitionModelName = lang;

            var result = Settings.VerifySettingsAsync().Result;
            if (!result)
            {
                return services;
            }

            var speechConfig = Settings.CreateEmbeddedSpeechConfig();
            
            var audioConfig = AudioConfig.FromDefaultMicrophoneInput();
            audioConfig.SetProperty(PropertyId.Speech_SegmentationStrategy, "Time");
            audioConfig.SetProperty(PropertyId.Speech_SegmentationSilenceTimeoutMs, "1000");
            //audioConfig.SetProperty(PropertyId.Conversation_Initial_Silence_Timeout, "200");
            //audioConfig.SetProperty(PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "200");

            var recognizer = new SpeechRecognizer(speechConfig, audioConfig);

            //create speeches object with prop
            Speeches speech = new()
            {
                Language = lang,
                Recognizers = recognizer
            };

            recognizers.Add(speech);
            services.AddSingleton<List<Speeches>>(recognizers);

            services.AddSingleton<SpeechRecognitionService>();

            return services;


        }

    }
}
