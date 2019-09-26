using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace chatapp
{
    public class FileUploadModel
    {
        public string uid { get; set; }
        public string anonid { get; set; }
        public List<IFormFile> files { get; set; }
    }
}
