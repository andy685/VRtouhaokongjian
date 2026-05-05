#!/usr/bin/env python3
import subprocess, sys
result = subprocess.run([sys.executable, '/Users/andy/Downloads/baidu/codebuddy/VRtouhaokongjian/docs/gen_prd_html.py'], capture_output=True, text=True)
print(result.stdout)
if result.stderr:
    print('STDERR:', result.stderr)
