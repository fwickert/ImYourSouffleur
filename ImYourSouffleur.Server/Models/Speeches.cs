using Microsoft.CognitiveServices.Speech;

namespace ImYourSouffleur.Server.Models
{
    public class Speeches
    {
        public string Language { get; set; } = string.Empty;
        public required SpeechRecognizer Recognizers { get; set; }
    }
}
