from __future__ import annotations
import json
import subprocess
from datetime import datetime, timezone

def _ps_json(script: str):
    completed = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "RemoteSigned", "-Command", script],
        capture_output=True, text=True, timeout=25, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0)
    )
    if completed.returncode != 0:
        raise RuntimeError((completed.stderr or "PowerShell query failed").strip()[:500])
    raw = completed.stdout.strip()
    if not raw:
        return []
    value = json.loads(raw)
    return value if isinstance(value, list) else [value]

def collect_system():
    # Read-only CIM queries. No registry edits, driver installs, or security changes.
    script = r"""
    $ErrorActionPreference = 'Stop'
    $gpu = @(Get-CimInstance Win32_VideoController | Select-Object Name,AdapterRAM,DriverVersion,VideoProcessor)
    $cpu = @(Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed)
    $ram = @(Get-CimInstance Win32_PhysicalMemory | Select-Object Capacity,Speed,Manufacturer,PartNumber)
    $board = @(Get-CimInstance Win32_BaseBoard | Select-Object Manufacturer,Product,Version)
    $disks = @(Get-CimInstance Win32_DiskDrive | Select-Object Model,Size,MediaType,InterfaceType)
    $net = @(Get-CimInstance Win32_NetworkAdapter -Filter "PhysicalAdapter=True" | Where-Object {$_.NetEnabled -eq $true} | Select-Object Name,Manufacturer,Speed)
    $drivers = @(Get-CimInstance Win32_PnPSignedDriver | Where-Object {$_.DeviceName -and $_.DriverVersion} | Select-Object DeviceName,Manufacturer,DriverVersion,DriverDate,DeviceClass,IsSigned,InfName)
    [pscustomobject]@{gpu=$gpu;cpu=$cpu;ram=$ram;board=$board;disks=$disks;network=$net;drivers=$drivers;os=(Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,OSArchitecture,LastBootUpTime)} | ConvertTo-Json -Depth 5 -Compress
    """
    data = _ps_json(script)
    return data[0] if data else {}

def build_payload(raw):
    gpu = raw.get("gpu") or []
    cpu = raw.get("cpu") or []
    ram = raw.get("ram") or []
    board = raw.get("board") or []
    disks = raw.get("disks") or []
    network = raw.get("network") or []
    drivers_raw = raw.get("drivers") or []
    os_info = raw.get("os") or {}
    def first(items): return items[0] if items else {}
    g, c, b = first(gpu), first(cpu), first(board)
    total_ram = sum(int(x.get("Capacity") or 0) for x in ram)
    ram_gb = round(total_ram / (1024**3), 1)
    hardware = []
    def hw(category, icon, name, vendor, version, specs):
        if name:
            hardware.append({"category":category,"icon":icon,"name":name,"vendor":vendor or "Unknown","driverVersion":version or "Not reported","status":"UNKNOWN","specs":[{"label":k,"value":str(v)} for k,v in specs if v not in (None,"")]})
    for x in gpu:
        hw("Graphics Card","monitor",x.get("Name"),"Windows device inventory",x.get("DriverVersion"),[("Video processor",x.get("VideoProcessor")),("Dedicated memory",f"{round((x.get('AdapterRAM') or 0)/(1024**3),1)} GB" if x.get("AdapterRAM") else None)])
    hw("Processor","cpu",c.get("Name"),"Windows device inventory",None,[("Cores",c.get("NumberOfCores")),("Threads",c.get("NumberOfLogicalProcessors")),("Max clock (MHz)",c.get("MaxClockSpeed"))])
    hw("Motherboard","circuit-board"," ".join(str(x) for x in [b.get("Manufacturer"),b.get("Product")] if x),"Windows device inventory",None,[("Version",b.get("Version"))])
    if ram and total_ram > 0:
        hw("Memory","memory-stick",f"{ram_gb} GB RAM","Windows device inventory",None,[("Modules",len(ram)),("Reported speed",", ".join(str(x.get("Speed")) for x in ram if x.get("Speed"))+" MT/s")])
    for x in disks:
        hw("Storage","hard-drive",x.get("Model"),x.get("MediaType"),None,[("Capacity",f"{round((x.get('Size') or 0)/(1024**3),1)} GB" if x.get("Size") else None),("Interface",x.get("InterfaceType"))])
    for x in network:
        hw("Network","wifi",x.get("Name"),x.get("Manufacturer"),None,[("Link speed",x.get("Speed"))])
    drivers=[]
    for n,x in enumerate(drivers_raw):
        drivers.append({"id":f"pnp-{n}","category":x.get("DeviceClass") or "Other","icon":"cpu","device":x.get("DeviceName") or "Unknown device","vendor":x.get("Manufacturer") or "Unknown","currentVersion":x.get("DriverVersion") or "Unknown","latestVersion":"Not checked","status":"INSTALLED","releaseDate":str(x.get("DriverDate") or "")[:10],"size":"—","notes":("Signed driver" if x.get("IsSigned") else "Signature not confirmed")+f" • INF: {x.get('InfName') or '—'}"})
    overview=[
      {"id":"gpu","tag":"GPU","icon":"monitor","accentClass":"cyan-accent","main":g.get("Name","Not detected"),"sub":"Detected by Windows CIM"},
      {"id":"cpu","tag":"CPU","icon":"cpu","accentClass":"","main":c.get("Name","Not detected"),"sub":f"{c.get('NumberOfCores','?')} cores / {c.get('NumberOfLogicalProcessors','?')} threads"},
      {"id":"ram","tag":"RAM","icon":"memory-stick","accentClass":"","main":f"{ram_gb} GB" if ram_gb else "Not detected","sub":f"{len(ram)} memory module(s)"},
      {"id":"drivers","tag":"DRIVERS","icon":"shield-check","accentClass":"green-accent","main":f"{len(drivers)} detected","sub":"Installed drivers detected • latest versions checked separately"}
    ]
    return {"overview":overview,"hardware":hardware,"drivers":drivers,"updates":[],"lastCheckLabel":datetime.now().astimezone().strftime("%Y-%m-%d %H:%M")}
