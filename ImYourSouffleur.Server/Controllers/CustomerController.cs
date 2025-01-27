using ImYourSouffleur.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace ImYourSouffleur.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomerController(CustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetCustomerById(string customerId, [FromQuery] string endpoint)
        {
            var customer = await _customerService.GetCustomerById(customerId, endpoint);
            if (customer == null)
            {
                return NotFound();
            }
            return Ok(customer);
        }
    }
}
