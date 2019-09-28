using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace chatapp.Models
{
    public class AnonymousUser
    {
        public string ID { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public string Phone { get; set; }
        public string IP { get; set; }
        public string Email { get; set; }
        public string Site { get; set; }
        public string connectionID { get; set; }
        public string country { get; set; }
        public string city { get; set; }
        public string profilepicLocation { get; set; }
        public DateTime LastActiveTime { get; set; }
        public bool isActive { get; set; }
        public bool seenByUser { get; set; }
        public bool seenByAnonymUser { get; set; }
        public string lastmsgID { get; set; }
        public DateTime lastmsgTime { get; set; }
    }
}
