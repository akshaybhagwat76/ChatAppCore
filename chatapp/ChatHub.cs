using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Http;
using chatapp;
using chatapp.Models;
using FreeGeoIPCore;
using System.Security.Claims;

namespace chatapp
{
    public class ChatHub : Hub
    {
        private ApplicationDbContext _dbContext;
        private UserManager<ApplicationUser> _userManager;
        private IHttpContextAccessor _accessor;

        public override Task OnConnectedAsync()
        {

            _dbContext.views.Add(new ViewsTable() { date = DateTime.Now });
            _dbContext.SaveChanges();

            return base.OnConnectedAsync();
        }
        public override Task OnDisconnectedAsync(Exception exception)
        {
            var usr = _dbContext.anonusers.Where(x => x.connectionID == Context.ConnectionId).ToList();
            if (usr.Count() != 0)
            {
                usr.First().isActive = false;
                usr.First().LastActiveTime = DateTime.Now;
                var loggedinUsers = _dbContext.singleActiveUsers.ToList();
                foreach (var loggeduser in loggedinUsers)
                {
                    Clients.Client(loggeduser.ConnectionID).SendAsync("usernotactive", usr.First().ID);
                }
            }
            else
            {
                var nuser = _dbContext.singleActiveUsers.Where(x => x.ConnectionID == Context.ConnectionId).ToList().First();
                if (_dbContext.singleActiveUsers.Count() <= 1)
                {
                    Clients.All.SendAsync("adminstatus", false);
                }
                _dbContext.Entry(nuser).State = Microsoft.EntityFrameworkCore.EntityState.Deleted;

            }
            _dbContext.SaveChanges();
            return base.OnDisconnectedAsync(exception);
        }
        public async Task deleteUser(string id)
        {
            var allusrmsg = _dbContext.chatmessage.Where(x => x.anonuserid == id);
            foreach(var msg in allusrmsg)
                _dbContext.Entry(msg).State = Microsoft.EntityFrameworkCore.EntityState.Deleted;

            var usr =_dbContext.anonusers.Find(id);
            await Clients.Caller.SendAsync("userdeleted", usr.ID);
            _dbContext.Entry(usr).State = Microsoft.EntityFrameworkCore.EntityState.Deleted;
            _dbContext.SaveChanges();

        }
        public async Task getcanneds()
        {
            await Clients.Caller.SendAsync("canneds",_dbContext.cannedResponses.ToList());
        }
        public async Task isAdminActive()
        {
            await Clients.Caller.SendAsync("adminstatus",_dbContext.singleActiveUsers.Any());
        }
        public async Task SendMessage(string message, string anonid)
        {

            var msg = new ChatMessage
            {
                messageType = ChatMessageType.Text,
                message = message,
                datetime = DateTime.UtcNow,
            };
            if (_dbContext.anonusers.Any(x => x.connectionID == Context.ConnectionId)) {
                var anon=_dbContext.anonusers.Where(x => x.connectionID == Context.ConnectionId).ToList().First();
                msg.anonuserid = anon.ID;
                anon.seenByUser = false;
            }
            else
            {
                var user = await _userManager.GetUserAsync(Context.User);
                if (user != null)
                {
                    var anon=_dbContext.anonusers.Find(anonid);
                    msg.anonuserid = anon.ID;
                    msg.userid = user.Id;
                    anon.seenByAnonymUser = false;

                }

            }
            _dbContext.chatmessage.Add(msg);
            if (_dbContext.anonusers.Any(x => x.connectionID == Context.ConnectionId))
            {
                var anon = _dbContext.anonusers.Where(x => x.connectionID == Context.ConnectionId).ToList().First();
                anon.lastmsgID = msg.id;
                anon.lastmsgTime = DateTime.Now;
                    await Clients.Group(anon.ID).SendAsync("ReceiveMessage", anon.ID, Context.ConnectionId, message, msg.id);
            }
            else
            {
                var user = await _userManager.GetUserAsync(Context.User);
                if (user != null)
                {
                    var anon = _dbContext.anonusers.Find(anonid);
                    anon.lastmsgID = msg.id;
                    anon.lastmsgTime = DateTime.Now;

                    await Clients.Group(anon.ID).SendAsync("ReceiveMessage", anonid, Context.ConnectionId, message, msg.id);
                }

            }

            _dbContext.SaveChanges();
        }
        
