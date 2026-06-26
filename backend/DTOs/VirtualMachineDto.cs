namespace Egov.DTOs;

public class VirtualMachineDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string IpAddress { get; set; } = null!;
    public string? OS { get; set; }
    public string Status { get; set; } = null!;
    public int? ArticleId { get; set; }
    public string? ArticleTitle { get; set; }
}
