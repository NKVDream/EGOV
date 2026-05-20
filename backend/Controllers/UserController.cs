using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Egov.Models;
using Egov.Data;
using Egov.DTOs;
using Egov.Services;
using Microsoft.AspNetCore.Authorization;

namespace Egov.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly JwtService _jwtService;

    public UserController(ApplicationDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("Login")]
    public async Task<IActionResult>Login(LoginDto dto)
    {
        var user = await _context.Users
        .Include(u => u.Role)
        .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
        {
            return Unauthorized(new {message = "Неверный Email или пароль."});
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return Unauthorized(new{massage = "Неверный Email или пароль"});
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new
        {
            token = token,
            username = user.Name,
            role = user.Role?.Name ?? "User"
        });
    }
    

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<IEnumerable<UserReadDto>>> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Role) // Подгружаем роль из БД
            .AsNoTracking()
            .ToListAsync();

        var userDtos = users.Select(u => new UserReadDto// Маппинг: перекладываем данные из тяжелых моделей в легкие DTO
        {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email,
            RoleName = u.Role?.Name ?? "Без роли"
        });

        return Ok(userDtos);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<UserReadDto>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new { message = $"Пользователь с ID {id} не найден." });
        }

        // Превращаем в DTO
        var userDto = new UserReadDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            RoleName = user.Role?.Name ?? "Без роли"
        };

        return Ok(userDto);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<ActionResult<UserReadDto>> CreateUser(User user)
    {
        if (string.IsNullOrWhiteSpace(user.Name))
        {
            return BadRequest(new { message = "Имя пользователя не может быть пустым." });
        }

        if (string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            return BadRequest(new { message = "Email и пароль обязательны." });
        }

        var emailExists = await _context.Users.AnyAsync(u => u.Email == user.Email);
        if (emailExists)
        {
            return BadRequest(new { message = "Пользователь с таким Email уже зарегистрирован." });
        }

        var roleExists = await _context.Roles.AnyAsync(r => r.Id == user.RoleId);
        if (!roleExists)
        {
            return BadRequest(new { message = "Указанная роль (RoleId) не существует." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var savedUser = await _context.Users.Include(u => u.Role).FirstAsync(u => u.Id == user.Id);

        var responseDto = new UserReadDto
        {
            Id = savedUser.Id,
            Name = savedUser.Name,
            Email = savedUser.Email,
            RoleName = savedUser.Role?.Name ?? "Без роли"
        };

        return CreatedAtAction(nameof(GetUser), new { id = savedUser.Id }, responseDto);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Articles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            return NotFound(new { message = $"Пользователь с ID {id} не найден." });
        }

        if (user.Articles.Any())
        {
            return BadRequest(new { 
                message = $"Нельзя удалить автора {user.Articles.Count} статей. Сначала переназначьте их." 
            });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
