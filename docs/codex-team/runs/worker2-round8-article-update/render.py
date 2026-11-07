import runpy,tempfile,sys,os
tmp='/var/folders/4p/n68j0hgj7bn9hshnk07q7ymw0000gn/T/ct-w2-jvkqeA'
tempfile.tempdir=tmp
os.environ['TMPDIR']=tmp
script='/Users/vodoandangkhoi/.codex/plugins/cache/openai-primary-runtime/documents/26.905.11957/skills/documents/render_docx.py'
sys.path.insert(0,os.path.dirname(script))
sys.argv=[script,'/Users/vodoandangkhoi/Documents/WEB_WORKING_24-09/BAI_BAO_KHOA_HOC_CAP_NHAT_HOC_LIEU.docx','--output_dir',tmp+'/qa','--emit_pdf']
import importlib.util
spec=importlib.util.spec_from_file_location('renderer',script)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
m._default_macos_tmpdir_for_soffice=lambda:None
m.main()
