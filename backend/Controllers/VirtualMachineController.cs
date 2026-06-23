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

    //Получить ВСЕ виртуальные машины
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VirtualMachineDto>>> GetVirtualMachines()
    {
        var vms = await _context.Set<VirtualMachine>()
            .Include(vm => vm.Article)
            .Select(vm => new VirtualMachineDto
            {
                Id = vm.Id,
                Name = vm.Name,
                IpAddress = vm.IpAddress,
                OS = vm.OS,
                Status = vm.Status,
                ArticleId = vm.ArticleId,
                ArticleTitle = vm.Article != null ? vm.Article.Title : null
            })
            .ToListAsync();

        return Ok(vms);
    }

    //Создать новую виртуальную машину
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateVM(VirtualMachineDto dto)
    {
        var vm = new VirtualMachine
        {
            Name = dto.Name,
            IpAddress = dto.IpAddress,
            OS = dto.OS,
            Status = dto.Status,
            ArticleId = dto.ArticleId // Сразу привязываем к статье, если ID передан
        };

        _context.Set<VirtualMachine>().Add(vm);
        await _context.SaveChangesAsync();
        return Ok(vm);
    }

    //Быстро привязать/отвязать VM от статьи (вызывается при редактировании статьи)
    [HttpPut("{id}/bind")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> BindToArticle(int id, [FromQuery] int? articleId)
    {
        var vm = await _context.Set<VirtualMachine>().FindAsync(id);
        if (vm == null) return NotFound(new { message = "Машина не найдена" });

        vm.ArticleId = articleId;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
