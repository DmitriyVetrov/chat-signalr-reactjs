namespace Welcome.Api.Models
{
    public class Customer
    {
        public Customer()
        {
            FullName = "Unknown";
        }

        public string FullName { get; set; }
        public string Id { get; set; }
        public long ProviderId { get; set; }
        public string ConnectionId { get; set; }
        public string IpAddress { get; set; }
        public string Email { get; set; }
        public string AvatarImage { get; set; }
    }
}