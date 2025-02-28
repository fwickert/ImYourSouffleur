using ImYourSouffleur.Server.Models;
using ImYourSouffleur.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace ImYourSouffleur.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ReportService _reportService;
        private readonly LocalAgentService _localAgentService;
        private readonly AgentService _agentService;

        public ReportController(ReportService reportService, LocalAgentService localAgentService, AgentService agentService)
        {
            _reportService = reportService;
            _localAgentService = localAgentService;
            _agentService = agentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetReport()
        {
            var report = await _reportService.GetReport();
            if (report == null)
            {
                return NotFound();
            }
            return Ok(report);
        }

        [HttpGet("Filled")]
        public async Task<IActionResult> GetFilledReport()
        {
            var report = await _reportService.GetFilledReport();
            if (report == null)
            {
                return NotFound();
            }
            return Ok(report);
        }

        //return the getimagedescription
        [HttpGet("ImageDescription")]
        public async Task<IActionResult> GetImageDescription()
        {
            var report = await _reportService.GetImageDescription();
            if (report == null)
            {
                return NotFound();
            }
            return Ok(report);
        }

        [HttpPost("Conclusion")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult PostConclusion([FromBody] Conclusion conclusion, string endpoint, string connectionId)
        {
            _ = Task.Run(() => _agentService.GetEmailSummary(conclusion.Content, endpoint, connectionId));
            return Ok();
        }


        //post and call the #LocalAgentService
        [HttpPost]
        public async Task<IActionResult> PostReport([FromBody] Transcript transcript, string connectionId)
        {

            var response = await _localAgentService.ReportWithPhiSilica(transcript.Content, transcript.CustomerInfo, connectionId);

            response = response.Replace("```json", "");
            response = response.Replace("```", "");
            response = response.Replace("'''json", "");
            response = response.Replace("'''", "");
            //deserialize the response in reportdata
            var reportData = System.Text.Json.JsonSerializer.Deserialize<ReportData>(response);

            var report = await _reportService.GetReport();
            if (report == null)
            {
                return NotFound();
            }
            DateTime date = new DateTime(2025,03,05);
            report = report.Replace("[CustomerName]", reportData!.CustomerName);
            report = report.Replace("[CustomerEmail]", reportData!.CustomerEmail);
            report = report.Replace("[CustomerPhone]", reportData!.CustomerPhone);
            report = report.Replace("[CustomerAddress]", reportData!.CustomerAddress);
            report = report.Replace("[Issue]", reportData!.Issue);
            report = report.Replace("[Date]", date.ToString("dd/MM/yyyy")); //DateTime.Today.ToString("dd/MM/yyyy"));
            report = report.Replace("[Diagnostic]", reportData!.Diagnostic);
            report = report.Replace("[Conclusion]", reportData!.Conclusion);
            report = report.Replace("[Comment]", reportData!.Comment);


            return Ok(report);
        }
    }
}
