"""Detect Git Bash on Windows and update .vscode/settings.json to use it as the integrated terminal.

Usage:
  python scripts/detect_gitbash.py

The script checks common installation locations and updates the workspace settings.
"""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VSCODE_SETTINGS = ROOT / '.vscode' / 'settings.json'

CANDIDATES = [
    Path(os.environ.get('ProgramW6432', 'C:/Program Files')) / 'Git' / 'bin' / 'bash.exe',
    Path(os.environ.get('ProgramFiles(x86)', 'C:/Program Files (x86)')) / 'Git' / 'bin' / 'bash.exe',
    Path(os.environ.get('LocalAppData', Path.home() / 'AppData' / 'Local')) / 'Programs' / 'Git' / 'bin' / 'bash.exe',
    Path('C:/Program Files/Git/usr/bin/bash.exe'),
]


def find_bash():
    for p in CANDIDATES:
        if p.exists():
            return p
    # Also check PATH for bash.exe
    for p in os.environ.get('PATH', '').split(os.pathsep):
        candidate = Path(p) / 'bash.exe'
        if candidate.exists():
            return candidate
    return None


def ensure_vscode_dir():
    d = VSCODE_SETTINGS.parent
    d.mkdir(parents=True, exist_ok=True)


def load_settings():
    if VSCODE_SETTINGS.exists():
        try:
            return json.loads(VSCODE_SETTINGS.read_text(encoding='utf-8'))
        except Exception:
            return {}
    return {}


def save_settings(settings):
    VSCODE_SETTINGS.write_text(json.dumps(settings, indent=2, ensure_ascii=False), encoding='utf-8')


def main():
    print('Detecting Git Bash...')
    bash_path = find_bash()
    if not bash_path:
        print('Git Bash not found in common locations or PATH.')
        print('Please install Git for Windows or provide the path to bash.exe.')
        print('Common location: C:\\Program Files\\Git\\bin\\bash.exe')
        return 1

    print(f'Found Git Bash: {bash_path}')
    ensure_vscode_dir()
    settings = load_settings()

    profiles = settings.get('terminal.integrated.profiles.windows', {})
    profiles['Git Bash'] = {
        'path': str(bash_path).replace('\\', '\\'),
        'args': ['--login', '-i']
    }
    settings['terminal.integrated.profiles.windows'] = profiles
    settings['terminal.integrated.defaultProfile.windows'] = 'Git Bash'

    # Prepend venv Scripts to PATH env for the terminal
    env = settings.get('terminal.integrated.env.windows', {})
    venv_path = str((ROOT / '.venv' / 'Scripts')).replace('\\', '\\')
    env['PATH'] = f"{venv_path};${{env:PATH}}"
    settings['terminal.integrated.env.windows'] = env

    save_settings(settings)
    print(f'Updated {VSCODE_SETTINGS}')
    print('Reload VS Code window for changes to take effect.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
