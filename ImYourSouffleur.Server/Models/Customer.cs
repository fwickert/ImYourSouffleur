using System.Text.Json.Serialization;

public class Address
{
    [JsonPropertyName("street")]
    public string Street { get; set; }

    [JsonPropertyName("city")]
    public string City { get; set; }

    [JsonPropertyName("state")]
    public string State { get; set; }

    [JsonPropertyName("zipCode")]
    public string ZipCode { get; set; }

    [JsonPropertyName("country")]
    public string Country { get; set; }
}

public class Item
{
    [JsonPropertyName("productId")]
    public string ProductId { get; set; }

    [JsonPropertyName("productName")]
    public string ProductName { get; set; }

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("price")]
    public double Price { get; set; }
}

public class Purchase
{
    [JsonPropertyName("purchaseId")]
    public string PurchaseId { get; set; }

    [JsonPropertyName("date")]
    public DateTime Date { get; set; }

    [JsonPropertyName("items")]
    public List<Item> Items { get; set; }

    [JsonPropertyName("totalAmount")]
    public double TotalAmount { get; set; }
}

public class ServiceHistory
{
    [JsonPropertyName("serviceId")]
    public string ServiceId { get; set; }

    [JsonPropertyName("date")]
    public DateTime Date { get; set; }

    [JsonPropertyName("issue")]
    public string Issue { get; set; }

    [JsonPropertyName("resolution")]
    public string Resolution { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }
}

public class Customer
{
    [JsonPropertyName("customerId")]
    public string CustomerId { get; set; }

    [JsonPropertyName("company")]
    public string Company { get; set; }

    [JsonPropertyName("firstName")]
    public string FirstName { get; set; }

    [JsonPropertyName("lastName")]
    public string LastName { get; set; }

    [JsonPropertyName("email")]
    public string Email { get; set; }

    [JsonPropertyName("phone")]
    public string Phone { get; set; }

    [JsonPropertyName("address")]
    public Address Address { get; set; }

    [JsonPropertyName("purchaseHistory")]
    public List<Purchase> PurchaseHistory { get; set; }

    [JsonPropertyName("customerServiceHistory")]
    public List<ServiceHistory> CustomerServiceHistory { get; set; }

    [JsonPropertyName("summary")]
    public string Summary { get; set; }

    [JsonPropertyName("documentation")]
    public string Documentation { get; set; }
}
