using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using chatapp.Models;
using chatapp.ViewModel;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;


// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace chatapp
{
    public class AccountController : Controller
    {
        private UserManager<ApplicationUser> _userManager;
        private SignInManager<ApplicationUser> _signManager;

        [HttpGet("/register")]
        public ViewResult Register()
        {
            return View();
        }
        [HttpGet("/login")]
        public IActionResult Login(string returnUrl = "")
        {
            var model = new LoginViewModel { ReturnUrl = returnUrl };
            return View(model);
        }
        [HttpGet("/dashboard")]
        public IActionResult Dashboard()
        {
            return View();
        }
        [HttpPost("/register")]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = model.Username };
                var result = await _userManager.CreateAsync(user, model.Password);

                if (result.Succeeded)
                {
                    return Redirect("/login");
                }
                else
                {
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError("", error.Description);
                    }
                }
            }
            return View();
        }
        [HttpPost("/login")]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (ModelState.IsValid)
            {
                var result = await _signManager.PasswordSignInAsync(model.Username,
                   model.Password, model.RememberMe, false);

                if (result.Succeeded)
                {

                        var claims = new List<Claim>
                         {
                         new Claim(ClaimTypes.Name, model.Username)
                         };

                        var userIdentity = new ClaimsIdentity(claims, "login");

                        ClaimsPrincipal principal = new ClaimsPrincipal(userIdentity);
                        await HttpContext.SignInAsync(principal);
                        return Redirect("/dashboard");

                }

            }
            ModelState.AddModelError("", "Invalid login attempt");
            return View(model);
        }

        public AccountController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signManager)
        {
            _userManager = userManager;
            _signManager = signManager;
        }

        [HttpPost("/logout")]
        public async Task<IActionResult> Logout()
        {
            await _signManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }
    }
}
