using Microsoft.AspNetCore.Mvc;
using ImYourSouffleur.Server.Services;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace ImYourSouffleur.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImageController : ControllerBase
    {
        private readonly AgentService _agentService;

        public ImageController(AgentService agentService)
        {
            _agentService = agentService;
        }

        [HttpPost("GetDescriptionFromImage")]
        public async Task<IActionResult> GetDescriptionFromImage([FromQuery] string endpoint, [FromQuery] string connectionId, IFormFile imageFile)
        {
            if (string.IsNullOrEmpty(endpoint) || string.IsNullOrEmpty(connectionId))
            {
                return BadRequest("Endpoint and connectionId are required.");
            }

            if (imageFile == null || imageFile.Length == 0)
            {
                return BadRequest("Image file is required.");
            }

            byte[] imageBytes;
            using (var memoryStream = new MemoryStream())
            {
                await imageFile.CopyToAsync(memoryStream);
                imageBytes = memoryStream.ToArray();
            }

            _ = Task.Run(() => _agentService.GetDescriptionFromImage(imageBytes, endpoint, connectionId));

            return Ok();
        }
    }
}
