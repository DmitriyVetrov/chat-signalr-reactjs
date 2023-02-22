using System.Collections.Generic;
using System.Linq;

namespace Welcome.Api.Models
{
    public class AgentInfo
    {
        public AgentInfo(Agent agent, string connectionId = "", string ipAddress = "", string browserName = "", bool isTechConnection = false)
        {
            FullName = agent.FullName;
            ProviderId = agent.ProviderId;
            AvatarImage = agent.AvatarImage;
            Id = agent.Id;
            Connections = string.IsNullOrEmpty(connectionId) 
                ? new List<UserConnection>() 
                : new List<UserConnection>() { new UserConnection (connectionId, ipAddress, browserName, isTechConnection) };
            MyRooms = new List<Room>();
        }

        public AgentInfo(string userName, string providerId, string memberId)
        {
            FullName = userName;
            ProviderId = providerId;
            Id = memberId;
            Connections = new List<UserConnection>();
            MyRooms = new List<Room>();
        }

        public AgentInfo() {
            Connections = new List<UserConnection>();
            MyRooms = new List<Room>();
        }

        public string FullName { get; set; }

        public string ProviderId { get; set; }

        public string Id { get; set; }

        public string AvatarImage { get; set; }

        // key: messages from agentId
        // value: count of the unread messages
        public Dictionary<string, int> UnreadMessages { get; set; } = new Dictionary<string, int>();
        public IEnumerable<UnreadMessage> GetUnreadMessages => UnreadMessages.Select(s=> new UnreadMessage { FromId = s.Key, Count = s.Value}).ToList();

        public void IncreaseUnreadMeesagesCount(string agentId) {
            if (UnreadMessages.ContainsKey(agentId)) 
            {
                UnreadMessages[agentId] += 1; 
            } else {
                UnreadMessages.Add(agentId, 1);
            }
        }

        public List<UserConnection> Connections { get;set;}
        public string[] ConnectionIds => Connections.Select(s => s.ConnectionId).ToArray();

        public void AddConnection(string connectionId, string ipAddress = "", string browserName = "", bool isTechConnection = false)
        {
            Connections.Add(new UserConnection(connectionId, ipAddress, browserName, isTechConnection));
        }

        public List<Room> MyRooms { get; set; }
    }
}
