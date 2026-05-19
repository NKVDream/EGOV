using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Egov.Models;
using Egov.Data;
using BCrypt.Net;

namespace Egov.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Role)
            .AsNoTracking()
            .ToListAsync();

        foreach (var user in users)
        {
            user.PasswordHash = "********";
            if (user.Role != null) user.Role.Permissions = null!;
        }

        return users;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new { message = $"Пользователь с ID {id} не найден." });
        }

        user.PasswordHash = "********"; // Скрываем хэш
        if (user.Role != null) user.Role.Permissions = null!; 

        return user;
    }

    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        if (string.IsNullOrWhiteSpace(user.Name))
        {
            return BadRequest(new { message = "Имя пользователя (Name) не может быть пустым." });
        }

        if (string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            return BadRequest(new { message = "Email и PasswordHash обязательны для заполнения." });
        }

        var emailExists = await _context.Users.AnyAsync(u => u.Email == user.Email);
        if (emailExists)
        {
            return BadRequest(new { message = "Пользователь с таким Email уже зарегистрирован." });
        }

        var roleExists = await _context.Roles.AnyAsync(r => r.Id == user.RoleId);
        if (!roleExists)
        {
            return BadRequest(new { message = "Указанная роль (RoleId) не существует в системе." });
        }
        
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        user.PasswordHash = "********";// Перед возвратом скрываем пароль в ответе

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Articles) // Загружаем статьи пользователя, чтобы проверить зависимости
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new { message = $"Пользователь с ID {id} не найден." });
        }

        //Если у админа есть написанные статьи, его нельзя просто так удалить
        if (user.Articles.Any())
        {
            return BadRequest(new { 
                message = $"Нельзя удалить пользователя, так как он является автором {user.Articles.Count} статей. Сначала переназначьте автора у этих статей." 
            });
        }

        try
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Внутренняя ошибка сервера при удалении пользователя.", details = ex.Message });
        }
    }
}