        public async Task AddActiveUser()
        {
            var user = await _userManager.GetUserAsync(Context.User);
            var singuser = _dbContext.singleActiveUsers.Where(x => x.userID == user.Id);
            if (singuser.Count() == 0)
            {
                var nuser = new singleActiveUser() { ConnectionID = Context.ConnectionId, userID = user.Id };
                _dbContext.singleActiveUsers.Add(nuser);
                _dbContext.SaveChanges();
            }
            else
            {
                singuser.First().ConnectionID = Context.ConnectionId;
                _dbContext.SaveChanges();
            }
            var allanonymusers = _dbContext.anonusers.ToList();
            foreach (var anonym in allanonymusers)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, anonym.ID);
            }
            await Clients.All.SendAsync("adminstatus", true);

        }
        public async Task GetAllAnonymousUserGroup()
        {
            var lusr = await _userManager.GetUserAsync(Context.User);
            if (lusr == null)
                return;
            var allanons = _dbContext.anonusers.OrderBy(x => x.lastmsgTime).ToList();
            var res = new List<grouplistresponse>();
            foreach (var anon in allanons)
            {
                res.Add(new grouplistresponse() { anonid=anon.ID,name = anon.Name, IP= anon.IP,country=anon.country,city=anon.city, newMessageseen = anon.seenByUser,lastTime= TimeAgo(anon.LastActiveTime),active=anon.isActive,email=anon.Email,phone=anon.Phone });
            }
            await Clients.Caller.SendAsync("getGroups", Newtonsoft.Json.JsonConvert.SerializeObject(res));
            await AddActiveUser();
        }
        public async Task getMessageof(string uid)
        {
            var lusr = await _userManager.GetUserAsync(Context.User);
            if (lusr == null)
                return;
            var user=_dbContext.anonusers.Find(uid);
            var msgs = _dbContext.chatmessage.Where(x => x.anonuserid == user.ID).OrderBy(x=>x.datetime).ToList();
            var res = new List<chatmessageresponse>();
            foreach(var msg in msgs)
            {
                var mess = new chatmessageresponse()
                {
                    filename = msg.filename,
                    message = msg.message,
                    id = msg.id,
                    msgType = msg.messageType,
                    seenby = new List<string>(),
                    datetime=msg.datetime,
                    userid=msg.userid,
                    anonuserid=msg.anonuserid
                };
                res.Add(mess);
            }
            await Clients.Caller.SendAsync("givengroupmessage", Newtonsoft.Json.JsonConvert.SerializeObject(res), uid);
        }
        public async Task CreateAnonChat(string name,string email,string phone)
        {
            FreeGeoIPClient ipClient = new FreeGeoIPClient();
            var ip = _accessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
            var usr = new AnonymousUser() { connectionID = Context.ConnectionId, IP = ip ,Name=name,Phone=phone,Email=email,LastActiveTime=DateTime.Now,isActive=true};
            try
            {
                FreeGeoIPCore.Models.Location location = ipClient.GetLocation(ip).Result;
                usr.country = location.CountryName;
                usr.city = location.City;
            }
            catch(Exception e)
            {
                
            }
            finally
            {
                usr.country = "-";
                usr.city = "-";
            }
            _dbContext.anonusers.Add(usr);

            _dbContext.SaveChanges();

            var loggedinUsers = _dbContext.singleActiveUsers.ToList();
            foreach (var loggeduser in loggedinUsers)
            {
                await Groups.AddToGroupAsync(loggeduser.ConnectionID, usr.ID);
                var newgrp = new grouplistresponse { city=usr.city,country=usr.country,anonid= usr.ID, IP=ip,name=usr.Name, newMessageseen = usr.seenByUser, lastTime = TimeAgo(usr.LastActiveTime), active = usr.isActive, email = usr.Email, phone = usr.Phone };
                await Clients.Client(loggeduser.ConnectionID).SendAsync("newGroup", Newtonsoft.Json.JsonConvert.SerializeObject(newgrp));
            }
            _dbContext.SaveChanges();
            await Clients.Caller.SendAsync("myid", usr.connectionID, true);
            await Groups.AddToGroupAsync(Context.ConnectionId,usr.ID);

        }

        public async Task isTyping(string userid)
        {
            await Clients.Group(userid).SendAsync("istypingres", Context.ConnectionId, userid);

        }
        public async Task stoppedTyping(string userid)
        {
            await Clients.Group(userid).SendAsync("istypingstoppedres", Context.ConnectionId, userid);
        }

        public async Task seenbyAnonym(string msg)
        {
            var usr = _dbContext.anonusers.Where(x => x.connectionID == Context.ConnectionId).First();
            if (usr.lastmsgID == msg)
            {
                _dbContext.anonusers.Where(x => x.connectionID == Context.ConnectionId).First().seenByUser = true;
                await Clients.Group(usr.ID).SendAsync("msgseenbyAnons", usr.ID, usr.lastmsgID);
            }

        }
        public async Task seenbyUser(string msg, string uid)
        {
            var lusr = await _userManager.GetUserAsync(Context.User);
            if (lusr == null)
                return;
            var usr = _dbContext.anonusers.Find(uid);
            if (usr.lastmsgID == msg)
            {
                _dbContext.anonusers.Find(uid).seenByUser = true;
                await Clients.Group(usr.ID).SendAsync("seenbyAdmin", usr.lastmsgID);

            }
        }
        public async Task Getmyid()
        {
            await Clients.Caller.SendAsync("yourid", Context.ConnectionId);
        }
        public async Task Getgrpid()
        {
            await Clients.Caller.SendAsync("Getgrpid", _dbContext.anonusers.Where(x=>x.connectionID== Context.ConnectionId).First().ID);
        }
        public async Task getMessageCount()
        {
            await Clients.Caller.SendAsync("totalmessage", _dbContext.chatmessage.Count());

        }
        public async Task getIntrudersCount()
        {
            await Clients.Caller.SendAsync("totalchats", _dbContext.anonusers.Count());
        }
        public async Task getChatsCount()
        {
            await Clients.Caller.SendAsync("totalintruders", _dbContext.anonusers.Where(x=>x.lastmsgID!=null).Count());
        }
        public async Task getMonthlyData()
        {
            var model=_dbContext.views.OrderByDescending(x => x.date)
                .GroupBy(x => new { x.date.Year, x.date.Month })
                // Bonus: You can use this on a drop down
                .Select(x => new DateTimeList
                {
                    Year = string.Format("{0}", x.Key.Year),
                    Month = string.Format("{0}", x.Key.Month),
                    Total = string.Format("{0}", x.Count())
                })
                .ToList();
            await Clients.Caller.SendAsync("monthlydata", Newtonsoft.Json.JsonConvert.SerializeObject(model));
        }
        public ChatHub(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager, IHttpContextAccessor accessor)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _accessor = accessor;
        }
        public string TimeAgo(DateTime dt)
        {
            if (dt > DateTime.Now)
                return "about sometime from now";
            TimeSpan span = DateTime.Now - dt;

            if (span.Days > 365)
            {
                int years = (span.Days / 365);
                if (span.Days % 365 != 0)
                    years += 1;
                return String.Format("about {0} {1} ago", years, years == 1 ? "year" : "years");
            }

            if (span.Days > 30)
            {
                int months = (span.Days / 30);
                if (span.Days % 31 != 0)
                    months += 1;
                return String.Format("about {0} {1} ago", months, months == 1 ? "month" : "months");
            }

            if (span.Days > 0)
                return String.Format("about {0} {1} ago", span.Days, span.Days == 1 ? "day" : "days");

            if (span.Hours > 0)
                return String.Format("about {0} {1} ago", span.Hours, span.Hours == 1 ? "hour" : "hours");

            if (span.Minutes > 0)
                return String.Format("about {0} {1} ago", span.Minutes, span.Minutes == 1 ? "minute" : "minutes");

            if (span.Seconds > 5)
                return String.Format("about {0} seconds ago", span.Seconds);

            if (span.Seconds <= 5)
                return "just now";

            return string.Empty;
        }
    }

    class DateTimeList
    {
        public object Month { get; set; }
        public object Year { get; set; }
        public object Total { get; set; }
    }

    class grouplistresponse
    {
        public string name { get; set; }
        public bool newMessageseen { get; set; }
        public string country { get; set; }
        public string phone { get; set; }
        public string email { get; set; }
        public string city { get; set; }
        public string IP { get; set; }
        public string anonid { get; set; }
        public bool active { get; set; }
        public string lastTime { get; set; }
    }
    class chatmessageresponse
    {
        public string id { get; set; }
        public string userid { get; set; }
        public string anonuserid { get; set; }
        public string message { get; set; }
        public string filename { get; set; }
        public ChatMessageType msgType { get; set; }
        public List<string> seenby { get; set; }
        public DateTime datetime { get; set; }
    }
}
