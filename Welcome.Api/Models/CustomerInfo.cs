namespace Welcome.Api.Models
{
    public class CustomerInfo
    {
        public CustomerInfo(Customer customer, Brand brand)
        {
            Customer = customer;
            Brand = brand;
        }

        public CustomerInfo()
        {
            Customer = new Customer();
            Brand = new Brand();
        }

        public Customer Customer { get; set; }

        public Brand Brand { get; set; }

        public string AgentId { get; set; }
    }
}
