using ImYourSouffleur.Server.Hubs;
using ImYourSouffleur.Server.Voice;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ImYourSouffleur.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpeechController : ControllerBase
    {
        private readonly ILogger<SpeechController> _logger;
        private readonly SpeechRecognitionService STT;        
        private readonly IHubContext<MessageRelayHub> _messageRelayHubContext;
        private readonly IWebHostEnvironment _env;

        public SpeechController([FromServices] SpeechRecognitionService stt,            
            [FromServices] IHubContext<MessageRelayHub> messageRelayHubContext,
            [FromServices] IWebHostEnvironment env,
            ILogger<SpeechController> logger)
        {
            STT = stt;            
            _messageRelayHubContext = messageRelayHubContext;
            _env = env;
            _logger = logger;
        }

        [HttpGet("micro")]
        public async Task<IActionResult> Micro(string lang)
        {
            if (Settings.HasSpeechRecognitionModel())
            {
                await STT.StartRecognition(lang);
            }
            return Ok();
        }

        [HttpGet]
        public async Task<IActionResult> StopMicro(string lang)
        {
            await STT.StopRecognition(lang);
            return Ok();
        }

    }


}
