using Welcome.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using System.Diagnostics;
using Newtonsoft.Json;

namespace Welcome.Api.Hubs
{
    public class ChatHub : Hub
    {
        private readonly object pendingConnectionsLock = new object();
        private readonly string _botUser;
        private readonly IDictionary<string, AgentInfo> _agentConnections;
        private readonly IDictionary<string, CustomerInfo> _customerConnections;

        private const string providerRoomPrefix = "Internal_Chat_";
        private string providerRoom => providerRoomPrefix + currentAgent.ProviderId;

        public ChatHub(IDictionary<string, AgentInfo> agentConnections, IDictionary<string, CustomerInfo> customerConnections)
        {
            _botUser = "Bot chat";
            _agentConnections = agentConnections;
            _customerConnections = customerConnections;
        }

        [Authorize]
        public async Task SignInAgent(string ipAddress = "", string browserName = "", bool isTechConnection = false)
        {
            if (Context.UserIdentifier != null && _agentConnections.TryGetValue(Context.UserIdentifier, out var agentInfo))
            {
                agentInfo.AddConnection(Context.ConnectionId, ipAddress, browserName, isTechConnection);
            }
            else
            {
                _agentConnections[currentAgent.Id] = new AgentInfo(currentAgent, Context.ConnectionId, ipAddress, browserName, isTechConnection);
            }

            await Clients.Caller.SendAsync("AgentIsSignedIn", currentAgent);
            await Groups.AddToGroupAsync(Context.ConnectionId, providerRoom);
            await Clients.GroupExcept(providerRoom, new string[] { Context.ConnectionId }).SendAsync("ReceiveMessage", providerRoom, _botUser, $"{currentAgent.FullName} is on-line");

            // Add agent to the General Chat room
            if (!_agentConnections[currentAgent.Id].MyRooms.Any(a => a.Id == providerRoom))
            {
                _agentConnections[currentAgent.Id].MyRooms.Add(new Room { Id = providerRoom });
            }

            RefreshAgentsInProviderRoomAsync();

            KeyValuePair<string, CustomerInfo> userInQueue = _customerConnections.FirstOrDefault(f => string.IsNullOrEmpty(f.Value.AgentId) && f.Value.Customer.ProviderId == currentAgent.ProviderId);
            if (!string.IsNullOrEmpty(userInQueue.Key))
            {
                var userRoom = new Room
                {
                    Id = $"Chat_With_{userInQueue.Key}",
                    Brand = userInQueue.Value.Brand,
                    Customer = userInQueue.Value.Customer
                };

                _customerConnections[userInQueue.Key].AgentId = currentAgent.Id;

                AddConnectionsToGroupAsync(userRoom.Id, Context.ConnectionId, userInQueue.Key);

                await Clients.Client(userInQueue.Key).SendAsync("ReceiveMessage", userRoom.Id, _botUser, $"Agent {currentAgent.FullName} is here to chat with you");
                await Clients.Client(userInQueue.Key).SendAsync("PendingChat", false);

                // Add joined agent to the anonymous room
                _agentConnections[currentAgent.Id].MyRooms.Add(userRoom);
            }

            await Clients.User(currentAgent.Id).SendAsync("MyRooms", _agentConnections[currentAgent.Id].MyRooms);
        }

        public async Task RequestChat(string message, Customer customer, Brand brand)
        {
            if (string.IsNullOrEmpty(customer.FullName)) return;

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

            await Clients.Group(userRoom.Id).SendAsync("ReceiveMessage", userRoom.Id, customer.FullName, message, customer.ConnectionId, customer.AvatarImage);
        }

        public async Task SendMessageToRoom(string userName, string message, string roomId)
        {
            foreach (var agent in _agentConnections.Values.Where(w => w.Id != currentAgent.Id))
            {
                if (_agentConnections.ContainsKey(agent.Id))
                {
                    _agentConnections[agent.Id].IncreaseUnreadMeesagesCount(roomId);
                    await Clients.User(agent.Id).SendAsync("RefreshUnreadDirectMessagesCounters", _agentConnections[agent.Id].GetUnreadMessages);
                }
            }
            var avatarImage = currentAgent?.AvatarImage;
            if (_customerConnections.TryGetValue(Context.ConnectionId, out var customerInfo))
            {
                if (string.IsNullOrEmpty(avatarImage))
                {
                    avatarImage = customerInfo.Customer.AvatarImage;
                }
            }

            await Clients.Group(roomId).SendAsync("ReceiveMessage", roomId, userName, message, Context.ConnectionId, avatarImage);
        }

        [Authorize]
        public async Task SendDirectMessage(string message, string toAgentId)
        {
            await Clients.User(toAgentId).SendAsync("ReceiveDirectMessage", message, currentAgent.FullName, currentAgent.Id, toAgentId, currentAgent.AvatarImage);
            await Clients.User(currentAgent.Id).SendAsync("ReceiveDirectMessage", message, "me", currentAgent.Id, toAgentId);

            if (_agentConnections.ContainsKey(toAgentId))
            {
                _agentConnections[toAgentId].IncreaseUnreadMeesagesCount(currentAgent.Id);
                await Clients.User(toAgentId).SendAsync("RefreshUnreadDirectMessagesCounters", _agentConnections[toAgentId].GetUnreadMessages);
            }
        }

