using System;
using System.IO;
using System.Text.Json;
using ImYourSouffleur.Server.Models;

namespace ImYourSouffleur.Server.Services
{
    public class CustomerService
    {
        private readonly string _dataDirectory = "Data";

        public Customer GetCustomerById(string customerId)
        {
            var filePath = Path.Combine(_dataDirectory, $"Customer{customerId}.json");

            if (!File.Exists(filePath))
            {
                return null;
            }

            var json = File.ReadAllText(filePath);
            var customer = JsonSerializer.Deserialize<Customer>(json);

            return customer;
        }
    }
}
