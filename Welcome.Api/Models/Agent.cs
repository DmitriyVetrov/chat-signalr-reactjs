using System.Collections.Generic;
using System.Linq;

namespace Welcome.Api.Models
{
    public class Agent
    {
        public string FullName { get; set; }

        public long ProviderId { get; set; }

        public string Id { get; set; }

        public string AvatarImage { get; set; }

        public string Phone { get; set; }

        public string Email { get; set; }
    }
}
