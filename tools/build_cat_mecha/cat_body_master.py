"""Unarmored editable high-poly review source; never writes game production assets."""
import os,runpy,sys
from pathlib import Path

folder=Path(__file__).resolve().parent
os.environ['CAT_MECHA_CACHE']='E:/dev-cache/catRobot-astral-benchmark-20261023/body_master'
for flag in ['--body-master','--body-only','--benchmark','--candidate']:
    if flag not in sys.argv: sys.argv.append(flag)
runpy.run_path(str(folder/'build.py'),run_name='__main__')
