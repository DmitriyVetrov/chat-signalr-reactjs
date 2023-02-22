using Welcome.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;

namespace Welcome.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        [HttpGet("Admins")]
        [Authorize]
        public IActionResult AdminsEndpoint()
        {
            var currentUser = GetCurrentUser();

            return Ok($"Hi {currentUser.FullName}, you are an {currentUser.Id}");
        }

        [HttpPost("Check")]
        public IActionResult CheckEmail([FromBody] CheckModel model)
        {
            if (model.Email == "bill.gates@microsoft.com")
            {
                return Ok(new { Found = true, FullName = "Bill Gates" });
            }

            return Ok(new { Found = false });
        }

        private AgentInfo GetCurrentUser()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;

            if (identity != null)
            {
                var userClaims = identity.Claims;

                return new AgentInfo
                {
                    Id = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.NameIdentifier)?.Value,
                    ProviderId = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.UserData)?.Value,
                    FullName = userClaims.FirstOrDefault(o => o.Type == ClaimTypes.Name)?.Value
                };
            }
            return null;
        }
    }

    public class CheckModel
    {
        public string Email { get; set; }
    }

}
