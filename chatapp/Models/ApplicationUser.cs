using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace chatapp.Models
{
    public class ApplicationUser: IdentityUser
    {
        public DateTime lastActiveTime { get; set; }
        public string profilepicLocation { get; set; }
    }
}
