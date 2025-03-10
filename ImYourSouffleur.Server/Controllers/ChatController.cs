﻿using ImYourSouffleur.Server.Models.Request;
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
        private readonly LocalAgentService _localAgentService;

        public ChatController(AgentService agentService, LocalAgentService localAgentService)
        {
            _agentService = agentService;
            _localAgentService = localAgentService;
        }

        [HttpPost("message", Name = "message")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Post([FromBody] ChatHistoryRequest chatHistory, string endpoint,string connectionId)
        {
            //_ = Task.Run(() => _agentService.ChatResponse(chatHistory, endpoint, connectionId));

            _ = Task.Run(() => _localAgentService.ChatPhiSilica(chatHistory, connectionId));

            return Ok();
        }
    }
}
