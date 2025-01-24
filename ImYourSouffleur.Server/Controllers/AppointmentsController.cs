using Microsoft.AspNetCore.Mvc;
using ImYourSouffleur.Server.Models;
using ImYourSouffleur.Server.Services;
using System.Collections.Generic;

namespace ImYourSouffleur.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppointmentService _appointmentService;

        public AppointmentsController(AppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet]
        public ActionResult<List<Appointment>> Get([FromQuery] string persona)
        {
            var appointments = _appointmentService.GetAppointments(persona);
            
            return Ok(appointments);
        }
    }
}
