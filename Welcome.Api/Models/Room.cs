namespace Welcome.Api.Models
{
    public class Room
    {
        public string Id { get; set; }
        public int UnreadMessages { get; set; }
        public Customer Customer { get; set; }
        public Brand Brand { get; set; }
    }
}
