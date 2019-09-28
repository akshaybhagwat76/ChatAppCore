using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace chatapp.Migrations
{
    public partial class initialaks : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumns: new[] { "Id", "ConcurrencyStamp" },
                keyValues: new object[] { "efae861e-c485-4766-b329-91e08ce7263c", "4ffe989c-38e9-402e-bad2-ea866499e180" });

            migrationBuilder.DeleteData(
                table: "cannedResponses",
                keyColumn: "ID",
                keyValue: "04e4e757-edb4-42e5-bf64-be24e1c178e5");

            migrationBuilder.DeleteData(
                table: "cannedResponses",
                keyColumn: "ID",
                keyValue: "ae84ec45-0f8f-4450-a315-f7719542081e");

            migrationBuilder.DeleteData(
                table: "cannedResponses",
                keyColumn: "ID",
                keyValue: "c86ae1f8-417c-4aea-9541-47adc45b87e3");

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName", "lastActiveTime", "profilepicLocation" },
                values: new object[] { "e53e170e-570e-4204-9c57-541c3ee984f7", 0, "2157689d-95fd-4fd5-96fd-e84bf80d82a8", null, false, false, null, null, null, "AQAAAAEAACcQAAAAEEi19p61djfkbJalu/jPIcbYE5zonHAn8Nr4yUc66WvaMFFTiw2vmL/l8OSaFClvjg==", null, false, null, false, "admin", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null });

            migrationBuilder.InsertData(
                table: "cannedResponses",
                columns: new[] { "ID", "longform", "shortform" },
                values: new object[,]
                {
                    { "0aa22f2e-88f7-4484-b61a-ce9111768964", "Hello", "/hl" },
                    { "7861ba9e-ad93-436e-9b61-c877ff70739b", "Good Morning", "/gdm" },
                    { "a99b0787-b24d-4405-91b7-41b8e0880da6", "Good Night", "/gdn" }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetUsers",
                keyColumns: new[] { "Id", "ConcurrencyStamp" },
                keyValues: new object[] { "e53e170e-570e-4204-9c57-541c3ee984f7", "2157689d-95fd-4fd5-96fd-e84bf80d82a8" });

            migrationBuilder.DeleteData(
                table: "cannedResponses",
                keyColumn: "ID",
                keyValue: "0aa22f2e-88f7-4484-b61a-ce9111768964");

            migrationBuilder.DeleteData(
                table: "cannedResponses",
                keyColumn: "ID",
                keyValue: "7861ba9e-ad93-436e-9b61-c877ff70739b");

            migrationBuilder.DeleteData(
                table: "cannedResponses",
                keyColumn: "ID",
                keyValue: "a99b0787-b24d-4405-91b7-41b8e0880da6");

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName", "lastActiveTime", "profilepicLocation" },
                values: new object[] { "efae861e-c485-4766-b329-91e08ce7263c", 0, "4ffe989c-38e9-402e-bad2-ea866499e180", null, false, false, null, null, null, "AQAAAAEAACcQAAAAENSkYIr8Yp4AvCn2+PE3m/klgX/GXRs2kcQp7MPaKw85vYSIyEwNbtw5Jdb2mxFBRw==", null, false, null, false, "admin", new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null });

            migrationBuilder.InsertData(
                table: "cannedResponses",
                columns: new[] { "ID", "longform", "shortform" },
                values: new object[,]
                {
                    { "c86ae1f8-417c-4aea-9541-47adc45b87e3", "Hello", "/hl" },
                    { "ae84ec45-0f8f-4450-a315-f7719542081e", "Good Morning", "/gdm" },
                    { "04e4e757-edb4-42e5-bf64-be24e1c178e5", "Good Night", "/gdn" }
                });
        }
    }
}
