using System.ComponentModel.DataAnnotations;

namespace ImYourSouffleur.Server.Options
{
    public class SpeechOptions
    {
        public const string PropertyName = "Speech";

        [Required, NotEmptyOrWhitespace]
        public string SubscriptionKey { get; set; } = string.Empty;

        [Required, NotEmptyOrWhitespace]
        public string Region { get; set; } = string.Empty;
    }
}
