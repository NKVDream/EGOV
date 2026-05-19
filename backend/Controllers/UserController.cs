using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Egov.Models;
using Egov.Data;

namespace test.controllers{

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
            return await _context.Users.ToListAsync();
        }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if(user == null)
            {
                return NotFound();
            }
            return user;
        }
        [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
        {
            if (string.IsNullOrEmpty(user.Name))
            {
                return BadRequest("User's name hasnt been sent to the server");
            }
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new {id = user.Id}, user);
        }
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteUser(int id) // Параметр должен быть int id
{
    try 
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(); 
    }
    catch (Exception) 
    {
        return StatusCode(500, "Internal server error");
    }
}
}
}