using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Welcome.Api.Infrastructure
{
    public class NameUserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            var claims = ((ClaimsIdentity)connection.User.Identity).Claims;
            return claims.FirstOrDefault(claim => claim.Type == ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
