namespace Welcome.Api.Models
{
    public class LoginModel
    {
        public string UserName { get; set; }
        public string ProviderId { get; set; }
        public string MemberId { get; set; }
        public string AvatarImage { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Token { get; set; }
    }
}