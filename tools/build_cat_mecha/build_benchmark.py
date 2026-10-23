"""Candidate-only astral benchmark using the existing native export pipeline."""
import os, runpy, sys
from pathlib import Path

folder=Path(__file__).resolve().parent
os.environ.setdefault('CAT_MECHA_CACHE','E:/dev-cache/catRobot-astral-benchmark-20261023')
for flag in ['--benchmark','--candidate']:
    if flag not in sys.argv: sys.argv.append(flag)
runpy.run_path(str(folder/'build.py'),run_name='__main__')
