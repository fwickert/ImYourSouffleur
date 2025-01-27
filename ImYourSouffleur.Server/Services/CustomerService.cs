using System.Text.Json;

namespace ImYourSouffleur.Server.Services
{
    public class CustomerService
    {
        private readonly string _dataDirectory = "Data";
        private readonly AgentService _agentService;

        public CustomerService(AgentService agentService)
        {
            _agentService = agentService;
        }

        public async Task<Customer?> GetCustomerById(string customerId, string endpoint)
        {
            var filePath = Path.Combine(_dataDirectory, $"Customer{customerId}.json");

            if (!File.Exists(filePath))
            {
                return null;
            }

            var json = File.ReadAllText(filePath);
            var customer = JsonSerializer.Deserialize<Customer>(json);


            // For each customer return the information for the system prompt of the agent
            // Resume the surface doc et the customer information to have a little context for the local

            if (customer != null)
            {
                string summary = await _agentService.GetCustomerSummary(customer, endpoint);
                customer.Summary = summary;

                string documentation = await _agentService.GetDocumentation(customer.CustomerId);
                customer.Documentation = documentation;
            }

            return customer;
        }
    }
}
