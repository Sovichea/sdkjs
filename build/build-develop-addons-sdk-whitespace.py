#!/usr/bin/env python
import os
import sys
sys.path.append('../../build_tools/scripts')
import base
import traceback

try:
    os.environ['SDK_ADDONS'] = os.pathsep.join(['../../sdkjs-forms', '../../sdkjs-ooxml'])
    os.environ['NODE_ENV'] = 'development'
    os.environ['COMPILED'] = '1'

    base.cmd_in_dir('.', "npm", ["ci"])
    base.cmd_in_dir('.', "npm", ["run", "build"])

    input("Press Enter to continue...")
    exit(0)
except SystemExit:
    input("Ignoring SystemExit. Press Enter to continue...")
    exit(0)
except KeyboardInterrupt:
    pass
except:
    input("Unexpected error. " + traceback.format_exc() + "Press Enter to continue...")
    exit(0)
