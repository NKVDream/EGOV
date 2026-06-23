using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVmLinksTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_virtual_machines_articles_article_id",
                table: "virtual_machines");

            migrationBuilder.DropIndex(
                name: "IX_virtual_machines_article_id",
                table: "virtual_machines");

            migrationBuilder.DropColumn(
                name: "article_id",
                table: "virtual_machines");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "virtual_machines",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "article_virtual_machine",
                columns: table => new
                {
                    article_id = table.Column<int>(type: "integer", nullable: false),
                    vm_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_article_virtual_machine", x => new { x.article_id, x.vm_id });
                    table.ForeignKey(
                        name: "FK_article_virtual_machine_articles_article_id",
                        column: x => x.article_id,
                        principalTable: "articles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_article_virtual_machine_virtual_machines_vm_id",
                        column: x => x.vm_id,
                        principalTable: "virtual_machines",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_article_virtual_machine_vm_id",
                table: "article_virtual_machine",
                column: "vm_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "article_virtual_machine");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "virtual_machines",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<int>(
                name: "article_id",
                table: "virtual_machines",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_virtual_machines_article_id",
                table: "virtual_machines",
                column: "article_id");

            migrationBuilder.AddForeignKey(
                name: "FK_virtual_machines_articles_article_id",
                table: "virtual_machines",
                column: "article_id",
                principalTable: "articles",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
