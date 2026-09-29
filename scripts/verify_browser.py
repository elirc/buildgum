"""Chromium checks against a disposable browser profile and owned preview process."""
from pathlib import Path
import json, os, socket, subprocess, time, urllib.request
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(os.environ.get('BUILDGUM_CHECK_DIR',str(ROOT/'.verification/browser'))).resolve()
OUT.mkdir(parents=True,exist_ok=True)
KEY='buildgum-workspace-v1'
results=[]
def accept_dialog(dialog): dialog.accept()

def nav(page,name): page.get_by_role('navigation',name='Primary').get_by_role('button',name=name,exact=True).click()
def product_form(page,title='Learning kit',price='12.35'):
 nav(page,'Products');page.get_by_role('button',name='New product',exact=True).click();page.get_by_label('Title',exact=True).fill(title);page.get_by_label('Price in USD').fill(price)
def saved(page): expect(page.get_by_role('status')).to_contain_text('Saved to this browser.')
def checkout(page):
 page.get_by_role('button',name='Add to cart',exact=True).first.click();nav(page,'Checkout (1)');page.get_by_role('button',name='Record simulated receipt').click();expect(page.get_by_role('heading',name='Simulated receipts',exact=True)).to_be_visible()
def stored(page): return page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',KEY)

with socket.socket() as probe:
 try: probe.bind(('127.0.0.1',5180))
 except OSError: raise SystemExit('Port 5180 is already in use; no existing server was tested or stopped.')