        // room has format: "Chat_With_" + ConnectionId
        public async Task CloseRoom(string roomId)
        {
            var userConnectionId = roomId.Substring(roomId.Length - 22);
            if (_agentConnections.TryGetValue(currentAgent.Id, out var agentInfo) && !string.IsNullOrEmpty(userConnectionId))
            {
                await Clients.Client(userConnectionId).SendAsync("ReceiveMessage", roomId, _botUser, $"Agent {agentInfo.FullName} has closed the conversation");
                await Clients.Client(userConnectionId).SendAsync("PendingChat", true);
                _customerConnections.Remove(userConnectionId);
                RemoveConnectionsFromGroupAsync(roomId, userConnectionId, Context.ConnectionId);
                agentInfo.MyRooms.RemoveAll(r => r.Id == roomId);
                await Clients.User(currentAgent.Id).SendAsync("MyRooms", agentInfo.MyRooms);
            }
        }

        private void RefreshAgentsInProviderRoomAsync()
        {
            if (_agentConnections.Count > 0)
            {
                List<AgentInfo> agents = _agentConnections.Values.Where(w => w.ProviderId == currentAgent.ProviderId).OrderBy(o => o.FullName).ToList();

                Clients.Group(providerRoom).SendAsync("AgentsInProviderRoom", agents);
            }
        }

        public async Task CleanUnreadDirectMessagesCounters(string fromAgentId)
        {
            if (_agentConnections.ContainsKey(currentAgent.Id) && _agentConnections[currentAgent.Id].UnreadMessages.ContainsKey(fromAgentId))
            {
                _agentConnections[currentAgent.Id].UnreadMessages[fromAgentId] = 0;
                await Clients.User(currentAgent.Id).SendAsync("RefreshUnreadDirectMessagesCounters", _agentConnections[currentAgent.Id].GetUnreadMessages);
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

        private Agent currentAgent
        {
            get
            {
                var identity = Context.User.Identity as ClaimsIdentity;
                if (identity != null)
                {
                    var userClaims = identity.Claims;
                    var providerId = long.TryParse(userClaims.FirstOrDefault(o => o.Type == ClaimTypes.UserData)?.Value, out long res) ? res : 0;
                    return new Agent
                    {
                        FullName = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.Name)?.Value,
                        ProviderId = providerId,
                        Id = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.NameIdentifier)?.Value,
                        AvatarImage = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.Thumbprint)?.Value,
                        Email = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.Email)?.Value,
                        Phone = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.MobilePhone)?.Value,
                    };
                }
                return new Agent();
            }
        }

        #region Lifetime Events

        public override Task OnConnectedAsync()
        {
            // get relative client info from headers
            var connectedInfo = new Dictionary<string, string>() {
                { "Host", Context.GetHttpContext().Request.Headers["Host"] },
                { "UserAgent", Context.GetHttpContext().Request.Headers["User-Agent"] },
                { "Real-IP", Context.GetHttpContext().Request.Headers["X-Real-IP"] },
                { "Forward-For", Context.GetHttpContext().Request.Headers["X-Forwarded-For"] }
            };
            Debug.WriteLine($"Info: {JsonConvert.SerializeObject(connectedInfo)}");

            // Anonymouses connection handler only
            if (Context.UserIdentifier == null)
            {
                // Not implemented
            }
            // Agent's connection handler only
            else
            {
                Task.Run(() => SignInAgent(connectedInfo["Host"], connectedInfo["UserAgent"])).Wait();
            }
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            if (_agentConnections.TryGetValue(Context.UserIdentifier ?? "", out var agentInfo))
            {
                lock (pendingConnectionsLock)
                {
                    agentInfo.Connections.RemoveAll(c => c.ConnectionId == Context.ConnectionId);
                }
                if (agentInfo.Connections.Count == 0)
                {
                    Clients.Group(providerRoom).SendAsync("ReceiveMessage", providerRoom, _botUser, $"{agentInfo.FullName} is offline");
                    if (Context.UserIdentifier != null)
                    {
                        _agentConnections.Remove(Context.UserIdentifier);
                    }
                }
                RefreshAgentsInProviderRoomAsync();

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
                        Clients.Group(room.Id).SendAsync("ReceiveMessage", room.Id, _botUser, $"{agentInfo.FullName} is offline");
                    }
                    agentInfo.MyRooms = new List<Room>();
                    RemoveConnectionsFromGroupAsync(room.Id, Context.ConnectionId, room.Customer.ConnectionId);
                }
            }

            if (_customerConnections.TryGetValue(Context.ConnectionId, out var customer))
            {
                _customerConnections.Remove(Context.ConnectionId);
                if (customer.AgentId != null && _agentConnections.TryGetValue(customer.AgentId, out var agentConnection))
                {
                    agentConnection.MyRooms.RemoveAll(r => r.Customer?.ConnectionId == Context.ConnectionId);
                    Clients.User(customer.AgentId).SendAsync("MyRooms", _agentConnections[customer.AgentId].MyRooms);
                }

                var roomId = $"Chat_With_{Context.ConnectionId}";
                Clients.Client(roomId).SendAsync("ReceiveMessage", roomId, _botUser, $"{Context.ConnectionId} has left");

                RemoveConnectionsFromGroupAsync(roomId, Context.ConnectionId);
                if (customer.AgentId != null && _agentConnections.TryGetValue(customer.AgentId, out var agnt))
                {
                    RemoveConnectionsFromGroupAsync(roomId, agnt.ConnectionIds);
                }

            }

            return base.OnDisconnectedAsync(exception);
        }

        #endregion
    }
}