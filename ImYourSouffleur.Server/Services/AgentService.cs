#pragma warning disable SKEXP0110 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
#pragma warning disable SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

using System;
using System.Threading.Tasks;
using System.Text.Json;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using ImYourSouffleur.Server.Models;
using ImYourSouffleur.Server.Models.Request;

using Microsoft.Extensions.Logging;
using ImYourSouffleur.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver.Core.Connections;

using Microsoft.Windows.AI.Generative;
using Microsoft.Identity.Client;
using System.Text;
using Microsoft.Windows.AI.ContentModeration;

namespace ImYourSouffleur.Server.Services
{
    public class AgentService
    {
        private readonly Kernel _kernel;
        private readonly IHubContext<MessageRelayHub> _messageRelayHubContext;
        private readonly string _dataDirectory = "Data";

        public AgentService([FromServices] Kernel kernel, [FromServices] IHubContext<MessageRelayHub> messageRelayHubContext)
        {
            _kernel = kernel;
            _messageRelayHubContext = messageRelayHubContext;
        }

        public async Task<string> GetCustomerSummary(Customer customer, string endpoint)
        {
            ChatCompletionAgent agent = new()
            {
                Name = "CustomerService",
                Instructions = "resume the customer information only with sentences.no list",
                Kernel = _kernel,
                Arguments = new KernelArguments(new OpenAIPromptExecutionSettings()
                {
                    ServiceId = endpoint,
                })
            };

            // Serialize customer in json
            string jsonCustomer = JsonSerializer.Serialize(customer);
            string systemprompt = "Voici les informations du client : \n\n" + jsonCustomer;

            ChatHistory chats = [new(Microsoft.SemanticKernel.ChatCompletion.AuthorRole.User, systemprompt)];

            string summary = string.Empty;
            await foreach (ChatMessageContent response in agent.InvokeAsync(chats))
            {
                summary += response.Content;
            }

            return summary;
        }

        public async Task<bool> PersonalOrNot(Appointment appointment)
        {
            ChatCompletionAgent agent = new()
            {
                Name = "AppointmentService",
                Instructions = "Determine if the appointment is personal or not based on the description and title. Only response True or False. RULES : Salers never lunch with customer (otherwise is personal).",
                Kernel = _kernel,
                Arguments = new KernelArguments(new OpenAIPromptExecutionSettings()
                {
                    ServiceId = "Cloud4omini",
                })
            };

            // Serialize appointment in json
            string jsonAppointment = JsonSerializer.Serialize(appointment);
            string systemprompt = "Here are the details of the appointment: \n\n" + jsonAppointment;

            ChatHistory chats = [new(Microsoft.SemanticKernel.ChatCompletion.AuthorRole.User, systemprompt)];

            string responseContent = string.Empty;
            await foreach (ChatMessageContent response in agent.InvokeAsync(chats, new(new OpenAIPromptExecutionSettings() { ServiceId = "Cloud4omini" })))
            {
                responseContent += response.Content;
            }

            // Assuming the response contains a boolean indicating if the appointment is personal
            bool isPersonal = bool.Parse(responseContent);//.Contains("personal", StringComparison.OrdinalIgnoreCase);

            //appointment.Personal = isPersonal;
            return isPersonal;
        }

