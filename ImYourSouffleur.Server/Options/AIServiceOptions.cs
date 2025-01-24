using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ImYourSouffleur.Server.Options
{
    public sealed class AIServiceOptions
    {
        public const string PropertyName = "AIService";

        /// <summary>
        /// Supported Types of AI services.
        /// </summary>  
        public enum AIServiceType
        {
            AzureOpenAI,
            Local
        }

        /// <summary>
        /// AI Mode to use
        /// </summary>  
        public class ModelTypes
        {
            /// <summary>
            /// Azure OpenAI deployment name or OpenAI model name to use for completions
            /// </summary>   
            [Required, NotEmptyOrWhitespace]
            public string ChatDeploymentName { get; set; } = string.Empty;
        }

        /// <summary>
        /// Configuration for a single AI service.
        /// </summary>
        public class AIServiceConfiguration
        {
            /// <summary>
            /// Type of AI service.
            /// </summary>
            [Required]
            public AIServiceType Type { get; set; }

            /// <summary>
            /// Models/deployment names to use.
            /// </summary>
            [Required]
            public ModelTypes Models { get; set; } = new ModelTypes();

            /// <summary>
            /// (Azure OpenAI only) Azure OpenAI endpoint.
            /// </summary>
            [Required]
            public string Endpoint { get; set; } = string.Empty;

            /// <summary>
            /// Key to access the AI service.
            /// </summary>        
            public string Key { get; set; } = string.Empty;

            /// <summary>
            /// Service identifier.
            /// </summary>
            [Required, NotEmptyOrWhitespace]
            public string ServiceId { get; set; } = string.Empty;
        }

        /// <summary>
        /// Dictionary to hold all AI services configurations.
        /// </summary>
        [Required]
        public Dictionary<string, AIServiceConfiguration> Services { get; set; } = new Dictionary<string, AIServiceConfiguration>();
    }
}
