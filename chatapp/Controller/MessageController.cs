using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Amazon.S3;
using chatapp.Models;
using HeyRed.Mime;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;


// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace chatapp
{
    public class MessageController : Controller
    {
        private ApplicationDbContext _dbContext;
        private IHubContext<ChatHub> _hubContext;
        private UserManager<ApplicationUser> _userManager;
        private IHostingEnvironment _env;
        private const string S3_SECRET_KEY = "Pf5fQuzT3Q6IeBUROe+vEYpKiz9+KZWZqyB9NPT17/0";
        private const string S3_ACCESS_KEY = "YZ25QWK7PLC34MH7SOP6";
        private const string S3_HOST_ENDPOINT = "https://sgp1.digitaloceanspaces.com";
        private const string S3_BUCKET_NAME = "chatapp";

        public MessageController(ApplicationDbContext dbContext,IHubContext<ChatHub> hubContext, UserManager<ApplicationUser> userManager, IHostingEnvironment env)
        {
            _dbContext=dbContext;
            _hubContext = hubContext;
            _userManager = userManager;
            _env = env;
        }
        [HttpPost("/Group/fileupload")]
        public async Task<IActionResult> Post(FileUploadModel fileUploadModel)
        {
            long size = fileUploadModel.files.Sum(f => f.Length);

            // full path to file in temp location
            string filepath = "";
            foreach (var formFile in fileUploadModel.files)
            {
                if (formFile.Length > 0)
                {
                    var fileName = Path.GetFileName("img" + fileUploadModel.uid + "." + Path.GetExtension(Path.GetFileName(formFile.FileName)));
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), @"wwwroot\images", fileName);
                    filepath += "\\images\\" + fileName;
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await formFile.CopyToAsync(stream);
                    }
                }
            }
            var uploadname = Guid.NewGuid().ToString()+ Path.GetExtension(Path.GetFileName(fileUploadModel.files[0].FileName));
            var str=await UploadFile(_env.WebRootPath+filepath, uploadname);
            var msg = new ChatMessage
            {
                messageType = ChatMessageType.File,
                message = "https://chatapp.sgp1.digitaloceanspaces.com/" + uploadname,
                filename= fileUploadModel.files[0].FileName,
                datetime = DateTime.UtcNow,
            };
            var userid = "";
            var groupid = fileUploadModel.anonid;
            var usr = _dbContext.anonusers.Find(fileUploadModel.anonid);

            if (System.IO.File.Exists(_env.WebRootPath + filepath))
            {
                System.IO.File.Delete(_env.WebRootPath + filepath);
            }

            if (_dbContext.singleActiveUsers.Any(x => x.ConnectionID == fileUploadModel.uid))
            {
                var nuser = _dbContext.singleActiveUsers.Where(x => x.ConnectionID == fileUploadModel.uid).ToList();
                msg.userid = nuser.First().userID;
                userid = nuser.First().ConnectionID;
                msg.anonuserid = groupid;


            }
            else if (usr != null)
            {
                msg.anonuserid = usr.ID;
                userid = usr.connectionID;

            }
            else
            {
                var musr = _dbContext.anonusers.Where(x => x.connectionID == fileUploadModel.anonid).ToList().First();
                msg.anonuserid = musr.ID;
                userid = musr.connectionID;
                groupid = musr.ID;
            }
            _dbContext.chatmessage.Add(msg);
            _dbContext.SaveChanges();

            await _hubContext.Clients.Group(groupid).SendAsync("groupfilemsg", groupid, userid, "https://chatapp.sgp1.digitaloceanspaces.com/"+uploadname, fileUploadModel.files[0].FileName,msg.id);
            // process uploaded files
            // Don't rely on or trust the FileName property without validation.
            return Ok(new { filePath ="/images/"+filepath});
        }
        [HttpPost("/Group/audioupload")]
        public async Task<IActionResult> audioupload(FileUploadModel fileUploadModel)
        {
            long size = fileUploadModel.files.Sum(f => f.Length);

            // full path to file in temp location
            string filepath = "";
            foreach (var formFile in fileUploadModel.files)
            {
                var guid = Guid.NewGuid().ToString("N");
                    var fileName = Path.GetFileName("audio_" + fileUploadModel.uid+"-"+guid+".wav");
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), @"wwwroot\aud", fileName);
                    filepath += "\\aud\\audio_" + fileUploadModel.uid +"-"+guid+ ".wav";
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await formFile.CopyToAsync(stream);
                    }
            }

            var uploadname = Guid.NewGuid().ToString() + ".wav";
            var str = await UploadFile(_env.WebRootPath + filepath, uploadname);
            var msg = new ChatMessage
            {
                messageType = ChatMessageType.Audio,
                message = "https://chatapp.sgp1.digitaloceanspaces.com/"+uploadname,
                datetime = DateTime.UtcNow,
            };
            var userid = "";
            var groupid = fileUploadModel.anonid;
            var usr = _dbContext.anonusers.Find(fileUploadModel.anonid);
            if (System.IO.File.Exists(_env.WebRootPath + filepath))
            {
                System.IO.File.Delete(_env.WebRootPath + filepath);
            }
            if (_dbContext.singleActiveUsers.Any(x => x.ConnectionID == fileUploadModel.uid))
            {
                var nuser = _dbContext.singleActiveUsers.Where(x => x.ConnectionID == fileUploadModel.uid).ToList();
                msg.userid = nuser.First().userID;
                userid = nuser.First().ConnectionID;
                msg.anonuserid = groupid;

            }
            else if (usr != null)
            {
                msg.anonuserid = usr.ID;
                userid = usr.connectionID;

            }
            else
            {
                var musr = _dbContext.anonusers.Where(x => x.connectionID == fileUploadModel.anonid).ToList().First();
                msg.anonuserid = musr.ID;
                userid = musr.connectionID;
                groupid = musr.ID;
            }
            _dbContext.chatmessage.Add(msg);
            _dbContext.SaveChanges();
            await _hubContext.Clients.Group(groupid).SendAsync("groupaudiomsg", groupid, userid, "https://chatapp.sgp1.digitaloceanspaces.com/"+uploadname, msg.id);
            // process uploaded files
            // Don't rely on or trust the FileName property without validation.

            return Ok(new { filePath ="/"+filepath});
        }


        public async Task<string> UploadFile(string filePath, string uploadName, int maxPartRetry = 3, long maxPartSize = 6000000L)
        {
            if (string.IsNullOrEmpty(filePath))
                throw new ArgumentNullException(nameof(filePath));
            if (string.IsNullOrWhiteSpace(uploadName))
                throw new ArgumentNullException(nameof(uploadName));
            if (maxPartRetry < 1)
                throw new ArgumentException("Max Part Retry needs to be greater than or equal to 1", nameof(maxPartRetry));
            if (maxPartSize < 1)
                throw new ArgumentException("Max Part Size needs to be greater than 0", nameof(maxPartSize));

            var fileInfo = new FileInfo(filePath);
            var contentType = MimeGuesser.GuessFileType(filePath).MimeType;
            Amazon.S3.Model.InitiateMultipartUploadResponse multiPartStart;

            using (var client = CreateNewClient())
            {
                multiPartStart = await client.InitiateMultipartUploadAsync(new Amazon.S3.Model.InitiateMultipartUploadRequest()
                {
                    BucketName = S3_BUCKET_NAME,
                    ContentType = contentType,
                    Key = uploadName,
                    CannedACL=S3CannedACL.PublicRead
                });

                var estimatedParts = (int)(fileInfo.Length / maxPartSize);
                if (estimatedParts == 0)
                    estimatedParts = 1;

                UploadStatusEvent?.Invoke(this, new UploadStatus(0, estimatedParts, 0, fileInfo.Length));

                try
                {
                    var i = 0L;
                    var n = 1;
                    Dictionary<string, int> parts = new Dictionary<string, int>();
                    while (i < fileInfo.Length)
                    {
                        long partSize = maxPartSize;
                        var lastPart = (i + partSize) >= fileInfo.Length;
                        if (lastPart)
                            partSize = fileInfo.Length - i;
                        bool complete = false;
                        int retry = 0;
                        Amazon.S3.Model.UploadPartResponse partResp = null;
                        do
                        {
                            retry++;
                            try
                            {
                                partResp = await client.UploadPartAsync(new Amazon.S3.Model.UploadPartRequest()
                                {
                                    BucketName = S3_BUCKET_NAME,
                                    FilePath = filePath,
                                    FilePosition = i,
                                    IsLastPart = lastPart,
                                    PartSize = partSize,
                                    PartNumber = n,
                                    UploadId = multiPartStart.UploadId,
                                    Key = uploadName
                                    
                                });
                                complete = true;
                            }
                            catch (Exception ex)
                            {
                                UploadExceptionEvent?.Invoke(this, new UploadException($"Failed to upload part {n} on try #{retry}", ex));
                            }
                        } while (!complete && retry <= maxPartRetry);

                        if (!complete || partResp == null)
                            throw new Exception($"Unable to upload part {n}");

                        parts.Add(partResp.ETag, n);
                        i += partSize;
                        UploadStatusEvent?.Invoke(this, new UploadStatus(n, estimatedParts, i, fileInfo.Length));
                        n++;
                    }

                    // upload complete
                    var completePart = await client.CompleteMultipartUploadAsync(new Amazon.S3.Model.CompleteMultipartUploadRequest()
                    {
                        UploadId = multiPartStart.UploadId,
                        BucketName = S3_BUCKET_NAME,
                        Key = uploadName,
                        PartETags = parts.Select(p => new Amazon.S3.Model.PartETag(p.Value, p.Key)).ToList(),
                       
                    });
                }
                catch (Exception ex)
                {
                    var abortPart = await client.AbortMultipartUploadAsync(S3_BUCKET_NAME, uploadName, multiPartStart.UploadId);
                    UploadExceptionEvent?.Invoke(this, new UploadException("Something went wrong upload file and it was aborted", ex));
                }
            }

            return multiPartStart?.UploadId;
        }

        private AmazonS3Client CreateNewClient()
        {
            return new AmazonS3Client(S3_ACCESS_KEY, S3_SECRET_KEY, new AmazonS3Config()
            {
                ServiceURL = S3_HOST_ENDPOINT
            });
        }
        /// <summary>
        /// Occurs when upload exception event.
        /// </summary>
        public event EventHandler<UploadException> UploadExceptionEvent = delegate { };

        /// <summary>
        /// Occurs when upload status event.
        /// </summary>
        public event EventHandler<UploadStatus> UploadStatusEvent = delegate { };
    }
}
