using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialWithVirtualMachines : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "parent_id",
                table: "articles",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "virtual_machines",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    os = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    article_id = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_virtual_machines", x => x.id);
                    table.ForeignKey(
                        name: "FK_virtual_machines_articles_article_id",
                        column: x => x.article_id,
                        principalTable: "articles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "id", "description", "name" },
                values: new object[,]
                {
                    { 1, "Администратор системы с полными правами", "admin" },
                    { 2, "Обычный зарегистрированный пользователь", "user" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_articles_parent_id",
                table: "articles",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "IX_virtual_machines_article_id",
                table: "virtual_machines",
                column: "article_id");

            migrationBuilder.AddForeignKey(
                name: "FK_articles_articles_parent_id",
                table: "articles",
                column: "parent_id",
                principalTable: "articles",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_articles_articles_parent_id",
                table: "articles");

            migrationBuilder.DropTable(
                name: "virtual_machines");

            migrationBuilder.DropIndex(
                name: "IX_articles_parent_id",
                table: "articles");

            migrationBuilder.DeleteData(
                table: "roles",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "roles",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DropColumn(
                name: "parent_id",
                table: "articles");
        }
    }
}
