"""Actual stdio MCP client for this task; keep image bytes off terminal output."""
import argparse,asyncio,base64,json,os
from pathlib import Path
from mcp import ClientSession,StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT=Path('E:/dev-cache/catRobot-blender-mcp-20261023')
def arguments():
    p=argparse.ArgumentParser()
    p.add_argument('--list',action='store_true')
    p.add_argument('--name')
    p.add_argument('--json',default='{}')
    p.add_argument('--file',help='UTF-8 Python script passed to execute_blender_code')
    p.add_argument('--out',required=True)
    return p.parse_args()

async def main(args):
    env=dict(os.environ,DISABLE_TELEMETRY='true',BLENDER_MCP_DISABLE_TELEMETRY='true',
             BLENDER_HOST='127.0.0.1',BLENDER_PORT='9876',PYTHONIOENCODING='utf-8')
    params=StdioServerParameters(command=str(ROOT/'venv/Scripts/python.exe'),
                                args=['-m','blender_mcp.server'],env=env)
    out=Path(args.out);out.parent.mkdir(parents=True,exist_ok=True)
    with (ROOT/'mcp_client_stderr.log').open('a',encoding='utf8') as log:
        async with stdio_client(params,errlog=log) as (read,write):
            async with ClientSession(read,write) as session:
                hello=await session.initialize()
                report={'server':hello.serverInfo.model_dump(mode='json')}
                if args.list:
                    listed=await session.list_tools()
                    report['tools']=[t.model_dump(mode='json') for t in listed.tools]
                else:
                    values=json.loads(args.json)
                    if args.file:values['code']=Path(args.file).read_text(encoding='utf8')
                    result=await session.call_tool(args.name,values)
                    report.update(tool=args.name,is_error=bool(result.isError),content=[])
                    for index,block in enumerate(result.content):
                        if block.type=='image':
                            ext='jpg' if block.mimeType=='image/jpeg' else 'png'
                            image=out.with_name(out.stem+f'_{index}.{ext}')
                            image.write_bytes(base64.b64decode(block.data))
                            report['content'].append({'type':'image','path':str(image),
                                                      'bytes':image.stat().st_size})
                        elif block.type=='text':
                            report['content'].append({'type':'text','text':block.text})
                            if block.text.startswith(('Error executing code:', 'Error checking addon status:',
                                                      'Error turning off data collection:')):
                                report['is_error']=True
                        else:report['content'].append({'type':block.type})
                out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
                print(json.dumps({'server':report['server'],'tool':args.name,
                                  'error':report.get('is_error',False),'output':str(out),
                                  'tool_count':len(report.get('tools',[]))},ensure_ascii=False))
                if report.get('is_error'):raise SystemExit(1)

if __name__=='__main__':asyncio.run(main(arguments()))
