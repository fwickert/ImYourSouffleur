using ImYourSouffleur.Server.Hubs;
using ImYourSouffleur.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.CognitiveServices.Speech;

namespace ImYourSouffleur.Server.Voice
{
    public class SpeechRecognitionService
    {
        private readonly IHubContext<MessageRelayHub>? _messageRelayHubContext;
        private readonly List<Speeches> recognizers;

        public SpeechRecognitionService([FromServices] IHubContext<MessageRelayHub> messageRelayHubContext, [FromServices] List<Speeches> reco)
        {
            _messageRelayHubContext = messageRelayHubContext;
            recognizers = reco;
        }

        private void Recognizer_Recognized(object sender, SpeechRecognitionEventArgs e)
        {
            if (e.Result.Reason == ResultReason.RecognizedSpeech)
            {
                // Final result. May differ from the last intermediate result.
                Console.WriteLine($"RECOGNIZED: Text={e.Result.Text}");
                
                //Send with signalR
                UpdateMessageOnClient("ReceiveMessageEnd", e.Result.Text).Wait();

                var recognizer = (SpeechRecognizer)sender;
                var lang = recognizers.FirstOrDefault(r => r.Recognizers == recognizer)?.Language;
                if (lang != null)
                {
                    StopRecognition(lang).Wait();
                }
            }
            else if (e.Result.Reason == ResultReason.NoMatch)
            {
                // NoMatch occurs when no speech was recognized.
                var reason = NoMatchDetails.FromResult(e.Result).Reason;
                Console.WriteLine($"NO MATCH: Reason={reason}");

                var recognizer = (SpeechRecognizer)sender;
                var lang = recognizers.FirstOrDefault(r => r.Recognizers == recognizer)?.Language;
                if (lang != null)
                {
                    StopRecognition(lang).Wait();
                }
            }
        }

        private void Recognizer_Recognizing(object sender, SpeechRecognitionEventArgs e)
        {
            Console.WriteLine($"Recognizing:{e.Result.Text}");
            UpdateMessageOnClient("ReceiveMessageInProgress", e.Result.Text).Wait();
        }

        private void Recognizer_SessionStarted(object sender, SessionEventArgs e)
        {
            Console.WriteLine("Session started.");
            //Send info with SignalR
            UpdateMessageOnClient("MicroReady", "Go").Wait();
        }

        private void Recognizer_SessionStopped(object sender, SessionEventArgs e)
        {
            Console.WriteLine("Session stopped.");
            //recognitionEnd.TrySetResult(0);
            UpdateMessageOnClient("MicroStop", "Stop").Wait();
        }

        public async Task StartRecognition(string lang)
        {
            var recognizer = recognizers.Where(q => q.Language == lang).FirstOrDefault()!.Recognizers;
            
            recognizer.Recognizing -= Recognizer_Recognizing!;
            recognizer.Recognized -= Recognizer_Recognized!;
            recognizer.SessionStarted -= Recognizer_SessionStarted!;
            recognizer.SessionStopped -= Recognizer_SessionStopped!;


            recognizer.Recognizing += Recognizer_Recognizing!;
            recognizer.Recognized += Recognizer_Recognized!;
            recognizer.SessionStarted += Recognizer_SessionStarted!;
            recognizer.SessionStopped += Recognizer_SessionStopped!;
            await recognizer.StartContinuousRecognitionAsync();
        }

        public async Task StopRecognition(string lang)
        {
            var recognizer = recognizers.Where(q => q.Language == lang).FirstOrDefault()!.Recognizers;
            recognizer.Recognized -= Recognizer_Recognized!;
            //recognizer.SessionStarted -= Recognizer_SessionStarted!;
            //recognizer.SessionStopped -= Recognizer_SessionStopped!;
            await recognizer.StopContinuousRecognitionAsync();

        }

        private async Task UpdateMessageOnClient(string typeMessage, string message)
        {
            await _messageRelayHubContext!.Clients.All.SendAsync(typeMessage, message);
        }
    }
}
