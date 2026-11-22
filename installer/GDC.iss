[Setup]
AppId={{A41F3B4C-3B8C-4E79-9C0D-DC4C1F8A6D21}
AppName=Gaming Driver Center
AppVersion=0.4.0
AppPublisher=Denis
DefaultDirName={autopf}\Gaming Driver Center
DefaultGroupName=Gaming Driver Center
; Paths are relative to this .iss file, which is inside installer/.
OutputDir=..\dist
OutputBaseFilename=GamingDriverCenter-Setup
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=admin
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\GamingDriverCenter.exe
SetupLogging=yes
Compression=lzma2
SolidCompression=yes
WizardStyle=modern

[Files]
Source: "..\dist\GamingDriverCenter\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\Gaming Driver Center"; Filename: "{app}\GamingDriverCenter.exe"
Name: "{autodesktop}\Gaming Driver Center"; Filename: "{app}\GamingDriverCenter.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Создать ярлык на рабочем столе"; GroupDescription: "Дополнительные задачи:"

[Dirs]
Name: "{userappdata}\GamingDriverCenter"

[UninstallDelete]
Type: filesandordirs; Name: "{app}\_internal"
