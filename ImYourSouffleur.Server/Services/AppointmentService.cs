using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using ImYourSouffleur.Server.Models;

namespace ImYourSouffleur.Server.Services
{
    public class AppointmentService
    {
        private readonly string _filePath = "Data/Appointments.json";
        private readonly AgentService _agentService;

        public AppointmentService(AgentService agentService)
        {
            _agentService = agentService;
        }

        public List<Appointment?> GetAppointments(string persona)
        {
            var json = File.ReadAllText(_filePath);
            var appointments = JsonSerializer.Deserialize<List<Appointment>>(json);

            if (!string.IsNullOrEmpty(persona))
            {
                appointments = appointments?.Where(a => a.Persona.Equals(persona, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            //call process appointment
            foreach (var appointment in appointments!)
            {
                appointment.Personal = _agentService.PersonalOrNot(appointment).Result;
            }

            return appointments!;
        }
    }
}
