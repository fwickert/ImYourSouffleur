using System.Text.Json.Serialization;

namespace ImYourSouffleur.Server.Models
{
    public class Appointment
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; }

        [JsonPropertyName("start")]
        public DateTime Start { get; set; }

        [JsonPropertyName("end")]
        public DateTime End { get; set; }

        [JsonPropertyName("persona")]
        public string Persona { get; set; }

        [JsonPropertyName("username")]
        public string Username { get; set; }

        [JsonPropertyName("customerId")]
        public string CustomerId { get; set; }
    }

}