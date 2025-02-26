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

        public ReportController(ReportService reportService, LocalAgentService localAgentService)
        {
            _reportService = reportService;
            _localAgentService = localAgentService;
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
            report = report.Replace("[CustomerName]", reportData!.CustomerName);
            report = report.Replace("[CustomerEmail]", reportData!.CustomerEmail);
            report = report.Replace("[CustomerPhone]", reportData!.CustomerPhone);
            report = report.Replace("[CustomerAddress]", reportData!.CustomerAddress);
            report = report.Replace("[Issue]", reportData!.Issue);
            report = report.Replace("[Date]", DateTime.Today.ToString("dd/MM/yyyy"));


            return Ok(report);
        }
    }
}
