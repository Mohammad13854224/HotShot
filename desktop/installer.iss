; Windows installer for HotShot. Built by GitHub Actions: iscc /DAppVersion=1.2.3 desktop\installer.iss
#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif

[Setup]
AppId={{6F4C1B52-8E0A-4D7B-9A35-2C1E7D90B4A1}
AppName=HotShot
AppVersion={#AppVersion}
AppPublisher=HotShot
AppPublisherURL=https://github.com/Mohammad13854224/HotShot
DefaultDirName={autopf}\HotShot
DefaultGroupName=HotShot
DisableProgramGroupPage=yes
PrivilegesRequired=admin
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir=dist
OutputBaseFilename=HotShot-Setup
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\HotShot.exe
UninstallDisplayName=HotShot
Compression=lzma2/ultra
SolidCompression=yes
WizardStyle=modern
CloseApplications=yes
RestartApplications=no

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"

[Files]
Source: "dist\HotShot\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\HotShot"; Filename: "{app}\HotShot.exe"
Name: "{autodesktop}\HotShot"; Filename: "{app}\HotShot.exe"; Tasks: desktopicon

[Run]
; setup already runs as administrator, so the phone can connect without any firewall prompt later
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""HotShot"""; Flags: runhidden; StatusMsg: "Configuring Windows Firewall..."
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""HotShot"" dir=in action=allow program=""{app}\HotShot.exe"" enable=yes profile=any"; Flags: runhidden
Filename: "{app}\HotShot.exe"; Description: "Open HotShot"; Flags: nowait postinstall skipifsilent runasoriginaluser

[UninstallRun]
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""HotShot"""; Flags: runhidden; RunOnceId: "firewall"