log=(OUT/'preview.log').open('w',encoding='utf-8')
server=subprocess.Popen(['node','node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5180','--strictPort'],cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
try:
 deadline=time.monotonic()+120
 while time.monotonic()<deadline:
  if server.poll() is not None: raise RuntimeError('Owned preview process stopped before readiness.')
  try:
   with urllib.request.urlopen('http://127.0.0.1:5180',timeout=2) as response:
    if response.status==200: break
  except OSError: time.sleep(.2)
 else: raise RuntimeError('Preview did not become ready.')
 with sync_playwright() as pw:
  options={'headless':True}
  if os.environ.get('ASTRA_BROWSER_EXECUTABLE'): options['executable_path']=os.environ['ASTRA_BROWSER_EXECUTABLE']
  browser=pw.chromium.launch(**options)
  def run(name,action):
   context=browser.new_context(viewport={'width':1440,'height':1050},accept_downloads=True)
   page=context.new_page();page.set_default_timeout(60000);page.on('dialog',accept_dialog)
   try:
    page.goto('http://127.0.0.1:5180');expect(page.get_by_role('heading',name='Ideas worth building.')).to_be_visible();action(page,context);results.append({'name':name,'passed':True});print('PASS',name,flush=True)
   except Exception as error:
    results.append({'name':name,'passed':False,'error':str(error)});print('FAIL',name,str(error)[:300],flush=True)
    try: page.screenshot(path=str(OUT/f'failure-{len(results)}.png'),full_page=True)
    except Exception: pass
   finally: context.close()
  def sample(p,c):
   assert p.locator('.product-card').count()==4
   assert p.evaluate('(key)=>localStorage.getItem(key)',KEY) is None
   p.evaluate("localStorage.setItem('buildgum-cart','broken legacy')");p.reload();expect(p.get_by_role('heading',name='Ideas worth building.')).to_be_visible()
   assert p.evaluate("localStorage.getItem('buildgum-cart')")=='broken legacy'
   assert p.evaluate('(key)=>localStorage.getItem(key)',KEY) is None
  run('sample is honestly labelled and legacy storage is untouched',sample)
  def crud(p,c):
   product_form(p);p.get_by_role('button',name='Save product',exact=True).click();saved(p)
   p.get_by_role('button',name='Edit Learning kit',exact=True).click();p.get_by_label('Price in USD').fill('18.95');p.get_by_role('button',name='Save product',exact=True).click();saved(p)
   p.reload();nav(p,'Products');expect(p.locator('.record').filter(has=p.get_by_role('heading',name='Learning kit',exact=True))).to_contain_text('$18.95')
   found=next(x for x in stored(p)['products'] if x['title']=='Learning kit');assert found['version']==2
  run('product create edit cents and reload persistence',crud)
  def archive(p,c):
   nav(p,'Products');p.get_by_role('button',name='Edit Automation Field Manual',exact=True).click();p.get_by_label('Active',exact=True).uncheck();p.get_by_role('button',name='Save product',exact=True).click();saved(p)
   expect(p.get_by_role('heading',name='Automation Field Manual',exact=True)).to_have_count(0)
   p.get_by_label('Product visibility').select_option('archived');p.get_by_role('button',name='Edit Automation Field Manual',exact=True).click();p.get_by_label('Active',exact=True).check();p.get_by_role('button',name='Save product',exact=True).click();saved(p)
   nav(p,'Storefront');expect(p.get_by_role('heading',name='Automation Field Manual',exact=True)).to_be_visible()
  run('archive and restore affect storefront visibility',archive)
  def delete(p,c):
   product_form(p);p.get_by_role('button',name='Save product',exact=True).click();saved(p);p.get_by_role('button',name='Delete Learning kit',exact=True).click();saved(p);expect(p.get_by_role('heading',name='Learning kit',exact=True)).to_have_count(0)
   assert len(stored(p)['products'])==6
  run('confirmed deletion removes an unused product',delete)
  def discounts(p,c):
   nav(p,'Discounts');p.get_by_role('button',name='New discount').click();p.get_by_label('Code',exact=True).fill('learn10');p.get_by_label('Percent').fill('10');p.get_by_role('button',name='Save discount').click();saved(p)
   p.get_by_role('button',name='Edit LEARN10').click();p.get_by_label('Percent').fill('15');p.get_by_role('button',name='Save discount').click();saved(p)
   p.get_by_role('button',name='New discount').click();p.get_by_label('Code',exact=True).fill('learn10');p.get_by_role('button',name='Save discount').click();expect(p.get_by_role('alert')).to_contain_text('Duplicate');expect(p.get_by_label('Code',exact=True)).to_have_value('learn10')
   p.get_by_role('button',name='Close editor').click();p.get_by_role('button',name='Delete LEARN10').click();saved(p);assert len(stored(p)['discounts'])==1
  run('discount CRUD normalization and duplicate draft retention',discounts)
  def receipt(p,c):
   p.get_by_role('button',name='Add to cart',exact=True).first.click();nav(p,'Checkout (1)');p.get_by_label('Quantity for p-automation').fill('2');p.get_by_label('Discount code',exact=True).fill('BUILD20');expect(p.locator('.summary-total')).to_contain_text('$62.40')
   p.get_by_role('button',name='Record simulated receipt').click();expect(p.get_by_role('heading',name='Simulated receipts',exact=True)).to_be_visible();expect(p.locator('.receipt')).to_contain_text('Automation Field Manual x 2 at $39.00 each');assert stored(p)['orders'][0]['quote']['totalCents']==6240
   p.reload();nav(p,'Orders');expect(p.locator('.receipt')).to_have_count(1)
  run('quantity and discount produce a durable exact-cent receipt',receipt)
  def history(p,c):
   checkout(p);nav(p,'Products');p.get_by_role('button',name='Delete Automation Field Manual',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('receipt history')
   p.get_by_role('button',name='Edit Automation Field Manual',exact=True).click();p.get_by_label('Title',exact=True).fill('Changed title');p.get_by_label('Price in USD').fill('99.95');p.get_by_role('button',name='Save product',exact=True).click();saved(p)
   nav(p,'Orders');expect(p.locator('.receipt')).to_contain_text('Automation Field Manual x 1 at $39.00 each');p.get_by_role('button',name='Cancel receipt',exact=True).click();saved(p);expect(p.locator('.receipt')).to_contain_text('Cancelled');expect(p.get_by_role('button',name='Cancel receipt')).to_be_disabled()
  run('receipt snapshots survive catalog edits and cancellation retains history',history)
  def stale(p,c):
   nav(p,'Products');p.get_by_role('button',name='Edit Automation Field Manual',exact=True).click();p.get_by_label('Title',exact=True).fill('My unsaved title')
   other=c.new_page();other.goto('http://127.0.0.1:5180');product_form(other,'Other tab product');other.get_by_role('button',name='Save product',exact=True).click();saved(other)
   p.bring_to_front()
   p.get_by_role('button',name='Save product',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('another tab');expect(p.get_by_label('Title',exact=True)).to_have_value('My unsaved title')
   with p.expect_download() as event:p.get_by_role('button',name='Export draft',exact=True).click()
   assert json.loads(Path(event.value.path()).read_text())['value']['title']=='My unsaved title'
   assert stored(p)['products'][0]['title']=='Automation Field Manual'
  run('stale tab rejects save and exports intact editor draft',stale)
  def quota(p,c):
   p.evaluate("""() => { Storage.prototype.setItem=function(){throw new Error('Simulated quota failure');}; }""")
   product_form(p,'Quota draft');p.get_by_role('button',name='Save product',exact=True).click();expect(p.get_by_role('alert')).to_contain_text('quota failure');expect(p.get_by_label('Title',exact=True)).to_have_value('Quota draft');assert p.evaluate('(key)=>localStorage.getItem(key)',KEY) is None
  run('storage failure does not announce a successful save',quota)
  def lost(p,c):
   p.evaluate("""() => { const original=Storage.prototype.setItem;let once=true;Storage.prototype.setItem=function(k,v){original.call(this,k,v);if(k==='buildgum-workspace-v1'&&once){once=false;throw new Error('Lost acknowledgement after write');}}; }""")
   p.get_by_role('button',name='Add to cart',exact=True).first.click();nav(p,'Checkout (1)');p.get_by_role('button',name='Record simulated receipt').click();expect(p.get_by_role('alert')).to_contain_text('Lost acknowledgement');expect(p.get_by_label('Buyer email')).to_be_disabled();assert len(stored(p)['orders'])==1
   key=stored(p)['orders'][0]['requestKey'];p.get_by_role('button',name='Retry same receipt').click();expect(p.get_by_role('heading',name='Simulated receipts',exact=True)).to_be_visible();assert len(stored(p)['orders'])==1;assert stored(p)['orders'][0]['requestKey']==key
  run('lost acknowledgement retry returns the same single receipt',lost)
  def recovery(p,c):
   p.evaluate('(key)=>localStorage.setItem(key,"{broken")',KEY);p.reload();expect(p.get_by_role('heading',name='Your browser workspace.')).to_be_visible();assert p.evaluate('(key)=>localStorage.getItem(key)',KEY)=='{broken'
   with p.expect_download() as event:p.get_by_role('button',name='Export original stored bytes').click()
   assert Path(event.value.path()).read_text()=='{broken'
   with p.expect_download() as event:p.get_by_role('button',name='Download clean sample backup').click()
   raw=Path(event.value.path()).read_bytes();p.get_by_label('Workspace JSON').set_input_files({'name':'sample.json','mimeType':'application/json','buffer':raw});expect(p.get_by_text('Validated backup:',exact=False)).to_be_visible();assert p.evaluate('(key)=>localStorage.getItem(key)',KEY)=='{broken'
   p.get_by_role('button',name='Replace with reviewed backup').click();expect(p.get_by_role('status')).to_contain_text('Backup restored');assert stored(p)['revision']==1;nav(p,'Storefront');expect(p.locator('.product-card')).to_have_count(4)
  run('corrupt bytes export and explicit reviewed recovery',recovery)
  def invalid(p,c):
   checkout(p);before=p.evaluate('(key)=>localStorage.getItem(key)',KEY);nav(p,'Workspace');p.get_by_label('Workspace JSON').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"schema":1}'});expect(p.get_by_role('alert')).to_be_visible();expect(p.get_by_role('button',name='Replace with reviewed backup')).to_have_count(0);assert p.evaluate('(key)=>localStorage.getItem(key)',KEY)==before
  run('invalid import cannot replace the accepted workspace',invalid)
  def navigation(p,c):
   product_form(p,'Keep this draft')
   # Override the normal accepting handler for this one explicit navigation decision.
   p.remove_listener('dialog',accept_dialog);p.on('dialog',lambda dialog:dialog.dismiss());nav(p,'Storefront');expect(p.get_by_label('Title',exact=True)).to_have_value('Keep this draft')
  run('cancelled navigation preserves the editor',navigation)
  def cart_invalid(p,c):
   p.get_by_role('button',name='Add to cart',exact=True).first.click();nav(p,'Checkout (1)');p.get_by_label('Quantity for p-automation').fill('0');expect(p.get_by_role('button',name='Record simulated receipt')).to_be_disabled();p.get_by_label('Quantity for p-automation').fill('1');p.get_by_label('Discount code',exact=True).fill('NOPE');expect(p.get_by_role('button',name='Record simulated receipt')).to_be_disabled();assert p.evaluate('(key)=>localStorage.getItem(key)',KEY) is None
  run('invalid quantity and unavailable code block checkout',cart_invalid)
  def layouts(p,c):
   for width in [1440,800,390]:
    p.set_viewport_size({'width':width,'height':1050});nav(p,'Storefront');p.screenshot(path=str(OUT/f'storefront-{width}.png'),full_page=True);assert p.evaluate('document.documentElement.scrollWidth<=innerWidth');assert p.locator('nav button').evaluate_all('(buttons)=>buttons.every(b=>b.scrollWidth<=b.clientWidth+1)')
    nav(p,'Products');p.get_by_role('button',name='New product',exact=True).click();p.screenshot(path=str(OUT/f'editor-{width}.png'),full_page=True);assert p.evaluate('document.documentElement.scrollWidth<=innerWidth');assert p.locator('nav button').evaluate_all('(buttons)=>buttons.every(b=>b.scrollWidth<=b.clientWidth+1)');p.get_by_role('button',name='Close editor').click()
   p.get_by_role('textbox',name='Search catalog or receipts').fill('[no match]');expect(p.get_by_text('No products match this filter.',exact=True)).to_be_visible()
  run('desktop mobile layouts and literal empty search',layouts)
  browser.close()
finally:
 server.terminate()
 try:server.wait(timeout=20)
 except subprocess.TimeoutExpired:server.kill();server.wait(timeout=20)
 log.close()
(OUT/'results.json').write_text(json.dumps({'passed':all(r['passed'] for r in results),'total':len(results),'checks':results},indent=2),encoding='utf-8')
raise SystemExit(0 if results and all(r['passed'] for r in results) else 1)
