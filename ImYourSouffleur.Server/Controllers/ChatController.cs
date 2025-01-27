using ImYourSouffleur.Server.Models.Request;
using ImYourSouffleur.Server.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ImYourSouffleur.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {

        private readonly AgentService _agentService;

        public ChatController(AgentService agentService)
        {
            _agentService = agentService;
        }

        [HttpPost("message", Name = "message")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Post([FromBody] ChatHistoryRequest chatHistory, string connectionId)
        {
            _ = Task.Run(() => _agentService.ChatResponse(chatHistory, connectionId));

            return Ok();
        }
    }
}
