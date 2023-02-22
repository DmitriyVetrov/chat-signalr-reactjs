using Welcome.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Welcome.Api.Hubs
{
    public class ChatHub : Hub
    {
        private readonly string _botUser;
        private readonly IDictionary<string, AgentInfo> _agentConnections;
        private readonly IDictionary<string, CustomerInfo> _customerConnections;

        private const string providerRoomPrefix = "Internal_Chat_";

        public ChatHub(IDictionary<string, AgentInfo> agentConnections, IDictionary<string, CustomerInfo> customerConnections)
        {
            _botUser = "Bot chat";
            _agentConnections = agentConnections;
            _customerConnections = customerConnections;
        }

        [Authorize]
        public async Task SignInAgent(string ipAddress = "", string browserName = "", bool isTechConnection = false)
        {
            var agent = GetCurrentAgent();

            if (_agentConnections.TryGetValue(Context.UserIdentifier, out var agentInfo))
            {
                agentInfo.AddConnection(Context.ConnectionId, ipAddress, browserName, isTechConnection);
            }
            else
            {
                _agentConnections[agent.Id] = new AgentInfo(agent, Context.ConnectionId, ipAddress, browserName, isTechConnection);
            }

            var providerRoom = providerRoomPrefix + agent.ProviderId;

            await Clients.Caller.SendAsync("AgentIsAssigned", new JoinResult { Success = true, Agent = agent });
            await Groups.AddToGroupAsync(Context.ConnectionId, providerRoom);

            await Clients.Group(providerRoom).SendAsync("ReceiveMessage", providerRoom, _botUser, $"{agent.FullName} is joined");

            // Add agent to the General Chat room
            if (!_agentConnections[agent.Id].MyRooms.Any(a => a.Id == providerRoom))
            {
                _agentConnections[agent.Id].MyRooms.Add(new Room { Id = providerRoom });
            }

            await RefreshAgentsInProviderRoomAsync(agent.ProviderId);

            KeyValuePair<string, CustomerInfo> userInQueue = _customerConnections.FirstOrDefault(f => string.IsNullOrEmpty(f.Value.AgentId) && f.Value.Customer.ProviderId == agent.ProviderId);
            if (!string.IsNullOrEmpty(userInQueue.Key))
            {
                var userRoom = new Room
                {
                    Id = $"Chat_With_{userInQueue.Key}",
                    Brand = userInQueue.Value.Brand,
                    Customer = userInQueue.Value.Customer
                };

                _customerConnections[userInQueue.Key].AgentId = agent.Id;

                AddConnectionsToGroupAsync(userRoom.Id, Context.ConnectionId, userInQueue.Key);

                await Clients.Client(userInQueue.Key).SendAsync("ReceiveMessage", userRoom.Id, _botUser, $"Agent {agent.FullName} is here to chat with you");
                await Clients.Client(userInQueue.Key).SendAsync("PendingChat", false);

                // Add joined agent to the anonymous room
                _agentConnections[agent.Id].MyRooms.Add(userRoom);
            }

            await Clients.User(agent.Id).SendAsync("MyRooms", _agentConnections[agent.Id].MyRooms);
        }

        public async Task SendMessageToRoom(string userName, string message, string roomId)
        {
            var currentAgent = GetCurrentAgent();
            foreach (var agent in _agentConnections.Values.Where(w => w.Id != currentAgent.Id))
            {
                if (_agentConnections.ContainsKey(agent.Id))
                {
                    _agentConnections[agent.Id].IncreaseUnreadMeesagesCount(roomId);
                    await Clients.User(agent.Id).SendAsync("RefreshUnreadDirectMessagesCounters", _agentConnections[agent.Id].GetUnreadMessages);
                }
            }

            await Clients.Group(roomId).SendAsync("ReceiveMessage", roomId, userName, message, Context.ConnectionId, currentAgent?.AvatarImage);
        }

        [Authorize]
        public async Task SendDirectMessage(string message, string toAgentId)
        {
            var fromAgent = GetCurrentAgent();
            await Clients.User(toAgentId).SendAsync("ReceiveDirectMessage", message, fromAgent.FullName, fromAgent.Id, toAgentId, fromAgent.AvatarImage);
            await Clients.User(fromAgent.Id).SendAsync("ReceiveDirectMessage", message, "me", fromAgent.Id, toAgentId);

            if (_agentConnections.ContainsKey(toAgentId))
            {
                _agentConnections[toAgentId].IncreaseUnreadMeesagesCount(fromAgent.Id);
                await Clients.User(toAgentId).SendAsync("RefreshUnreadDirectMessagesCounters", _agentConnections[toAgentId].GetUnreadMessages);
            }
        }

        //public async Task SendIpAddress(string ipAddress)
        //{
        //    if (_customerConnections.ContainsKey(Context.ConnectionId))
        //    {
        //        _customerConnections[Context.ConnectionId].Customer.IpAddress= ipAddress;
        //    }
        //    var roomId = "Chat_With_" + Context.ConnectionId;
        //    await Clients.Group(roomId).SendAsync("ReceiveIpAddress", roomId, ipAddress);
        //}

        public async Task RequestChat(string message, Customer customer, Brand brand)
        {
            customer.ConnectionId = Context.ConnectionId;
            // Add chat requestor to connections dict
            _customerConnections.TryAdd(Context.ConnectionId, new CustomerInfo(customer, brand));

            var userRoom = new Room
            {
                Id = "Chat_With_" + Context.ConnectionId,
                Brand = brand,
                Customer = customer
            };
            // Find more or lesss free agent for chat
            KeyValuePair<string, AgentInfo> agent = _agentConnections.Where(w => w.Value.ProviderId == customer.ProviderId).OrderBy(o => o.Value.MyRooms.Count()).FirstOrDefault();
            if (string.IsNullOrEmpty(agent.Key))
            {
                await Clients.Caller.SendAsync("ReceiveMessage", userRoom.Id, _botUser, "No agents are available right now. Please try again later.");
                return;
            }

            // Set relation: User chatting with Agent
            _customerConnections[customer.ConnectionId].AgentId = agent.Key;

            await Clients.Caller.SendAsync("ReceiveMessage", userRoom.Id, _botUser, $"Agent {agent.Value.FullName} is here to chat with you");
            await Clients.Caller.SendAsync("PendingChat", false);

            // Add chat requestor to chat with agent AND less buzy agent to chat with chat requestor
            AddConnectionsToGroupAsync(userRoom.Id, customer.ConnectionId);
            AddConnectionsToGroupAsync(userRoom.Id, agent.Value.ConnectionIds);

            // Add chat to agent's ChatWith list
            // and notify the agent about rooms where he is 
            _agentConnections[agent.Key].MyRooms.Add(userRoom);
            await Clients.User(agent.Key).SendAsync("MyRooms", _agentConnections[agent.Key].MyRooms);

            await Clients.Group(userRoom.Id).SendAsync("ReceiveMessage", userRoom.Id, customer.FullName, message, customer.ConnectionId);
        }

        // room has format: "Chat_With_" + ConnectionId
        public async Task CloseRoom(string roomId)
        {
            var agent = GetCurrentAgent();
            var userConnectionId = roomId.Substring(roomId.Length - 22);
            if (_agentConnections.TryGetValue(agent.Id, out var agentInfo) && !string.IsNullOrEmpty(userConnectionId))
            {
                await Clients.Client(userConnectionId).SendAsync("ReceiveMessage", roomId, _botUser, $"Agent {agentInfo.FullName} has closed the conversation");
                await Clients.Client(userConnectionId).SendAsync("PendingChat", true);
                _customerConnections.Remove(userConnectionId);
                RemoveConnectionsFromGroupAsync(roomId, userConnectionId, Context.ConnectionId);
                agentInfo.MyRooms.RemoveAll(r => r.Id == roomId);
                await Clients.User(agent.Id).SendAsync("MyRooms", agentInfo.MyRooms);
            }
        }

        // room has format: "Chat_With_" + ConnectionId
        public async Task AskToSignIn(string roomId)
        {
            var userConnectionId = roomId.Substring(roomId.Length - 22);
            await Clients.Client(userConnectionId).SendAsync("AskToSignIn");
        }

        public override Task OnConnectedAsync()
        {
            System.Diagnostics.Debug.WriteLine(Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            if (_agentConnections.TryGetValue(Context.UserIdentifier ?? "", out var agentInfo))
            {
                var providerRoom = providerRoomPrefix + agentInfo.ProviderId;
                agentInfo.Connections.RemoveAll(c => c.ConnectionId == Context.ConnectionId);
                if (agentInfo.Connections.Count == 0)
                {
                    Clients.Group(providerRoom).SendAsync("ReceiveMessage", providerRoom, _botUser, $"{agentInfo.FullName} has left");
                    _agentConnections.Remove(Context.UserIdentifier);
                }
                RefreshAgentsInProviderRoomAsync(agentInfo.ProviderId);

                foreach (var room in agentInfo.MyRooms)
                {
                    if (room.Id.Contains(providerRoomPrefix))
                    {
                        continue;
                    }
                    // Set info that user is pending to chat with available agent
                    _customerConnections[room.Customer.ConnectionId].AgentId = "";
                    Clients.Client(room.Customer.ConnectionId).SendAsync("PendingChat", true);

                    if (agentInfo.Connections.Count == 0)
                    {
                        // Notification that agent has left
                        Clients.Group(room.Id).SendAsync("ReceiveMessage", room.Id, _botUser, $"{agentInfo.FullName} has left");
                    }
                    agentInfo.MyRooms = new List<Room>();
                    RemoveConnectionsFromGroupAsync(room.Id, Context.ConnectionId, room.Customer.ConnectionId);
                }
            }

            if (_customerConnections.TryGetValue(Context.ConnectionId, out var customer))
            {
                _customerConnections.Remove(Context.ConnectionId);
                if (_agentConnections.TryGetValue(customer.AgentId, out var agentConnection))
                {
                    agentConnection.MyRooms.RemoveAll(r => r.Customer.ConnectionId == Context.ConnectionId);
                    Clients.User(customer.AgentId).SendAsync("MyRooms", _agentConnections[customer.AgentId].MyRooms);
                }

                var roomId = $"Chat_With_{Context.ConnectionId}";
                Clients.Client(roomId).SendAsync("ReceiveMessage", roomId, _botUser, $"{Context.ConnectionId} has left");

                RemoveConnectionsFromGroupAsync(roomId, Context.ConnectionId);
                if (_agentConnections.TryGetValue(customer.AgentId, out var agnt))
                {
                    RemoveConnectionsFromGroupAsync(roomId, agnt.ConnectionIds);
                }

            }

            return base.OnDisconnectedAsync(exception);
        }

        private Task RefreshAgentsInProviderRoomAsync(string providerId)
        {
            var agents = _agentConnections.Values
                .Where(w => w.ProviderId == providerId)
                .OrderBy(o => o.FullName).ToList();
            //.Select(s => new Agent { Id = s.Id, AvatarImage = s.AvatarImage, FullName = s.FullName }).ToList();
            return Clients.Group(providerRoomPrefix + providerId).SendAsync("AgentsInProviderRoom", agents);
        }

        public async Task CleanUnreadDirectMessagesCounters(string fromAgentId)
        {
            var agent = GetCurrentAgent();

            if (_agentConnections.ContainsKey(agent.Id) && _agentConnections[agent.Id].UnreadMessages.ContainsKey(fromAgentId))
            {
                _agentConnections[agent.Id].UnreadMessages[fromAgentId] = 0;
                await Clients.User(agent.Id).SendAsync("RefreshUnreadDirectMessagesCounters", _agentConnections[agent.Id].GetUnreadMessages);
            }
        }

        private void RemoveConnectionsFromGroupAsync(string group, params string[] connections)
        {
            foreach (var conId in connections)
            {
                Groups.RemoveFromGroupAsync(conId, group);
            }
        }

        private void AddConnectionsToGroupAsync(string group, params string[] connections)
        {
            foreach (var conId in connections)
            {
                Groups.AddToGroupAsync(conId, group);
            }
        }

        private Agent GetCurrentAgent()
        {
            var identity = Context.User.Identity as ClaimsIdentity;
            if (identity != null)
            {
                var userClaims = identity.Claims;

                return new Agent
                {
                    FullName = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.Name)?.Value,
                    ProviderId = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.UserData)?.Value,
                    Id = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.NameIdentifier)?.Value,
                    AvatarImage = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.Thumbprint)?.Value,
                };
            }
            return null;
        }
    }
}