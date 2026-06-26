using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Egov.Data;
using Egov.Models;
using Egov.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace Egov.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VirtualMachineController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VirtualMachineController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetVirtualMachines()
    {
        var vms = await _context.VirtualMachines
            .Include(vm => vm.Articles)
            .Select(vm => new
            {
                Id = vm.Id,
                Name = vm.Name,
                IpAddress = vm.IpAddress,
                OS = vm.OS,
                Status = vm.Status,
                Articles = vm.Articles.Select(a => new { Id = a.Id, Title = a.Title }).ToList()
            })
            .ToListAsync();

        return Ok(vms);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetVirtualMachine(int id)
    {
        var vm = await _context.VirtualMachines
            .Include(vm => vm.Articles)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vm == null) return NotFound(new { message = "Машина не найдена" });

        return Ok(new
        {
            Id = vm.Id,
            Name = vm.Name,
            IpAddress = vm.IpAddress,
            OS = vm.OS,
            Status = vm.Status,
            ArticleIds = vm.Articles.Select(a => a.Id).ToList() 
        });
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateVM([FromBody] VirtualMachineCreateDto dto)
    {
        var vm = new VirtualMachine
        {
            Name = dto.Name,
            IpAddress = dto.IpAddress,
            OS = dto.OS,
            Status = dto.Status
        };

        if (dto.ArticleIds != null && dto.ArticleIds.Any())
        {
            var selectedArticles = await _context.Articles
                .Where(a => dto.ArticleIds.Contains(a.Id))
                .ToListAsync();
            vm.Articles = selectedArticles;
        }

        _context.VirtualMachines.Add(vm);
        await _context.SaveChangesAsync();
        return Ok(vm);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateVM(int id, [FromBody] VirtualMachineCreateDto dto)
    {
        var vm = await _context.VirtualMachines
            .Include(vm => vm.Articles)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vm == null) return NotFound(new { message = "Машина не найдена" });

        vm.Name = dto.Name;
        vm.IpAddress = dto.IpAddress;
        vm.OS = dto.OS;
        vm.Status = dto.Status;

        vm.Articles.Clear();
        if (dto.ArticleIds != null && dto.ArticleIds.Any())
        {
            var selectedArticles = await _context.Articles
                .Where(a => dto.ArticleIds.Contains(a.Id))
                .ToListAsync();
            vm.Articles = selectedArticles;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteVM(int id)
    {
        var vm = await _context.VirtualMachines.FindAsync(id);
        if (vm == null) return NotFound();

        _context.VirtualMachines.Remove(vm);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
