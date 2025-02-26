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
        
        private readonly SpeechRecognitionService STT;        
        
        public SpeechController([FromServices] SpeechRecognitionService stt,                    
            ILogger<SpeechController> logger)
        {
            STT = stt;            
        
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
