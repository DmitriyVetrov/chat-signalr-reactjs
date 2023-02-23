//using System;
//using System.Collections.Generic;
//using System.Threading.Tasks;
//using DevSupport.Core.Data;
//using DevSupport.Support.Domain.Model.Chat;
//using DevSupport.Web.Chat.Api.Models;
//using DevSupport.Web.Utils.IdorProtection;

//namespace Welcome.Api.Infrastructure
//{
//    public interface IChatSessionService 
//    {
//        public Task Init(string roomId, Brand brand, Customer customer, long assignedToId, string title);
//        public Task Init(string roomId, Brand brand, Customer customer, string assignedToId, string title);
//        public Task AddReply(string roomId, string message, string fullName, bool isCustomer = false, long memberId = 0);
//        public Task CloseAndSaveToDb(string connectionId);
//    }

//    public class ChatSessionService : IChatSessionService
//    {
//        private readonly IDataContext _dataContext;
//        private readonly IDictionary<string, ChatSession> _chatSessions;

//        public ChatSessionService(IDataContext dataContext)
//        {
//            _chatSessions = new Dictionary<string, ChatSession>();
//            _dataContext = dataContext;
//        }

//        public async Task Init(string roomId, Brand brand, Customer customer, string assignedToId, string title)
//        {
//            await Init(roomId, brand, customer, long.TryParse(assignedToId, out var aid) ? aid : 0, title);
//        }

//        public async Task Init(string roomId, Brand brand, Customer customer, long assignedToId, string title)
//        {
//            var chatSession = new ChatSession {
//                AssignedToId = assignedToId,
//                Body = title,
//                ChatSettingsId = 1,
//                BrandId = long.TryParse(brand.Id, out var bid) ? bid : 0,
//                ProviderId = customer.ProviderId,
//                Submitter_EmailAddress = customer.Email,
//                Submitter_FullName = customer.FullName,
//                Submitter_MemberId = customer.Id.ToServerSideModel<long>(),
//                DateCreated = DateTime.UtcNow, 
//                DateEnded = DateTime.UtcNow
//            };

//            await _dataContext.DataWriter.SaveAsync(chatSession);
//            _chatSessions[roomId] = chatSession;
//        }

//        public Task AddReply(string roomId, string message, string fullName, bool isCustomer = false, long submitterId = 0)
//        {
//            if (_chatSessions.TryGetValue(roomId, out var chatSession))
//            {
//                var chatEntry = new ChatEntry { 
//                    DateCreated = DateTime.UtcNow, 
//                    Body = message,
//                    IsCustomer = isCustomer, 
//                    ProviderId = chatSession.ProviderId, 
//                    Submitter_FullName = fullName, 
//                    Submitter_MemberId = submitterId,
//                    ChatSessionId = chatSession.Id
//                };
//                return _dataContext.DataWriter.SaveAsync(chatEntry);
//            }

//            return Task.CompletedTask;
//        }

//        public async Task CloseAndSaveToDb(string connectionId)
//        {
//            if (_chatSessions.TryGetValue(connectionId, out ChatSession chatSession))
//            {
//                chatSession.DateEnded = DateTime.UtcNow;
//                await _dataContext.DataWriter.SaveAsync(chatSession);

//                //await _dataContext.DataWriter.SaveAsync(chatSession.Replies.FirstOrDefault());
//                //foreach (var r in chatSession.Replies) 
//                //{
//                //    await _dataContext.DataWriter.SaveAsync(r);
//                //}
//            }
//        }
//    }
//}