        public async Task<string> GetDocumentation(string customerID)
        {
            // Load file in data folder based on customerID
            string surfaceDoc="";
            if (customerID == "12345")
            {
                surfaceDoc = File.ReadAllText(Path.Combine(_dataDirectory, "MSFT-Microsoft-Surface-Laptop-7th-Edition-Fact-Sheet.md"));
                surfaceDoc += "\n\n" + File.ReadAllText(Path.Combine(_dataDirectory, "MSFT-Microsoft-Surface-Pro-11th-Edition-Fact-Sheet.md"));
            }
            else if (customerID == "6789")
            {
                surfaceDoc = File.ReadAllText(Path.Combine(_dataDirectory, "surfacehub.md"));
            }
           

            // Create the instruction
            string instruction = "Get summary of the documentation. This documentation must be useful if a salesperson asks for advice to the AI." +
                " \n\n[Documentation to summarize]\n\n" +
                surfaceDoc + "\n\n[END]";

            ChatCompletionAgent agent = new()
            {
                Name = "DocumentationService",
                Instructions = instruction,
                Kernel = _kernel,
                Arguments = new KernelArguments(new OpenAIPromptExecutionSettings()
                {
                    ServiceId = "Cloud4omini",
                })
            };
            ChatHistory chats = new ChatHistory();
            chats.AddUserMessage(customerID);
            string responseContent = string.Empty;
            await foreach (ChatMessageContent response in agent.InvokeAsync(chats))
            {
                responseContent += response.Content;
            }
            return responseContent;
        }


        public async Task ChatResponse(ChatHistoryRequest chats, string endpoint, string connectionId)
        {
            await this.UpdateMessageOnClient("StartMessageUpdate", "", connectionId);

            string instruction = "[KNOWLEDGE]\n\n" 
                + chats.Context + "\n\n" +
                "You are a personal assistant dedicated to helping the salesperson find the best information to argue and sell a product to customers..\n\n" +
                "Be very short in your answers";

            //add special info if localSLM
            if (endpoint == "Localphi3")
            {
                instruction += "\n\nAnswer only in same language that the User (like Fr)\n\n";
            }

            ChatCompletionAgent agent = new()
            {
                Name = "ChatService",
                Instructions = instruction,
                Kernel = _kernel,
                Arguments = new KernelArguments(new OpenAIPromptExecutionSettings()
                {
                    ServiceId = endpoint,
                })
            };

            ChatHistory SKHistory = new ChatHistory();
            foreach (var message in chats.Messages)
            {
                switch (message.Role)
                {
                    case Models.Request.AuthorRole.User:
                        SKHistory.AddUserMessage(message.Content);
                        break;
                    case Models.Request.AuthorRole.System:
                        SKHistory.AddSystemMessage(message.Content);
                        break;
                    case Models.Request.AuthorRole.Assistant:
                        SKHistory.AddAssistantMessage(message.Content);
                        break;
                }
            }

            string responseContent = string.Empty;
            await foreach (StreamingChatMessageContent response in agent.InvokeStreamingAsync(SKHistory))
            {
                responseContent += response.Content;
                if (!string.IsNullOrEmpty(responseContent))
                {                    
                    await this.UpdateMessageOnClient("InProgressMessageUpdate", responseContent, connectionId);
                }

            }

            await this.UpdateMessageOnClient("EndMessageUpdate", responseContent, connectionId);

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

            
            systemPrompt.Append("<|system|>\n\n." +
                "You are a personal assistant dedicated to helping the salesperson find the best information to argue and sell a product to customers..\n\n\"\r\nBe very short in your answers\"\n\n" +
               "Réponds de manière courte et succinte\n\n" +
               "[KNOWLEDGE]\n\n" + chats.Context + "\n\n");
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
                        assistant.Append("<|assistant|>\n\n" + message.Content);
                        break;
                    case Models.Request.AuthorRole.User:
                        user.Append("<|user|>\n\n" + message.Content);
                        break;
                }
            }


            string instruction = systemPrompt + "\n\n" + assistant.ToString() + "\n\n" + user.ToString();

            //take the last message for user from the chats
            string lastmsg = chats.Messages.Last(q=>q.Role == Models.Request.AuthorRole.User).Content;




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
                this.UpdateMessageOnClient("InProgressMessageUpdate", stringBuilder.ToString().Replace("<|system|>", "").Replace("<|assistant|>", ""), connectionId).GetAwaiter().GetResult();
            };
        }


        private async Task UpdateMessageOnClient(string hubconnection, string message, string connectionId)
        {
            await this._messageRelayHubContext.Clients.Client(connectionId).SendAsync(hubconnection, message);
        }
    }
}


#pragma warning restore SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
#pragma warning restore SKEXP0110 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.