using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace chatapp.Models
{
    public class ChatMessage
    {
        public string message { get; set; }
        public ChatMessageType messageType { get; set; }
        public string filename { get; set; }
        public string anonuserid { get; set; }
        public DateTime datetime { get; set; }
        public string id { get; set; }
        public string userid { get; set; }
    }
}
