namespace Welcome.Api.Models
{
    public class UserConnection
    {
        public UserConnection(string connectionId, string ipAdress = "", string browserName = "", bool isTechConnection = false) {
            ConnectionId = connectionId;
            IpAdress = ipAdress;
            BrowserName = browserName;
            IsTechConnection = isTechConnection;
        }
        public UserConnection() { }

        public string ConnectionId { get; set; }
        public string IpAdress { get; set; }
        public string BrowserName { get; set; }
        public bool IsTechConnection { get; set; }
    }
}
