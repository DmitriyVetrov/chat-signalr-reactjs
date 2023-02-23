using Welcome.Api.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Welcome.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : Controller
    {
        [HttpPost("Check")]
        public IActionResult CheckEmail([FromBody] CheckModel model)
        {
            if (model.Email == "bill.gates@microsoft.com")
            {
                return Ok(new { Found = true, FullName = "Bill Gates" });
            }

            return Ok(new { Found = false });
        }

        private AgentInfo? GetCurrentUser()
        {
            if (HttpContext.User.Identity is not ClaimsIdentity identity) return null;

            var userClaims = identity.Claims.ToArray();

            return new AgentInfo
            {
                Id = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.NameIdentifier)?.Value,
                ProviderId = long.TryParse(userClaims.FirstOrDefault(o => o.Type == ClaimTypes.UserData)?.Value, out long parsedId) ? parsedId : 0,
                FullName = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.Name)?.Value
            };
        }
    }

    public class CheckModel
    {
        public string? Email { get; set; }
    }

}
