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
    public class LoginController : Controller
    {
        private IConfiguration _configuration { get; }

        public LoginController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Login([FromBody] LoginModel login)
        {
            if (Authenticate(login))
            {
                var token = Generate(login);
                return Ok(new { Token = token });
            }

            return NotFound("User not found");
        }

        private string Generate(LoginModel login)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, login.MemberId),
                new Claim(ClaimTypes.Name, login.UserName),
                new Claim(ClaimTypes.UserData, login.ProviderId),
                new Claim(ClaimTypes.Thumbprint, login.AvatarImage ?? ""),
                new Claim(ClaimTypes.MobilePhone, login.Phone ?? ""),
                new Claim(ClaimTypes.Email, login.Email ?? "")
            };

            var token = new JwtSecurityToken(_configuration["Jwt:Issuer"],
              _configuration["Jwt:Audience"],
              claims,
              expires: DateTime.Now.AddMinutes(15),
              signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private bool Authenticate(LoginModel login)
        {
            //var token = ChatLoginVerification.GetValue(login.Token);

            return true;// token != null && token.IsValid() || token.SmartKey == "DebugKeyValue";
        }
    }
}
