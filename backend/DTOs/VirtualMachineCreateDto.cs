namespace Egov.DTOs;

public class VirtualMachineCreateDto
{
    public string Name { get; set; } = null!;
    public string IpAddress { get; set; } = null!;
    public string? OS { get; set; }
    public string Status { get; set; } = "Active";
    
    public List<int> ArticleIds { get; set; } = new List<int>(); 
}
