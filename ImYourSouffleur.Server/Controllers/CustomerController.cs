using Microsoft.AspNetCore.Mvc;
using ImYourSouffleur.Server.Models;
using ImYourSouffleur.Server.Services;

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
        public IActionResult GetCustomerById(string customerId)
        {
            var customer = _customerService.GetCustomerById(customerId);
            if (customer == null)
            {
                return NotFound();
            }
            //sleep
            System.Threading.Thread.Sleep(1000);
            return Ok(customer);
        }
    }
}
