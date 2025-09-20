import os

all_dependencies = set()

for root, dirs, files in os.walk("."):
    for file in files:
        if file.endswith("requirements.txt"):
            with open(os.path.join(root, file), "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        all_dependencies.add(line)

for dep in all_dependencies:
    print(f'pkgs.python311Packages.{dep.replace("==", ".").replace("-", "_")}')