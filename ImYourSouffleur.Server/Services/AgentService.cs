#pragma warning disable SKEXP0110 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
#pragma warning disable SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.


using System.Text.Json;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using ImYourSouffleur.Server.Models;
using ImYourSouffleur.Server.Models.Request;
using ImYourSouffleur.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Mvc;


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
                Instructions = "Determine if the appointment is personal or not based on the description and title. Only response True or False.\n\nRULES\n\n" +
                "Salers never lunch with customer (otherwise is personal).\n\n" +
                "Field Service only lunch with personal appointement. Teem lunch are personal",
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
            string Doc = "";
            switch (customerID)
            {
                case "12345":
                    Doc = File.ReadAllText(Path.Combine(_dataDirectory, "MSFT-Microsoft-Surface-Laptop-7th-Edition-Fact-Sheet.md"));
                    Doc += "\n\n" + File.ReadAllText(Path.Combine(_dataDirectory, "MSFT-Microsoft-Surface-Pro-11th-Edition-Fact-Sheet.md"));
                    break;
                case "6789":
                    Doc = File.ReadAllText(Path.Combine(_dataDirectory, "surfacehub.md"));
                    break;
                case "13579":
                    Doc = File.ReadAllText(Path.Combine(_dataDirectory, "MachineACafeContoso.md"));
                    Doc += File.ReadAllText(Path.Combine(_dataDirectory, "MachineACafeReparation.md"));
                    break;
                case "24680":
                    Doc = File.ReadAllText(Path.Combine(_dataDirectory, "DistributeurContoso.md"));
                    Doc += "\n\n" + File.ReadAllText(Path.Combine(_dataDirectory, "DistributeurReparation.md"));
                    break;

            }


            // Create the instruction
            string instruction = "Get summary of the documentation et repear spécification. " +
                "This documentation must be useful if the employee asks for advice to the AI. The user can be a saler or a technician from FieldService" +
                "Keep the product reference number in the summary (both Product documentation and technical informations" +
                " \n\n[Documentation to summarize]\n\n" +
                Doc + "\n\n[END]";

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

            //endpoint = "Localphi3";
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

        public async Task GetDescriptionFromImage(byte[] image, string endpoint, string connectionId)
        {
            await this.UpdateMessageOnClient("StartMessageUpdate", "", connectionId);

            string instruction = "Tu es agent qui aide à décrire de manière précise les images";

            ChatCompletionAgent agent = new()
            {
                Name = "ImageService",
                Instructions = instruction,
                Kernel = _kernel,
                Arguments = new KernelArguments(new OpenAIPromptExecutionSettings()
                {
                    ServiceId = endpoint,

                })
            };
            //string imagePath = "C:\\Users\\frewickert\\Pictures\\Contoso BrewMaster 3000 coffee machine with a sleek design, modern kitchen setting, user interface, accessories, coffee ambiance, and smart connectivity features.png";
            //byte[] imageBytes = await File.ReadAllBytesAsync(imagePath);
            
            ChatHistory chats = new ChatHistory();
            chats.AddUserMessage(new ChatMessageContentItemCollection
            {
                new TextContent("Merci de décrire cette image. Et fait bien un focus sur la partie entourée en rouge. S'il y a qq chose d'ecrit, même manuscrit précise le."),
                 new ImageContent(data:image, "images/png")
                //new ImageContent(new Uri("https://www.cdiscount.com/pdt2/8/8/1/1/1200x1200/phi1685511565881/rw/philips-l-or-barista-lm8012-60-machine-a-cafe-a-ca.jpg"))
            });

            string responseContent = string.Empty;
            await foreach (StreamingChatMessageContent response in agent.InvokeStreamingAsync(chats))
            {
                responseContent += response.Content;
                if (!string.IsNullOrEmpty(responseContent))
                {
                    await this.UpdateMessageOnClient("InProgressMessageUpdate", responseContent, connectionId);
                    Console.Write(response.Content);
                }
            }

        }

        public async Task GetEmailSummary(string email, string endpoint, string connectionId)
        {
            await this.UpdateMessageOnClient("StartMessageUpdate", "", connectionId);
            string instruction = "tu es un assistant pour le fieldservice pour la société Contoso.\r\n" +
                "Le technicien a fait une intervention.\r\n" +
                "Tu recois des informations pour faire un mail de recap au client.\r\n" +
                "Si le technicien a pris une photo, précise le dans le mail.\r\n" +
                "Formule un mail de réponse complet.\r\n" +
                "L'email est celui du client.\r\n" +
                "Utilise son nom dans le mail pas son prénom\r\n\r\n" +
                "Signe Contoso Service Client\r\n+33678451245\r\ncontoso@support.com\r\n";
            ChatCompletionAgent agent = new()
            {
                Name = "EmailService",
                Instructions = instruction,
                Kernel = _kernel,
                Arguments = new KernelArguments(new OpenAIPromptExecutionSettings()
                {
                    ServiceId = endpoint,
                })
            };            
            ChatHistory chats = new ChatHistory();
            chats.AddUserMessage(email);
            string responseContent = string.Empty;
            await foreach (StreamingChatMessageContent response in agent.InvokeStreamingAsync(chats))
            {
                responseContent += response.Content;
                if (!string.IsNullOrEmpty(responseContent))
                {
                    await this.UpdateMessageOnClient("InProgressMessageUpdate", responseContent, connectionId);
                    Console.Write(response.Content);
                }
            }
        }

        private async Task UpdateMessageOnClient(string hubconnection, string message, string connectionId)
        {
            await this._messageRelayHubContext.Clients.Client(connectionId).SendAsync(hubconnection, message);

        }
    }
}


#pragma warning restore SKEXP0001 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
#pragma warning restore SKEXP0110 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.