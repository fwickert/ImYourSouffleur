using System.IO;
using System.Threading.Tasks;

namespace ImYourSouffleur.Server.Services
{
    public class ReportService
    {
        private readonly string _dataDirectory = "Data";
       

        public async Task<string> GetReport()
        {
            var filePath = Path.Combine(_dataDirectory, $"Rapport.md");
            if (!File.Exists(filePath))
            {
                return null;
            }

            return await File.ReadAllTextAsync(filePath);
        }

        public async Task<string> GetFilledReport()
        {
            var filePath = Path.Combine(_dataDirectory, $"FilledReport.md");
            if (!File.Exists(filePath))
            {
                return null;
            }

            return await File.ReadAllTextAsync(filePath);
        }

        public async Task<string> GetImageDescription()
        {
            var filePath = Path.Combine(_dataDirectory, $"ImageDescription.md");
            if (!File.Exists(filePath))
            {
                return null;
            }

            return await File.ReadAllTextAsync(filePath);
        }

    }
}
