namespace Welcome.Api.Models
{
    public class Customer
    {
        public Customer()
        {
            FullName = "Unknown";
        }

        public string FullName { get; set; }
        public string ProviderId { get; set; }
        public string ConnectionId { get; set; }
        public string IpAddress { get; set; }
    }
}
