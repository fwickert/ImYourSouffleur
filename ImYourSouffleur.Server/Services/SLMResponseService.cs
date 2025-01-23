using ImYourSouffleur.Server.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;


namespace ImYourSouffleur.Server.Services
{
    public class SLMResponseService
    {
        private readonly ILogger<SLMResponseService> _logger;
        private readonly Kernel _kernel;
        private readonly IHubContext<MessageRelayHub> _messageRelayHubContext;

        public SLMResponseService(ILogger<SLMResponseService> logger, [FromServices] Kernel kernel, [FromServices] IHubContext<MessageRelayHub> messageRelayHubContext)
        {
            _logger = logger;
            _kernel = kernel;
            _messageRelayHubContext = messageRelayHubContext;
        }

        public async Task GetPlaces(string conversation, string connectionId)
        {
            string prompt = "Reponds sous forme de liste.\n\n" +
                "Le format de réponse est en Markdown.\n\n" +
                "n'invente pas de lieux, réponds uniquement si tu es sûr.\n\n" +
                "Identifie uniquement les lieux concernées dans la conversation.\n\n" +
                "[CONVERSATION]\n\n" +
                "{{$conversation}}";


            KernelArguments args = new()
            {
                { "conversation", conversation }
            };

            await GetResponseInternal("places", prompt, args, connectionId);
        }

        public async Task GetPeople(string conversation, string connectionId)
        {
            string prompt = "Reponds sous forme de liste.\n\n" +
                "Le format de réponse est en Markdown.\n\n" +
                "N'invente pas de personnes, réponds uniquement si tu es sûr.\n\n" +
                "Identifie uniquement les personnes concernées dans la conversation.\n\n" +
                "[CONVERSATION]\n\n" +
                "{{$conversation}}";

                KernelArguments args = new()
                {
                    { "conversation", conversation }
                };

            await GetResponseInternal("People", prompt, args, connectionId);
        }

        public async Task GetDamages(string conversation, string connectionId)
        {
            string prompt = "Reponds sous forme de liste.\n\n" +
                "Le format de ta réponse est uniquement en Markdown.\n\n" +
                "Tes réponses doivent courte et consise.\n\n" +
                "Uniquement l'essentiel.\n\n" +
                "Identifie la Nature du problème\n" +
                "Précise, uniquement si renseignée, la Date et heure approximative de la découverte du dégât.\n" +
                "Précise, uniquement si renseigné, l'étendue des dommages visibles (plafonds, murs, sols, meubles, appareils).\n" +
                "Précise, uniquement si renseignée, l'origine suspectée du problème (fuite d’une canalisation, robinet laissé ouvert, infiltration, etc.).\n" +
                "[CONVERSATION]\n\n" +
                "{{$conversation}}";

            KernelArguments args = new()
            {
                { "conversation", conversation }
            };

            await GetResponseInternal("Damages", prompt, args, connectionId);
        }

        public async Task GetCirconstances(string conversation, string connectionId)
        {
            string prompt = "Reponds sous forme de liste.\n\n" +
                "Le format de ta réponse est uniquement en Markdown.\n\n" +
                "Tes réponses doivent courte et consise.\n\n" +
                "Uniquement l'essentiel.\n\n" +
                "Identifie le Contexte et les circonstances :\n" +
                "Précise, si renseignée, les Conditions météorologiques, si pertinentes (pluie, tempête, etc.).\n" +
                "Précise, si renseignée, les Événements ou actions spécifiques ayant précédé le dégât (travaux, bruits suspects, etc.).\n" +
                "Précise si renseignée, toute observation supplémentaire pouvant éclairer sur la cause.\n" +
                "[CONVERSATION]\n\n" +
                "{{$conversation}}";

            KernelArguments args = new()
            {
                { "conversation", conversation }
            };

            await GetResponseInternal("Circonstances", prompt, args, connectionId);
        }

        public async Task GetActions(string conversation, string connectionId)
        {
            string prompt = "Reponds sous forme de liste.\n\n" +
                "Le format de ta réponse est uniquement en Markdown.\n\n" +
                "Tes réponses doivent être courtes et concises.\n\n" +
                "Uniquement l'essentiel.\n\n" +
                "Identifie les Actions immédiates prises :\n" +
                "Précise, si renseignées, les Mesures mises en place pour limiter les dégâts (coupure d’eau, d’électricité, etc.).\n" +
                "Précise, si renseignée, la Notification des personnes concernées (locataire, propriétaire, syndic, assurance, etc.).\n" +
                "Précise, si renseignée, l'Intervention d’un professionnel ou d’un service d’urgence (plombier, pompiers, etc.).\n" +
                "[CONVERSATION]\n\n" +
                "{{$conversation}}";

                KernelArguments args = new()
                {
                    { "conversation", conversation }
                };

            await GetResponseInternal("Actions", prompt, args, connectionId);
        }

        public async Task GetVisuals(string conversation, string connectionId)
        {
            string prompt = "Reponds sous forme de liste.\n\n" +
                "Le format de ta réponse est uniquement en Markdown.\n\n" +
                "Tes réponses doivent être courtes et concises.\n\n" +
                "Uniquement l'essentiel.\n\n" +
                "Identifie le Constat visuel ou preuves documentées :\n" +
                "Précise, si renseignées, les Photos ou vidéos des dégâts.\n" +
                "Précise, si renseigné, le Rapport visuel du gardien détaillant l’état des lieux.\n" +
                "Précise, si renseigné, un relevé des compteurs d’eau pour vérifier une consommation anormale.\n" +
                "[CONVERSATION]\n\n" +
                "{{$conversation}}";

            KernelArguments args = new()
            {
                { "conversation", conversation }
            };

            await GetResponseInternal("Visuals", prompt, args, connectionId);
        }


        public async Task GetFollowUp(string conversation, string connectionId)
        {
            string prompt = "Reponds sous forme de liste.\n\n" +
                "Le format de ta réponse est uniquement en Markdown.\n\n" +
                "Tes réponses doivent être courtes et concises.\n\n" +
                "Uniquement l'essentiel.\n\n" +
                "Identifie le Suivi et recommandations :\n" +
                "Précise, si renseignées, les Suggestions de réparations ou actions prioritaires (par exemple, intervention d’un plombier).\n" +
                "Précise, si renseignée, la Nécessité d’un constat d’assurance ou de la visite d’un expert.\n" +
                "[CONVERSATION]\n\n" +
                "{{$conversation}}";

            KernelArguments args = new()
            {
                { "conversation", conversation }
            };

            await GetResponseInternal("FollowUp", prompt, args, connectionId);
        }


        private async Task GetResponseInternal(string feature, string prompt, KernelArguments args, string connectionId)
        {
            var function = _kernel.CreateFunctionFromPrompt(prompt, new OpenAIPromptExecutionSettings
            {
                TopP = 0.5,
                MaxTokens = 2096,
            });
            string response = "";
            await foreach (var word in _kernel.InvokeStreamingAsync<StreamingChatMessageContent>(function, args))
            {
                await this.UpdateMessageOnClient("Started", "started", connectionId);

                if (!string.IsNullOrEmpty(word.Content))
                {
                    response += word.Content;
                    await this.UpdateMessageOnClient(feature, response, connectionId);
                    Console.Write(word.Content);
                }
            }
        }

        private async Task UpdateMessageOnClient(string hubconnection, string message, string connectionId)
        {
            if (!string.IsNullOrEmpty(connectionId))
            {
                await this._messageRelayHubContext.Clients.Client(connectionId).SendAsync(hubconnection, message);
            }

        }

    }
}
