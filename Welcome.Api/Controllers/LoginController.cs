using Welcome.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Welcome.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LoginController : ControllerBase
    {
        private IConfiguration _config;


        public LoginController(IConfiguration config)
        {
            _config = config;
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Login([FromBody] LoginModel login)
        {
            var user = Authenticate(login);

            if (user != null)
            {
                var token = Generate(login);
                return Ok(new { Token = token });
            }

            return NotFound("User not found");
        }

        private string Generate(LoginModel login)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, login.MemberId),
                new Claim(ClaimTypes.Name, login.UserName),
                new Claim(ClaimTypes.UserData, login.ProviderId),
                new Claim(ClaimTypes.Thumbprint, login.AvatarImage ?? "")
            };

            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
              _config["Jwt:Audience"],
              claims,
              expires: DateTime.Now.AddMinutes(15),
              signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private AgentInfo Authenticate(LoginModel login)
        {
            return new AgentInfo { ProviderId = login.ProviderId, Id = login.MemberId, FullName = login.UserName };
            //var currentUser = UserConstants.Users.FirstOrDefault(o => o.UserName.ToLower() == login.UserName.ToLower());

            //if (currentUser != null)
            //{
            //    return currentUser;
            //}

            //return null;
        }
    }
}
