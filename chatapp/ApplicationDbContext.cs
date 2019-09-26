using chatapp.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace chatapp
{
    public class ApplicationDbContext: IdentityDbContext<ApplicationUser>
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            base.OnConfiguring(optionsBuilder);
        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            var hasher = new PasswordHasher<ApplicationUser>();

            builder.Entity<CannedResponses>().HasData(
                new CannedResponses() { ID = Guid.NewGuid().ToString(),shortform = "/hl", longform = "Hello" });
            builder.Entity<CannedResponses>().HasData(
                new CannedResponses() { ID = Guid.NewGuid().ToString(), shortform = "/gdm", longform = "Good Morning"});
            builder.Entity<CannedResponses>().HasData(
                new CannedResponses() { ID = Guid.NewGuid().ToString(), shortform = "/gdn", longform = "Good Night"});

            builder.Entity<ApplicationUser>().HasData(
                new ApplicationUser() { UserName = "admin", PasswordHash= hasher.HashPassword(null, "123456") });
            base.OnModelCreating(builder);
        }
        public DbSet<ChatMessage> chatmessage { get; set; }
        public DbSet<AnonymousUser> anonusers { get; set; }
        public DbSet<singleActiveUser> singleActiveUsers { get; set; }
        public DbSet<CannedResponses> cannedResponses { get; set; }
        public DbSet<ViewsTable> views { get; set; }


    }
}
