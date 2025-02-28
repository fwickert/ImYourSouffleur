using ImYourSouffleur.Server.Hubs;
using ImYourSouffleur.Server.Models.Request;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Windows.AI.ContentModeration;
using Microsoft.Windows.AI.Generative;
using System.Text;

namespace ImYourSouffleur.Server.Services
{
    public class LocalAgentService
    {
        private readonly IHubContext<MessageRelayHub> _messageRelayHubContext;

        public LocalAgentService(IHubContext<MessageRelayHub> messageRelayHubContext)
        {
            _messageRelayHubContext = messageRelayHubContext;
        }

        public async Task ChatPhiSilica(ChatHistoryRequest chats, string connectionId)
        {
            await this.UpdateMessageOnClient("StartMessageUpdate", "", connectionId);

            //string instruction = "[KNOWLEDGE]\n\n"
            //    + chats.Context + "\n\n" +
            //"You are a personal assistant dedicated to helping the salesperson find the best information to argue and sell a product to customers..\n\n" +
            //"Be very short in your answers";

            //Recomposer le prompt system + assistant + User et le donner en format markdown à silica par exemple.

            StringBuilder systemPrompt = new();

            //systemPrompt.Append("<|system|>\n\nTu es un assistant et tu chats avec l'utilisateur pour lui apporter des informations.\n\n" +
            //    "\n\n" +
            //    "Réponds de manière courte et succinte\n\n" +
            //    "[KNOWLEDGE]\n\n" + chats.Context + "\n\n");


            //systemPrompt.Append("<|system|>\n\n." +
            //    "You are a personal assistant dedicated to helping the salesperson find the best information to argue and sell a product to customers..\n\n\"\r\nBe very short in your answers\"\n\n" +
            //   "Ne parle pas à la place de l'utilisateur" +
            //   "[KNOWLEDGE]\n\n" + chats.Context + "\n\n<|end|>");

            systemPrompt.Append("<|system|>\n\n." +
                "You are a personal assistant dedicated to helping the field service technician to find the best information to repeair a product" +
                "\n\n\r\nBe very short in your answers\"\n\n" +
                "Tu t'adresses au technicien de terrain uniquement et tu réponds à ces quetions. N'invente pas. Et ne parle que en Français" +
                "Ne parle pas à la place de l'utilisateur" +
                "Utilise la documentation pour accompagner le technicien dans la réparation ou pour ses questions" +
                "[KNOWLEDGE]\n\n" + chats.Context + "\n\n<|end|>");

            StringBuilder assistant = new();
            StringBuilder user = new();

            foreach (var message in chats.Messages)
            {
                switch (message.Role)
                {
                    case Models.Request.AuthorRole.System:
                        systemPrompt.Append(message.Content);
                        break;
                    case Models.Request.AuthorRole.Assistant:
                        assistant.Append("<|assistant|>\n\n" + message.Content + "<|end|>");
                        break;
                    case Models.Request.AuthorRole.User:
                        user.Append("<|user|>\n\n" + message.Content + "<|end|>");
                        break;
                }
            }


            string instruction = systemPrompt + "\n\n" + assistant.ToString() + "\n\n" + user.ToString();

            //take the last message for user from the chats
            string lastmsg = chats.Messages.Last(q => q.Role == Models.Request.AuthorRole.User).Content;


            if (!LanguageModel.IsAvailable())
            {
                var op = LanguageModel.MakeAvailableAsync().GetAwaiter().GetResult();
            }


            using LanguageModel languageModel = LanguageModel.CreateAsync().GetAwaiter().GetResult();


            var languageModelOptions = new LanguageModelOptions();
            var contentFilterOptions = new ContentFilterOptions();
            languageModelOptions.Temp = 0;
            var languageModelContext = languageModel.CreateContext(instruction, contentFilterOptions);


            var l = languageModel.GenerateResponseWithProgressAsync(languageModelOptions, lastmsg, contentFilterOptions, languageModelContext);
            StringBuilder stringBuilder = new();
            l.Progress = (_, generetionProgress) =>
            {
                stringBuilder.Append(generetionProgress);
                this.UpdateMessageOnClient("InProgressMessageUpdate", stringBuilder.ToString().Replace("<|system|>", "").Replace("<|assistant|>", "").Replace("<|end|>",""), connectionId).GetAwaiter().GetResult();
            };
        }

        public async Task<string> ReportWithPhiSilica(string transcript, string customerInfo, string connectionId)
        {
            await this.UpdateMessageOnClient("Start", "", connectionId);
            
            string systemPrompt = "<|system|>\n\nTu es un assistant et tu retourne des éléments pour générer un rapport " +
                "\n\n" +
                "C'est le technicien qui te parle et tu dois lui retourner un rapport de réparation" +
                "\n\n" +
                "Ton format de réponse sera toujours dans ce format JSON : " +
                "{\"CustomerName\":\"value\", " +
                "\"CustomerEmail\":\"value\", " +
                "\"CustomerPhone\":\"value\", " +
                "\"CustomerAddress\":\"value\"," +
                "\"Issue\":\"value\"," +
                "\"Diagnostic\":\"value\"," +
                "\"Conclusion\":\"value\"," +
                "\"Comment\":\"value\"" +
                "}" +
                "\n\n" +
                "your entire response/output is going to consist of a single JSON object {}, and you will NOT wrap it within JSON md markers\n\n" +
                "[TRANSCRIPT]\n\n" + transcript + "\n\n" +
                "[CUSTOMERINFO]\n\n" + customerInfo + "\n\n<|end|>";

            
            if (!LanguageModel.IsAvailable())
            {
                var op = LanguageModel.MakeAvailableAsync().GetAwaiter().GetResult();
            }
            using LanguageModel languageModel = LanguageModel.CreateAsync().GetAwaiter().GetResult();
            var languageModelOptions = new LanguageModelOptions();
            var contentFilterOptions = new ContentFilterOptions();
            languageModelOptions.Temp = 0;
            var languageModelContext = languageModel.CreateContext(systemPrompt, contentFilterOptions);

            var l = await languageModel.GenerateResponseAsync(languageModelOptions, transcript, contentFilterOptions, languageModelContext);
            string response = l.Response;
            Console.WriteLine(response);
            //await this.UpdateMessageOnClient("InProgressMessageUpdate", response, connectionId);

            return response;

        }

        private async Task UpdateMessageOnClient(string hubconnection, string message, string connectionId)
        {
            await this._messageRelayHubContext.Clients.Client(connectionId).SendAsync(hubconnection, message);
        }
    }
}

