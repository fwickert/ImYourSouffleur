using ImYourSouffleur.Server.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel;

namespace ImYourSouffleur.Server.Services
{
    public class ChatService
    {
        private readonly IHubContext<MessageRelayHub> _messageRelayHubContext;
        private readonly IChatCompletionService _chat;
        private readonly Kernel _kernel;


        public ChatService()           
        {           
            

        }

    }
}
