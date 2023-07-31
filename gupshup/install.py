import subprocess

def before_install():
    subprocess.call('bench exec ./env/bin/pip install requests --upgrade', shell=True)