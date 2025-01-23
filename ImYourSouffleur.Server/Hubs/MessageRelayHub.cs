using Microsoft.AspNetCore.SignalR;

namespace ImYourSouffleur.Server.Hubs
{
    public class MessageRelayHub : Hub
    {
        
        private readonly ILogger<MessageRelayHub> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="MessageRelayHub"/> class.
        /// </summary>
        /// <param name="logger">The logger.</param>
        public MessageRelayHub(ILogger<MessageRelayHub> logger)
        {
            this._logger = logger;
        }

       
    }
}
